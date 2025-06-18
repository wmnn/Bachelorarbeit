import express from 'express';
import { getDB } from '../../singleton';
import { Request, Response } from 'express';
import {
    CreateRoleResponseBody,
} from '@thesis/auth';
import { CreateDiagnostikRequestBody, CreateDiagnostikResponseBody, Diagnostik, DiagnostikTyp, Farbbereich } from '@thesis/diagnostik';
import { Berechtigung, BERECHTIGUNGEN_VALUES } from '@thesis/rollen';

let router = express.Router();
const SUCCESSFULL_VALIDATION_RES =  {
    success: true,
    message: 'Die Validierung war erfolgreich.'
}

router.post('/',async (
    req: Request<{}, {}, CreateDiagnostikRequestBody>,
    res: Response<CreateDiagnostikResponseBody>
): Promise<any> => {
    if (!req.userId) {
        return;
    }
    const diagnostik = req.body
    const { name, speicherTyp, klasseId, vorlageId, erstellungsTyp, obereGrenze, untereGrenze } = diagnostik
    
    // Name
    if (!name || name == '') {
        res.status(400).json({
            success: false,
            message: 'Eine Diagnostik muss einen Namen haben.'
        });
        return
    }

    if (speicherTyp !== DiagnostikTyp.VORLAGE && speicherTyp !== DiagnostikTyp.LAUFENDES_VERFAHREN) {
        return res.status(400).json({
            success: false,
            message: 'Es wurde ein ungültiger Speichertyp definiert.'
        });
    }

    // Klasse
    if (speicherTyp === DiagnostikTyp.LAUFENDES_VERFAHREN) {
        if (!klasseId || klasseId === -1) {
            return res.status(400).json({
                success: false,
                message: 'Eine Diagnostik muss für eine Klasse erstellt werden.'
            });
        }
        if (erstellungsTyp === 'Vorlage' && (!vorlageId || vorlageId === -1)) {
            return res.status(400).json({
                success: false,
                message: 'Es muss eine Vorlage ausgewählt werden.'
            });
        }
        if (erstellungsTyp === 'benutzerdefiniert') {
            const validierungGrenzenRes = validierungGrenzen(diagnostik);
            if (!validierungGrenzenRes.success) {
                return res.status(400).json(validierungGrenzenRes)
            }

            const validierungFarbbereicheRes = validierungFarbbereiche(diagnostik)
            if (!validierungFarbbereicheRes.success) {
                return res.status(400).json(validierungFarbbereicheRes)
            }
        }
        
    }
   
    if (speicherTyp === DiagnostikTyp.VORLAGE) {
        if (klasseId && klasseId !== -1) {
            return res.status(400).json({
                success: false,
                message: 'Bei einer Vorlage darf keine Klasse ausgewählt sein.'
            });
        }
        
        // Erstellungstyp
        if (erstellungsTyp === 'Vorlage') {
            return res.status(400).json({
                success: false,
                message: 'Eine Vorlage muss benutzerdefiniert sein.'
            });
        }

        const validierungGrenzenRes = validierungGrenzen(diagnostik);
        if (!validierungGrenzenRes.success) {
            return res.status(400).json(validierungGrenzenRes)
        }

        const validierungFarbbereicheRes = validierungFarbbereiche(diagnostik)
        if (!validierungFarbbereicheRes.success) {
            return res.status(400).json(validierungFarbbereicheRes)
        }
    }
    const msg = await getDB().createDiagnostik(req.userId, diagnostik)
    res.status(msg.success ? 200 : 400).json(msg);
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
    if (farbbereiche.filter(item => item.obereGrenze === undefined).length !== 1) {
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

export { router };
