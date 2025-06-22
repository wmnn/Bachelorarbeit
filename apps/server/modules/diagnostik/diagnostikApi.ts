import express from 'express';
import { Request, Response } from 'express';
import { AddErgebnisseResponseBody, CreateDiagnostikRequestBody, CreateDiagnostikResponseBody, Diagnostik, DiagnostikTyp, Ergebnis, Farbbereich, GetDiagnostikenResponseBody } from '@thesis/diagnostik';
import { getDiagnostikStore } from '../../singleton';

let router = express.Router();
const SUCCESSFULL_VALIDATION_RES =  {
    success: true,
    message: 'Die Validierung war erfolgreich.'
}

router.get('/', async (
    req: Request<{}, {}, {}, { typ?: string }>,
    res: Response<GetDiagnostikenResponseBody>
): Promise<any> => { 
    let speicherTyp: DiagnostikTyp = DiagnostikTyp.LAUFENDES_VERFAHREN;

    if (req.query.typ) {
        const typ = parseInt(req.query.typ); 
        if (!isNaN(typ)) {
            speicherTyp = typ as DiagnostikTyp;
        }
    }

    const data = await getDiagnostikStore().getDiagnostiken(speicherTyp);
    return res.status(data.success ? 200 : 400).json(data.data ?? []);
});

router.get('/:diagnostikId', async (req, res) => {
    const { diagnostikId } = req.params
    const diagnostik = await getDiagnostikStore().getDiagnostik(parseInt(diagnostikId))
    res.status(diagnostik ? 200 : 400).json(diagnostik);
});

router.get('/:diagnostikId/data', async (req, res) => {
    const { diagnostikId } = req.params
    const diagnostik = await getDiagnostikStore().getErgebnisse(parseInt(diagnostikId))
    res.status(diagnostik ? 200 : 400).json(diagnostik);
});

router.post('/:diagnostikId', async (req, res: Response<AddErgebnisseResponseBody>): Promise<any> => {
    const { diagnostikId } = req.params
    let ergebnisse: Ergebnis[] = req.body ?? []
    let { datum } = req.query;

    if (Array.isArray(datum)) {
        datum = datum[0]; 
    }

    if (typeof datum !== 'string') {
        datum = '';
    }

    datum = datum.split('T')[0];

    if (!isValidDateFormat(datum as string | undefined ?? '')) {
        return res.status(400).json({
            success: false,
            message: 'Es wurde kein korrektes Datum spezifiziert.'
        })
    }

    const diagnostik = await getDiagnostikStore().getDiagnostik(parseInt(diagnostikId))
    let isValidData = true;
    for (const ergebnis of ergebnisse) {
        if (diagnostik?.obereGrenze === undefined || diagnostik.untereGrenze === undefined) {
            isValidData = false
            break;
        }
        if (parseInt(ergebnis.ergebnis) > parseInt(`${diagnostik?.obereGrenze}`) || parseInt(ergebnis.ergebnis) < parseInt(`${diagnostik.untereGrenze}`)) {
            isValidData = false
            break;
        }
    }

    if (!isValidData) {
        return res.status(400).json({
            success: false,
            message: `Die obere Grenze für Ergebnisse ist "${diagnostik?.obereGrenze}" und die untere Grenze ist "${diagnostik?.untereGrenze}"`
        })
    }

    ergebnisse = ergebnisse.filter(item => item.ergebnis !== '')

    const msg = await getDiagnostikStore().addErgebnisse(ergebnisse, parseInt(diagnostikId), datum)
    res.status(msg.success ? 200 : 400).json(msg);
});

function isValidDateFormat(dateStr: string) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateStr);
}

function validateDiagnostikInput(
  diagnostik: CreateDiagnostikRequestBody,
  userId?: number
): { success: boolean; message?: string } {
    let { name, speicherTyp, klasseId, vorlageId, erstellungsTyp } = diagnostik;
    speicherTyp = typeof speicherTyp === 'string' ? parseInt(speicherTyp as string) : speicherTyp

    if (!userId) {
        return { 
            success: false, 
            message: 'Kein Benutzer identifiziert.' 
        };
    }

    if (!name || name.trim() === '') {
        return { 
            success: false, 
            message: 'Eine Diagnostik muss einen Namen haben.' 

        };
    }

    if (![DiagnostikTyp.VORLAGE, DiagnostikTyp.LAUFENDES_VERFAHREN].includes(speicherTyp)) {
        return { 
            success: false, 
            message: 'Es wurde ein ungültiger Speichertyp definiert.' 
        };
    }

    if (speicherTyp === DiagnostikTyp.LAUFENDES_VERFAHREN) {
        if (!klasseId || klasseId === -1) {
            return { 
                success: false, 
                message: 'Eine Diagnostik muss für eine Klasse erstellt werden.' 

            };
        }

        if (erstellungsTyp === 'Vorlage' && (!vorlageId || vorlageId === -1)) {
            return { 
                success: false, 
                message: 'Es muss eine Vorlage ausgewählt werden.' 

            };
        }

        if (erstellungsTyp === 'benutzerdefiniert') {
            const grenzen = validierungGrenzen(diagnostik);
            if (!grenzen.success) return grenzen;

            const farben = validierungFarbbereiche(diagnostik);
            if (!farben.success) return farben;
        }
    }

    if (speicherTyp === DiagnostikTyp.VORLAGE) {
        if (klasseId && klasseId !== -1) {
            return { 
                success: false, 
                message: 'Bei einer Vorlage darf keine Klasse ausgewählt sein.' 
            };
        }

        if (erstellungsTyp === 'Vorlage') {
            return { 
                success: false, 
                message: 'Eine Vorlage muss benutzerdefiniert sein.' 
            };
        }

        const grenzen = validierungGrenzen(diagnostik);
        if (!grenzen.success) return grenzen;

        const farben = validierungFarbbereiche(diagnostik);
        if (!farben.success) return farben;
    }

    return { success: true };
}

router.put('/sichtbarkeit', async (req, res): Promise<any> => {
    const {
        diagnostikId, sichtbarkeit
    } = req.query as {
        diagnostikId: string,
        sichtbarkeit: string
    }

    const msg = await getDiagnostikStore().updateSichtbarkeit(parseInt(diagnostikId), parseInt(sichtbarkeit));
    res.status(msg.success ? 200 : 400).json(msg);
});

router.post('/', async (
    req: Request<{}, {}, CreateDiagnostikRequestBody>,
    res: Response<CreateDiagnostikResponseBody>
): Promise<any> => {
    if (!req.userId) {
        return;
    }
    const diagnostik = req.body;
    const validation = validateDiagnostikInput(diagnostik, req.userId);

    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: validation.message ?? 'Ungültige Eingabe.'
        });
    }
  
    const msg = await getDiagnostikStore().createDiagnostik(req.userId, diagnostik)
    res.status(msg.success ? 200 : 400).json(msg);
});

router.put('/', async (
    req: Request<{}, {}, CreateDiagnostikRequestBody>,
    res: Response<CreateDiagnostikResponseBody>
): Promise<any> => {
    const diagnostik = req.body;
    const validation = validateDiagnostikInput(diagnostik, req.userId);

    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: validation.message ?? 'Ungültige Eingabe.'
        });
    }

    const msg = await getDiagnostikStore().editDiagnostik(req.userId!, diagnostik);
    return res.status(msg.success ? 200 : 400).json(msg);
});

function validierungGrenzen(diagnostik: Diagnostik): CreateDiagnostikResponseBody {
    const { obereGrenze, untereGrenze } = diagnostik
    const parsedObereGrenze = parseInt(`${obereGrenze}`)
    const parsedUntereGrenze = parseInt(`${untereGrenze}`)
    if (obereGrenze === undefined || parsedObereGrenze < 0) {
        return {
            success: false,
            message: 'Es wurde eine ungültige obere Grenze definiert.'
        }
    }
    if (untereGrenze === undefined || parsedUntereGrenze < 0) {
        return {
            success: false,
            message: 'Es wurde eine ungültige untere Grenze definiert.'
        }
    }
    if (parsedUntereGrenze > parsedObereGrenze) {
        return {
            success: false,
            message: 'Die untere Grenze muss größer sein, als die obere Grenze.'
        }
    }
    return SUCCESSFULL_VALIDATION_RES
}

function validierungFarbbereiche(diagnostik: Diagnostik): CreateDiagnostikResponseBody {
    const { farbbereiche } = diagnostik
    if (!farbbereiche) {
        return {
            success: false,
            message: 'Es müssen Farbbereiche defniniert sein.'
        }
    }
    if (farbbereiche.length == 1) {
        return {
            success: false,
            message: 'Es wurde kein Mindeststandard definiert.'
        }
    }
    if (farbbereiche.filter(item => [undefined, '', 'undefined', null, diagnostik.obereGrenze, `${diagnostik.obereGrenze}`].includes(item.obereGrenze as any)).length !== 1 ) {
        return {
            success: false,
            message: 'Ein Farbbereich muss undefiniert sein.'
        }
    }

    const hexCount: Record<string, number> = {};
    for (const item of farbbereiche) {
        hexCount[item.hexFarbe] = (hexCount[item.hexFarbe] || 0) + 1;
    }

    const hasDuplicateHex = Object.values(hexCount).some(count => count > 1);
    if (hasDuplicateHex) {
        return {
            success: false,
            message: 'Jede Farbe darf nur einmal vergeben werden.'
        };
    }
    return SUCCESSFULL_VALIDATION_RES
}

router.delete('/:diagnostikId', async (req, res: Response): Promise<any> => {
    const { diagnostikId } = req.params
    const msg = await getDiagnostikStore().deleteDiagnostik(diagnostikId)
    res.status(msg.success ? 200 : 400).json(msg);
});

export { router };
