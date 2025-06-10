import express, { Request, Response } from 'express';
import { getDB } from '../../singleton';
import { CreateSchuelerRequestBody, DeleteSchuelerRequestBody, DeleteSchuelerResponseBody, EditSchuelerRequestBody } from '@thesis/schueler';

let router = express.Router();

router.post('/', async (req: Request<{}, {}, CreateSchuelerRequestBody>, res) => {

    const schueler = req.body;
    const msg = await getDB().createSchueler(schueler)
    res.status(200).json(msg);
});

router.get('/', async (req, res) => {
    const msg = await getDB().getSchueler()
    res.status(200).json(msg);
});

router.put('/:schuelerId', async (req: Request<{ schuelerId: string }, {}, EditSchuelerRequestBody>, res) => {
    const schueler = req.body
    const { schuelerId } = req.params
    schueler.id = parseInt(schuelerId);
    const msg  = await getDB().editSchueler(schueler)
    res.status(msg.success ? 200 : 400).json(msg);
});

router.get('/:schuelerId', async (req, res) => {
    const { schuelerId } = req.params
    const msg = await getDB().getSchuelerComplete(parseInt(schuelerId))
    res.status(200).json(msg);
});

router.delete('/', async (req: Request<{}, {}, DeleteSchuelerRequestBody>, res: Response<DeleteSchuelerResponseBody>) => {
    const schuelerId = req.body.schuelerId
    const msg = await getDB().deleteSchueler(schuelerId)
    res.status(200).json(msg as DeleteSchuelerResponseBody);
});


export { router };