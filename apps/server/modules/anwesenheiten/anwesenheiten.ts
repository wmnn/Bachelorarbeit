import express, { Request, Response } from 'express';
import { getDB } from '../../singleton';
import { DeleteStatusReqBody, type UpdateStatusReqBody } from '@thesis/anwesenheiten'

let router = express.Router();

router.put('/', async (req: Request<{}, {}, UpdateStatusReqBody>, res) => {
    const { status, typ, datum, schuelerId } = req.body
    const msg = await getDB().updateAnwesenheitsstatus(parseInt(schuelerId), typ, status, datum)
    res.status(200).json(msg);
});

router.delete('/', async (req: Request<{}, {}, DeleteStatusReqBody>, res) => {
    const { typ, datum, schuelerId } = req.body
    const msg = await getDB().deleteAnwesenheitsstatus(schuelerId, typ, datum)
    res.status(200).json(msg);
});



export { router };