import express from 'express';
import { Request, Response } from 'express';
import { AddErgebnisseResponseBody, CreateDiagnostikRequestBody, CreateDiagnostikResponseBody, Diagnostik, DiagnostikenSchuelerData, DiagnostikTyp, Ergebnis, Farbbereich, getDiagnostik, GetDiagnostikenResponseBody, GetSchuelerDataResponseBody, Sichtbarkeit } from '@thesis/diagnostik';
import { getDiagnostikStore } from '../../singleton';
import { deleteNotIncludedFiles, getDiagnostikFiles, saveDiagnostikFiles } from '../files/util';
import fileUpload from 'express-fileupload';
import { Berechtigung, BerechtigungWert } from '@thesis/rollen';
import { canEditDiagnostik, canUserAccessDiagnostik, canUserCreateDiagnostik, canUserDeleteDiagnostik, canUserUpdateSichtbarkeit } from '../auth/permissionsDiagnostikUtil';
import { getNoSessionResponse } from '../auth/permissionsUtil';
import { getKlassenIdsVonSchueler } from '../klassen/util';
import { DiagnostikStore } from './DiagnostikStore';

let router = express.Router();
const SUCCESSFULL_VALIDATION_RES =  {
    success: true,
    message: 'Die Validierung war erfolgreich.'
}

router.get('/', async (
    req: Request<{}, {}, {}, { typ?: string }>,
    res: Response<GetDiagnostikenResponseBody>
): Promise<any> => {
    if (!req.userId) {
        return getNoSessionResponse(res)
    }
    const permission = req.permissions?.[Berechtigung.DiagnostikverfahrenRead]
    const allowed: BerechtigungWert<Berechtigung.DiagnostikverfahrenRead>[] = ['alle', 'eigene'] 
    if (!permission || !allowed.includes(permission)) {
        return res.status(401).json([]);
    }

    let speicherTyp: DiagnostikTyp = DiagnostikTyp.LAUFENDES_VERFAHREN;

    if (req.query.typ) {
        const typ = parseInt(req.query.typ); 
        if (!isNaN(typ)) {
            speicherTyp = typ as DiagnostikTyp;
        }
    }

    if (speicherTyp === DiagnostikTyp.GETEILT) {
        let query = await getDiagnostikStore().getDiagnostiken(DiagnostikTyp.LAUFENDES_VERFAHREN);
        if (!query.success || query.data == null) {
            return;
        }
        let diagnostiken = query.data
        const shared = await getDiagnostikStore().getDiagnostikenGeteilt(req.userId ?? -1)
        if (!shared.success || shared.data == null) {
            return;
        }
        return res.status(200).json(diagnostiken.filter(diagnostik => shared.data.includes(diagnostik.id ?? -1)));
    }

    let data = await getDiagnostikStore().getDiagnostiken(speicherTyp);
    if (permission == 'eigene' && speicherTyp === DiagnostikTyp.LAUFENDES_VERFAHREN) {
        data.data = data.data?.filter(o => o.userId == req.userId) ?? []
    }
    if (permission == 'eigene' && speicherTyp === DiagnostikTyp.VORLAGE) {
        data.data = data.data?.filter(o => o.sichtbarkeit == Sichtbarkeit.ÖFFENTLICH || o.userId == req.userId) ?? []
    }
    return res.status(data.success ? 200 : 400).json(data.data ?? []);
});

router.get('/schueler', async (req, res: Response<GetSchuelerDataResponseBody>): Promise<any> => {
    const { schuelerId: schuelerIdString } = req.query as {
        schuelerId: string
    }
    const schuelerId = parseInt(schuelerIdString)
    if (!req.userId) {
        return getNoSessionResponse(res)
    }
    // Alle klassenIds von den Klassenversionen anfragen, bei denen der Schüler ein Teil von ist
    const klassenIds = await getKlassenIdsVonSchueler(schuelerId)
    // Alle Diagnostiken die für die Klassen erstellt wurden anfragen
    let { data: unfilteredDiagnostiken } = await getDiagnostikStore().getDiagnostiken(DiagnostikTyp.LAUFENDES_VERFAHREN)
    // unfilteredDiagnostiken = [...unfilteredDiagnostiken, await getDiagnostikStore().getDiagnostiken(DiagnostikTyp.)]
    let filteredDiagnostiken: DiagnostikenSchuelerData[] = (unfilteredDiagnostiken?.filter(diagnostik => klassenIds.includes(diagnostik.klasseId)) ?? []) 

    // Schülerdaten der Diagnostik anfragen
    for (const diagnostik of filteredDiagnostiken) {
        const getErgebnisseRes = await getDiagnostikStore().getErgebnisse(diagnostik.id ?? -1)
        if (!Array.isArray(getErgebnisseRes)) return;
        diagnostik.ergebnisse = getErgebnisseRes.filter(row => row.schuelerId == schuelerId)
    }

    return res.status(200).json({
        success: true,
        message: 'Erfolgreich die Daten des Schülers angefragt.',
        data: filteredDiagnostiken,
    })

})

router.get('/:diagnostikId', async (req, res): Promise<any> => {
    const { diagnostikId } = req.params
    if (!req.userId) {
        return getNoSessionResponse(res)
    }
    const { success, diagnostik } = await canUserAccessDiagnostik(diagnostikId, req)
    if (!success) {
        return res.status(401).json(undefined);
    }
    return res.status(success ? 200 : 400).json(diagnostik);
});

router.get('/:diagnostikId/data', async (req, res): Promise<any> => {
    const { diagnostikId } = req.params
    if (!req.userId) {
        return getNoSessionResponse(res)
    }
    const { success, diagnostik } = await canUserAccessDiagnostik(diagnostikId, req)
    if (!success) {
        return res.status(401).json(undefined);
    }
    const ergebnisse = await getDiagnostikStore().getErgebnisse(parseInt(diagnostikId))
    res.status(diagnostik ? 200 : 400).json(ergebnisse);
});

router.post('/auswertungsgruppen/:diagnostikId', async (req, res: Response<AddErgebnisseResponseBody>): Promise<any> => {
    let { diagnostikId: diagnostikIdString } = req.params
    const diagnostikId = parseInt(diagnostikIdString)
    if (!req.userId) {
        return getNoSessionResponse(res)
    }
    const { success } = await canUserAccessDiagnostik(`${diagnostikId}`, req)
    if (!success) {
        return res.status(401).json(undefined);
    }
    const auswertungsgruppen = req.body
    const msg = await getDiagnostikStore().updateAuswertungsgruppen(diagnostikId, auswertungsgruppen)
    res.status(msg.success ? 200 : 400).json(msg);
});

router.post('/copy/:diagnostikId', async (req, res: Response<AddErgebnisseResponseBody>): Promise<any> => {
    let { diagnostikId: diagnostikIdString } = req.params
    const diagnostikId = parseInt(diagnostikIdString)
    if (!req.userId) {
        return getNoSessionResponse(res)
    }
    const { success } = await canUserAccessDiagnostik(`${diagnostikId}`, req)
    if (!success) {
        return res.status(401).json(undefined);
    }

    let diagnostik = await getDiagnostikStore().getDiagnostik(diagnostikId)
    if (!req.userId) {
        return;
    }
    if (!diagnostik) {
        return;
    }

    diagnostik = {
        ...diagnostik,
        userId: req.userId
    }

    const ergebnisse = await getDiagnostikStore().getErgebnisse(diagnostikId)
    if (!Array.isArray(ergebnisse)) {
        return;
    }
    
    const msg = await getDiagnostikStore().createDiagnostik(req.userId, diagnostik)
    if (!msg.success) {
        return;
    }
   
    const files = await getDiagnostikFiles(diagnostik.id ?? -1)
    const { success: copyErgebnisseSuccess } = await getDiagnostikStore().copyErgebnisse(diagnostik.id ?? -1, msg.diagnostikId ?? -1)
    await saveDiagnostikFiles(msg.diagnostikId ?? -1, files)

    if (!copyErgebnisseSuccess) {
        return;
    }

    res.status(msg.success ? 200 : 400).json({
        success: true,
        message: 'Die Diagnostik wurde erfolgreich kopiert'
    });
});

/**
 * Update / add ergebnisse
 */
router.post('/:diagnostikId', async (req, res: Response<AddErgebnisseResponseBody>): Promise<any> => {
    const { diagnostikId } = req.params
    const { success } = await canUserAccessDiagnostik(`${diagnostikId}`, req)
    if (!req.userId) {
        return getNoSessionResponse(res)
    }
    if (!success) {
        return res.status(401).json(undefined);
    }

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

    // ergebnisse = ergebnisse.filter(item => item.ergebnis !== '')

    const msg = await getDiagnostikStore().addErgebnisse(ergebnisse, parseInt(diagnostikId), datum)
    res.status(msg.success ? 200 : 400).json(msg);
});

function isValidDateFormat(dateStr: string) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateStr);
}

function validateDiagnostikInput(
  diagnostik: Diagnostik,
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
    if (!req.userId) {
        return getNoSessionResponse(res)
    }
    const { success } = await canUserUpdateSichtbarkeit(req)
    if (!success) {
        return res.status(401).json(undefined);
    }

    const msg = await getDiagnostikStore().updateSichtbarkeit(parseInt(diagnostikId), parseInt(sichtbarkeit));
    res.status(msg.success ? 200 : 400).json(msg);
});

function handleFileAttachments(rawFiles: fileUpload.UploadedFile | fileUpload.UploadedFile[] | undefined) {
    const uploadedFiles = Array.isArray(rawFiles)
    ? rawFiles
    : rawFiles
        ? [rawFiles]
        : [];

    const files = uploadedFiles
    .filter(file => file && file.name && file.data)
    .map(file => ({
        name: file.name,
        size: file.size,
        mimetype: file.mimetype,
        data: file.data,
    }));
    return files;
}
/**
 * Create diagnostik endpoint
 */
router.post('/', async (
    req: Request<{}, {}, CreateDiagnostikRequestBody>,
    res: Response<CreateDiagnostikResponseBody>
): Promise<any> => {
    if (!req.userId) {
        return getNoSessionResponse(res)
    }
    const { success } = await canUserCreateDiagnostik(req)
    if (!success) {
        return res.status(401).json({
                success: false,
                message: 'Deine Berechtigungen reichen nicht aus.'
        });
    }
    let diagnostik: Diagnostik = JSON.parse(req.body.diagnostik);
    const files = handleFileAttachments(req.files?.files)
    diagnostik.files = files.map(file => file.name)

    const validation = validateDiagnostikInput(diagnostik, req.userId);

    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: validation.message ?? 'Ungültige Eingabe.'
        });
    }

    if (diagnostik.erstellungsTyp === 'Vorlage') {
        const vorlage = await getDiagnostikStore().getDiagnostik(diagnostik.vorlageId!) 
        if (!vorlage) {
            return res.status(400).json({
                success: false,
                message: 'Die Vorlage konnte nicht gefunden werden.'
            });
        }
        diagnostik = {
            ...vorlage,
            name: diagnostik.name,
            klasseId: diagnostik.klasseId,
            speicherTyp: DiagnostikTyp.LAUFENDES_VERFAHREN
        }
    }
  
    const msg = await getDiagnostikStore().createDiagnostik(req.userId, diagnostik)
    if (msg.success) {
        diagnostik.id = msg.diagnostikId
        await saveDiagnostikFiles(diagnostik.id ?? -1, files)
    }
    res.status(msg.success ? 200 : 400).json(msg);
});

/**
 * Edit diagnostik endpoint
 */
router.put('/', async (
    req: Request<{}, {}, CreateDiagnostikRequestBody>,
    res: Response<CreateDiagnostikResponseBody>
): Promise<any> => {
    let diagnostik: Diagnostik = JSON.parse(req.body.diagnostik);
    const { success } = await canEditDiagnostik(`${diagnostik.id}`, req)

    if (!success) {
        return res.status(401).json({
                success: false,
                message: 'Deine Berechtigungen reichen nicht aus.'
        });
    }
    const files = handleFileAttachments(req.files?.files)
    diagnostik.files = [...diagnostik.files ?? [], ...files.map(file => file.name)]

    const validation = validateDiagnostikInput(diagnostik, req.userId);

    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: validation.message ?? 'Ungültige Eingabe.'
        });
    }

    const msg = await getDiagnostikStore().editDiagnostik(req.userId!, diagnostik);
    if (msg.success) {
        await deleteNotIncludedFiles(diagnostik.id ?? -1, diagnostik.files ?? [])
        await saveDiagnostikFiles(diagnostik.id ?? -1, files)
    }
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
    const { success } = await canUserDeleteDiagnostik(diagnostikId, req)
    if (!success) {
        return res.status(401).json({
            success: false,
            message: 'Deine Berechtigungen reichen nicht aus.'
        });
    }
    const msg = await getDiagnostikStore().deleteDiagnostik(diagnostikId)
    res.status(msg.success ? 200 : 400).json(msg);
});

export { router };
