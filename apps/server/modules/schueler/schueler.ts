import express, { Request } from 'express';
import { getDB } from '../../singleton';
import { CreateSchuelerRequestBody } from '@thesis/schueler';

let router = express.Router();

router.post('/', async (req: Request<{}, {}, CreateSchuelerRequestBody>, res) => {

    const schueler = req.body;
    const msg = await getDB().createSchueler(schueler)
    res.status(200).json(msg);
});

export { router };