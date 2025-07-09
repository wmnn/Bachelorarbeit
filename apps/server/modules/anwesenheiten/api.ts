import express, { Request, Response } from 'express';
import { AnwesenheitTyp, DeleteStatusReqBody, UpdateStatusBatchReqBody, type UpdateStatusReqBody } from '@thesis/anwesenheiten'
import { Schuljahr } from '@thesis/schule';
import { getAnwesenheitenStore } from '../../singleton';
import { getNoPermissionResponse, getNoSessionResponse } from '../auth/permissionsUtil';
import { Berechtigung } from '@thesis/rollen';

let router = express.Router();

router.put('/', async (req: Request<{}, {}, UpdateStatusBatchReqBody>, res): Promise<any> => {
    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    if (!req.permissions?.[Berechtigung.AnwesenheitsstatusUpdate]) {
        return getNoPermissionResponse(res)
    }

    const { schuelerIds, status, typ, startDatum, endDatum } = req.body
    let someError = false;
    for (const id of schuelerIds) {
        const msg = await getAnwesenheitenStore().updateAnwesenheitsstatus(id, typ, status, startDatum, endDatum)
        if (!msg.success) {
            someError = true
        }
    }
    
    res.status(someError ? 400 : 200).json(someError ? {
        success: false,
        message: 'Ein Fehler ist aufgetreten, kontaktiere einen Admin.'
    } : {
        success: true,
        message: 'Alle ungerüften Anwesenheiten wurden auf geprüft gesetzt.'
    });
});

router.put('/:schuelerId', async (req: Request<any, {}, UpdateStatusReqBody>, res): Promise<any> => {
    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    if (!req.permissions?.[Berechtigung.AnwesenheitsstatusUpdate]) {
        return getNoPermissionResponse(res)
    }

    const { status, typ, startDatum, endDatum } = req.body
    const { schuelerId } = req.params
    const msg = await getAnwesenheitenStore().updateAnwesenheitsstatus(parseInt(schuelerId), typ, status, startDatum, endDatum)
    res.status(200).json(msg);
});

router.get('/:schuelerId', async (req: Request<any, {}, UpdateStatusReqBody>, res): Promise<any> => {
    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    if (!req.permissions?.[Berechtigung.AnwesenheitsstatusRead]) {
        return getNoPermissionResponse(res)
    }

    const { schuelerId } = req.params
    const { schuljahr, typ } = req.query

    const msg = await getAnwesenheitenStore().getAnwesenheiten(parseInt(schuelerId), schuljahr as Schuljahr, parseInt(typ as string) as AnwesenheitTyp)
    console.log(msg)
    res.status(200).json(msg);
});

router.delete('/', async (req: Request<{}, {}, DeleteStatusReqBody>, res): Promise<any> => {
    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    if (!req.permissions?.[Berechtigung.AnwesenheitsstatusUpdate]) {
        return getNoPermissionResponse(res)
    }

    const { typ, datum, schuelerId } = req.body
    const msg = await getAnwesenheitenStore().deleteAnwesenheitsstatus(schuelerId, typ, datum)
    res.status(200).json(msg);
});



export { router };