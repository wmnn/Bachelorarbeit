import express, { Request, Response } from 'express';
import { getDB } from '../../singleton';
import { CreateClassRequestBody, CreateClassResponseBody, DeleteKlasseRequestBody, DeleteKlasseResponseBody, Halbjahr, Schuljahr } from '@thesis/schule';
import { DeleteSchuelerResponseBody } from '@thesis/schueler';

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

router.get('/:klassenId', async (req, res) => {
    const { klassenId } = req.params
    const { schuljahr, halbjahr } = req.query;
    console.log(klassenId, schuljahr, halbjahr)
    const klasse = await getDB().getClass(schuljahr as Schuljahr, halbjahr as Halbjahr, parseInt(klassenId))
    console.log(klasse)
    res.status(klasse ? 200 : 400).json(klasse);
});


router.post('/', async (req: Request<{}, {}, CreateClassRequestBody>, res: Response<CreateClassResponseBody>) => {
    const msg = await getDB().createClass(req.body)
    res.status(500).json(msg);
});

router.delete('/', async (req: Request<{}, {}, DeleteKlasseRequestBody>, res: Response<DeleteKlasseResponseBody>) => {
    const klassenId = req.body.klassenId
    const msg = await getDB().deleteClass(klassenId)
    res.status(200).json(msg as DeleteSchuelerResponseBody);
});

export { router };