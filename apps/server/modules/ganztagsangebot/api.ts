import express, { Request, Response } from 'express';
import { DeleteGanztagsangebotRequestBody, DeleteGanztagsangebotResponseBody, Ganztagsangebot, Halbjahr, Schuljahr } from '@thesis/schule';
import { CreateGanztagsangebotRequestBody, CreateGanztagsangebotResponseBody } from '@thesis/schule'
import { getGanztagsangebotStore } from '../../singleton';
import { getNoPermissionResponse, getNoSessionResponse } from '../auth/permissionsUtil';
import { Berechtigung } from '@thesis/rollen';
import { canUserAccessGanztagsangebot, canUserDeleteGanztagsangebot, canUserEditGanztagsangebot } from '../auth/permissionsGanztagsangebotUtil';

let router = express.Router();

router.get('/', async (req, res) => {
    const { schuljahr, halbjahr } = req.query;
    if (typeof schuljahr !== 'string' || typeof halbjahr !== 'string') {
        res.status(400).json({ 
            success: false,
            message: 'Missing or invalid query parameters.' 
        });
        return;
    }
    let msg = await getGanztagsangebotStore().getGanztagsangebote(schuljahr as Schuljahr, halbjahr as Halbjahr)
    const accessChecks = await Promise.all(
        msg.map(async (ganztagsangebot) => {
            const { success } = await canUserAccessGanztagsangebot(
                ganztagsangebot.id ?? -1,
                req,
                schuljahr as Schuljahr,
                halbjahr as Halbjahr,
                ganztagsangebot
            );
            return success ? ganztagsangebot : null;
        })
    );
    const filtered = accessChecks.filter(
        (angebot): angebot is typeof msg[number] => angebot !== null
    );

    res.status(200).json(filtered);
});

router.post('/', async (req: Request<{}, {}, CreateGanztagsangebotRequestBody>, res: Response<CreateGanztagsangebotResponseBody>): Promise<any> => {
    
    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    if (!req.permissions?.[Berechtigung.GanztagsangebotCreate]) {
        return getNoPermissionResponse(res)
    }
    
    let ganztagsangebot = req.body
    ganztagsangebot.schueler = ganztagsangebot.schueler?.filter(item => item !== -1)
    const msg = await getGanztagsangebotStore().createGanztagsangebot(ganztagsangebot)
    res.status(msg.success ? 200 : 400).json(msg);
});

router.get('/:ganztagsangebotId', async (req, res): Promise<any> => {
    const { ganztagsangebotId } = req.params
    const { schuljahr, halbjahr } = req.query;
    const { success: hasPermission } = await canUserAccessGanztagsangebot(parseInt(ganztagsangebotId), req, schuljahr as Schuljahr, halbjahr as Halbjahr)
    if (!hasPermission) {
        return getNoPermissionResponse(res)
    }
    const ganztagsangebot = await getGanztagsangebotStore().getGanztagsangebot(schuljahr as Schuljahr, halbjahr as Halbjahr, parseInt(ganztagsangebotId))
    res.status(ganztagsangebot ? 200 : 500).json(ganztagsangebot);
});

router.put('/:ganztagsangebotId', async (req, res): Promise<any> => {
    const { schuljahr, halbjahr } = req.query;
    const { ganztagsangebotId } = req.query
    const ganztagsangebot = req.body as Ganztagsangebot

    const { success: hasPermission } = await canUserEditGanztagsangebot(parseInt(`${ganztagsangebotId ?? -1}`), req, schuljahr as Schuljahr, halbjahr as Halbjahr)
    if (!hasPermission) {
        return getNoPermissionResponse(res)
    }
    
    ganztagsangebot.schueler = ganztagsangebot.schueler?.filter(item => item !== -1)
    
    const msg = await getGanztagsangebotStore().editGanztagsangebot(schuljahr as Schuljahr, halbjahr as Halbjahr, ganztagsangebot)
    res.status(msg.success ? 200 : 500).json(msg);
});

router.delete('/', async (req: Request<{}, {}, DeleteGanztagsangebotRequestBody>, res: Response<DeleteGanztagsangebotResponseBody>): Promise<any> => {
    const { 
        ganztagsangebotId,
        schuljahr,
        halbjahr
    } = req.body
    const { success: hasPermission } = await canUserDeleteGanztagsangebot(parseInt(`${ganztagsangebotId ?? -1}`), req, schuljahr as Schuljahr, halbjahr as Halbjahr)
    if (!hasPermission) {
        return getNoPermissionResponse(res)
    }

    const msg = await getGanztagsangebotStore().deleteGanztagsangebot(ganztagsangebotId)
    res.status(200).json(msg as DeleteGanztagsangebotResponseBody);
});

export { router };