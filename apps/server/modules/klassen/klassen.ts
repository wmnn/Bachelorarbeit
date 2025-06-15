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
    const klasse = await getDB().getClass(schuljahr as Schuljahr, halbjahr as Halbjahr, parseInt(klassenId))
    res.status(klasse ? 200 : 500).json(klasse);
});

router.put('/:klassenId', async (req, res) => {

    const { klassenId } = req.params
    const { schuljahr, halbjahr } = req.query;
    const { versionen, klassenlehrer } = req.body

    const msg = await getDB().editClass(parseInt(klassenId), versionen, klassenlehrer, schuljahr as Schuljahr, halbjahr as Halbjahr)
    res.status(200).json(msg);
});


router.post('/', async (req: Request<{}, {}, CreateClassRequestBody>, res: Response<CreateClassResponseBody>) => {
    const { versionen, klassenlehrer } = req.body
    const msg = await getDB().createClass(versionen, klassenlehrer)
    res.status(msg.success ? 200 : 400).json(msg);
});

router.delete('/', async (req: Request<{}, {}, DeleteKlasseRequestBody>, res: Response<DeleteKlasseResponseBody>) => {
    const { klassenId, schuljahr, halbjahr } = req.body
    const msg = await getDB().deleteClass(klassenId, schuljahr, halbjahr)
    res.status(200).json(msg as DeleteSchuelerResponseBody);
});

export { router };