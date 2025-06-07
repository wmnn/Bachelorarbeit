import express, { Request, Response } from 'express';
import { getDB } from '../../singleton';
import { CreateClassRequestBody, CreateClassResponseBody, Halbjahr, Schuljahr } from '@thesis/schule';

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

    const klassen = await getDB().getClasses(schuljahr as Schuljahr, halbjahr as Halbjahr)
    res.status(200).json(klassen);
});

router.post('/', async (req: Request<{}, {}, CreateClassRequestBody>, res: Response<CreateClassResponseBody>) => {
    const msg = await getDB().createClass(req.body)
    res.status(500).json(msg);
});


export { router };