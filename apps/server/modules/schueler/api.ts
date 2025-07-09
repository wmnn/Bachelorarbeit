import express, { Request, Response } from 'express';
import { CreateSchuelerRequestBody, DeleteSchuelerRequestBody, DeleteSchuelerResponseBody, EditSchuelerRequestBody } from '@thesis/schueler';
import { getSchuelerStore } from '../../singleton';
import { getNoPermissionResponse, getNoSessionResponse } from '../auth/permissionsUtil';
import { Berechtigung } from '@thesis/rollen';

let router = express.Router();

router.post('/', async (req: Request<{}, {}, CreateSchuelerRequestBody>, res): Promise<any> => {

    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    if (!req.permissions?.[Berechtigung.SchuelerCreate]) {
        return getNoPermissionResponse(res)
    }
    
    const schueler = req.body;
    const msg = await getSchuelerStore().createSchueler(schueler)
    res.status(200).json(msg);
});

router.get('/', async (req, res): Promise<any> => {

    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    if (!req.permissions?.[Berechtigung.SchuelerRead]) {
        return getNoPermissionResponse(res)
    }

    let schueler = await getSchuelerStore().getSchueler()

    if (!req.permissions?.[Berechtigung.AnwesenheitsstatusRead]) {
        schueler = schueler.map(s => {
            let tmp = {
                ...s
            }
            delete tmp.heutigerGanztagAnwesenheitsstatus
            delete tmp.heutigerSchultagAnwesenheitsstatus
            return tmp
        })
    }
    res.status(200).json(schueler);
});

router.put('/:schuelerId', async (req: Request<{ schuelerId: string }, {}, EditSchuelerRequestBody>, res): Promise<any> => {
    
    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    if (!(req.permissions?.[Berechtigung.SchuelerUpdate] && req.permissions?.[Berechtigung.SchuelerRead])) {
        return getNoPermissionResponse(res)
    }

    const schueler = req.body
    const { schuelerId } = req.params
    schueler.id = parseInt(schuelerId);
    const msg  = await getSchuelerStore().editSchueler(schueler)
    console.log(msg)
    res.status(msg.success ? 200 : 400).json(msg);
});

router.get('/:schuelerId', async (req, res): Promise<any> => {

    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    if (!req.permissions?.[Berechtigung.SchuelerRead]) {
        return getNoPermissionResponse(res)
    }

    const { schuelerId } = req.params
    const msg = await getSchuelerStore().getSchuelerComplete(parseInt(schuelerId))
    // console.log(msg)
    res.status(200).json(msg);
});

router.delete('/', async (req: Request<{}, {}, DeleteSchuelerRequestBody>, res: Response<DeleteSchuelerResponseBody>): Promise<any> => {
    
    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    if (!(req.permissions?.[Berechtigung.SchuelerUpdate] && req.permissions?.[Berechtigung.SchuelerRead])) {
        return getNoPermissionResponse(res)
    }
    
    const schuelerId = req.body.schuelerId
    const msg = await getSchuelerStore().deleteSchueler(schuelerId)
    res.status(200).json(msg as DeleteSchuelerResponseBody);
});


export { router };