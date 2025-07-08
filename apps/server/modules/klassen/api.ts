import express, { Request, Response } from 'express';
import { CreateClassRequestBody, CreateClassResponseBody, DeleteKlasseRequestBody, DeleteKlasseResponseBody, getSchuljahrVorherigesHalbjahr, getVorherigesHalbjahr, Halbjahr, ImportKlasse, ImportKlassenversion, ImportModus, Klasse, KlassenVersion, Schuljahr } from '@thesis/schule';
import { DeleteSchuelerResponseBody } from '@thesis/schueler';
import { getKlassenStore } from '../../singleton';
import { getNoPermissionResponse, getNoSessionResponse } from '../auth/permissionsUtil';
import { Berechtigung } from '@thesis/rollen';
import { canUserAccessClass, canUserDeleteClass, canUserEditClass } from '../auth/permissionsKlassenUtil';

let router = express.Router();

router.get('/', async (req, res) => {
    const { schuljahr, halbjahr } = req.query
    if (typeof schuljahr !== 'string' || typeof halbjahr !== 'string') {
        res.status(400).json({ 
            success: false,
            message: 'Missing or invalid query parameters.' 
        });
        return;
    }
    let klassen = await getKlassenStore().getClasses(schuljahr as Schuljahr, halbjahr as Halbjahr)
    const accessChecks = await Promise.all(
        klassen.map(async (klasse) => {
            const { success } = await canUserAccessClass(
                klasse.id,
                req,
                schuljahr as Schuljahr,
                halbjahr as Halbjahr,
                klasse
            );
            return success ? klasse : null;
        })
    );

    klassen = accessChecks.filter((k): k is typeof klassen[number] => k !== null);

    res.status(200).json(klassen);
});

router.get('/:klassenId', async (req, res): Promise<any> => {
    const { klassenId } = req.params
    const { schuljahr, halbjahr } = req.query;
    const { success: hasPermission} = await canUserAccessClass(parseInt(klassenId), req, schuljahr as Schuljahr, halbjahr as Halbjahr)
    if (!hasPermission) {
        return getNoPermissionResponse(res)
    }
    const klasse = await getKlassenStore().getClass(schuljahr as Schuljahr, halbjahr as Halbjahr, parseInt(klassenId))
    res.status(klasse ? 200 : 500).json(klasse);
});

router.put('/:klassenId', async (req, res): Promise<any> => {

    const { klassenId } = req.params
    const { schuljahr, halbjahr } = req.query;
    const { versionen, klassenlehrer } = req.body

    const { success: hasPermission} = await canUserEditClass(parseInt(klassenId), req, schuljahr as Schuljahr, halbjahr as Halbjahr)
    if (!hasPermission) {
        return getNoPermissionResponse(res)
    }

    const msg = await getKlassenStore().editClass(parseInt(klassenId), versionen, klassenlehrer, schuljahr as Schuljahr, halbjahr as Halbjahr)
    res.status(200).json(msg);
});


router.post('/', async (req: Request<{}, {}, CreateClassRequestBody>, res: Response<CreateClassResponseBody>): Promise<any> => {
    
    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    if (!req.permissions?.[Berechtigung.KlasseCreate]) {
        return getNoPermissionResponse(res)
    }

    const { versionen, klassenlehrer } = req.body
    const msg = await getKlassenStore().createClass(undefined, versionen, klassenlehrer)
    res.status(msg.success ? 200 : 400).json(msg);
});

router.post('/import', async (req: Request<{}, {}, ImportKlasse[]>, res: Response<CreateClassResponseBody>): Promise<any> => {
    
    if (req.permissions?.[Berechtigung.KlasseRead] !== 'alle') {
        return getNoPermissionResponse(res)
    }

    const BAD_REQUEST_RESPONSE = {
        success: false,
        message: 'Ein Fehler ist aufgetreten.'
    }
    const importKlassen = req.body
    const { schuljahr, halbjahr } = req.query as { schuljahr: Schuljahr, halbjahr: Halbjahr}

    let neueKlassen: Klasse[] = []
    const prevSchuljahr = getSchuljahrVorherigesHalbjahr(schuljahr, halbjahr)
    const prevHalbjahr = getVorherigesHalbjahr(halbjahr)


    let prevKlassenTmp = await getKlassenStore().getClasses(prevSchuljahr, prevHalbjahr) as (Klasse | undefined)[]
    // Schüler werden den Klassenversionen hinzugefügt.
    prevKlassenTmp = await Promise.all(
        prevKlassenTmp.map((klasse) =>
            getKlassenStore().getClass(prevSchuljahr, prevHalbjahr, klasse?.id ?? -1)
        )
    );
    let prevKlassen = prevKlassenTmp.filter(klasse => klasse !== undefined) as Klasse[]

    // -------- Zusammenlegung von Klassen ----------------
    // Diese Klassenversionen werden dem prev Array hinzugefügt.

    let zusammenlegungen = importKlassen
        .map(klasse => klasse.versionen.filter((item: ImportKlassenversion) => item.modus === ImportModus.Zusammenlegung))
        .reduce((prev, acc) => {
            prev.push(...acc);
            return prev;
        }, [])
    // Hinzufügen der Schüler zur Zusammenlegung.
    zusammenlegungen = zusammenlegungen.map(item => {
        const klasse = prevKlassen.find(klasse => klasse?.id === item.klassenId)
        const version = klasse?.versionen.find(version => version.klassenstufe === item.klassenstufe)

        return {
            ...item,
            schueler: version?.schueler ?? []
        }
    })
    if (zusammenlegungen.some(item => item.schueler?.length === 0)) {
        res.status(400).json(BAD_REQUEST_RESPONSE)
        return;
    }

    // Hinzufügen der Zusammenlegung zur Klasse
    for (const zusammenlegung of zusammenlegungen) {
        prevKlassen = prevKlassen.map(item => {
            if (!item.versionen.some(
                    (version: KlassenVersion) => version.klassenstufe === zusammenlegung.neueKlassenstufe && 
                    version.zusatz === zusammenlegung.neuerZusatz
                )
            ) {
                return item;
            }

            const neueVersionen = item?.versionen.map(version => {
                if (version.klassenstufe !== zusammenlegung.neueKlassenstufe) {
                    return version;
                }
                return {
                    ...version,
                    schueler: [
                        ...version.schueler ?? [],
                        ...zusammenlegung.schueler ?? []
                    ]
                }
            })

            return {
                ...item,
                versionen: neueVersionen ?? []
            }
        })
    }

    // -------- Import von Klassen in höhere Klassenstufen ----------------

    for (const importKlasse of importKlassen) {
        const { id } = importKlasse

        // Überprüfung, ob eine vorherige Klasse existiert.
        const prevKlasse = prevKlassen.find(item => item?.id == importKlasse.id)
        if (!prevKlasse) {
            res.status(400).json(BAD_REQUEST_RESPONSE)
            return;
        }

        let neueKlassenVersionen = []
        for (const klassenVersion of importKlasse.versionen) {
            if (klassenVersion.modus === ImportModus.KeineKlasse) {
                continue;
            }
            if (klassenVersion.modus === ImportModus.Import) {
                const prevKlassenVersion = prevKlasse?.versionen.find(item => item.klassenstufe === klassenVersion.klassenstufe)
                if (!prevKlassenVersion) {
                    res.status(400).json(BAD_REQUEST_RESPONSE)
                    return;
                }
        
                neueKlassenVersionen.push({
                    ...prevKlassenVersion,
                    klassenstufe: klassenVersion.neueKlassenstufe,
                    zusatz: klassenVersion.neuerZusatz,
                    schuljahr, 
                    halbjahr
                })
                continue;
            }
            if (klassenVersion.modus === ImportModus.Zusammenlegung) {
                // Wurde vorher schon berücksichtigt.
                continue;
            }
            res.status(400).json(BAD_REQUEST_RESPONSE)
            return;
        }
        if (neueKlassenVersionen.length == 0) {
            continue;
        }
        
        if (neueKlassen.some(item => item.id === importKlasse.id)) {
            neueKlassen.map(item => {
                if (item.id !== importKlasse.id) {
                    return item;
                }
                return {
                    ...item,
                    versionen: [...item.versionen, ...neueKlassenVersionen]
                }
            })
        } else {
            neueKlassen.push({
                id,
                klassenlehrer: prevKlasse.klassenlehrer,
                versionen: neueKlassenVersionen
            })
        }  
    }

    let success = true
    for (const klasse of neueKlassen) {
        const msg = await getKlassenStore().createClass(klasse.id, klasse.versionen, klasse.klassenlehrer ?? [])
        if (!msg.success) {
            success = false
        }
    }

    res.status(500).json({
        success: success,
        message: success ? 'Die Klassen wurden erfolgreich importiert.' : 'Ein Fehler ist aufgetreten.'
    })
});

router.delete('/', async (req: Request<{}, {}, DeleteKlasseRequestBody>, res: Response<DeleteKlasseResponseBody>): Promise<any> => {    
    const { klassenId, schuljahr, halbjahr } = req.body

    const { success: hasPermission} = await canUserDeleteClass(klassenId, req, schuljahr as Schuljahr, halbjahr as Halbjahr)
    if (!hasPermission) {
        return getNoPermissionResponse(res)
    }

    const msg = await getKlassenStore().deleteClass(klassenId, schuljahr, halbjahr)
    res.status(200).json(msg as DeleteSchuelerResponseBody);
});

export { router };