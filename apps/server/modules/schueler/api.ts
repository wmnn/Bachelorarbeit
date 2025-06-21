import express, { Request, Response } from 'express';
import { CreateSchuelerRequestBody, DeleteSchuelerRequestBody, DeleteSchuelerResponseBody, EditSchuelerRequestBody } from '@thesis/schueler';
import { getSchuelerStore } from '../../singleton';

let router = express.Router();

router.post('/', async (req: Request<{}, {}, CreateSchuelerRequestBody>, res) => {

    const schueler = req.body;
    const msg = await getSchuelerStore().createSchueler(schueler)
    res.status(200).json(msg);
});

router.get('/', async (req, res) => {
    const msg = await getSchuelerStore().getSchueler()
    res.status(200).json(msg);
});

router.put('/:schuelerId', async (req: Request<{ schuelerId: string }, {}, EditSchuelerRequestBody>, res) => {
    const schueler = req.body
    const { schuelerId } = req.params
    schueler.id = parseInt(schuelerId);
    const msg  = await getSchuelerStore().editSchueler(schueler)
    res.status(msg.success ? 200 : 400).json(msg);
});

router.get('/:schuelerId', async (req, res) => {
    const { schuelerId } = req.params
    const msg = await getSchuelerStore().getSchuelerComplete(parseInt(schuelerId))
    res.status(200).json(msg);
});

router.delete('/', async (req: Request<{}, {}, DeleteSchuelerRequestBody>, res: Response<DeleteSchuelerResponseBody>) => {
    const schuelerId = req.body.schuelerId
    const msg = await getSchuelerStore().deleteSchueler(schuelerId)
    res.status(200).json(msg as DeleteSchuelerResponseBody);
});


export { router };