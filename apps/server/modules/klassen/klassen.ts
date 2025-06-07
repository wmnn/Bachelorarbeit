import express, { Request, Response } from 'express';
import { getDB } from '../../singleton';
import { CreateSchuelerRequestBody, DeleteSchuelerRequestBody, DeleteSchuelerResponseBody } from '@thesis/schueler';
import { CreateClassRequestBody, CreateClassResponseBody } from '@thesis/schule';

let router = express.Router();

router.get('/', async (req, res) => {
    res.status(200).json([]);
});

router.post('/', async (req: Request<{}, {}, CreateClassRequestBody>, res: Response<CreateClassResponseBody>) => {
    const msg = await getDB().createClass(req.body)
    res.status(500).json(msg);
});


export { router };