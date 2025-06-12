import express, { Request, Response } from 'express';
import { getDB } from '../../singleton';
import { Halbjahr, Schuljahr } from '@thesis/schule';
import { CreateGanztagsangebotRequestBody, CreateGanztagsangebotResponseBody } from '@thesis/schule'

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
    const msg = await getDB().getGanztagsangebote(schuljahr as Schuljahr, halbjahr as Halbjahr)
    res.status(200).json(msg);
});

router.post('/', async (req: Request<{}, {}, CreateGanztagsangebotRequestBody>, res: Response<CreateGanztagsangebotResponseBody>) => {
    const ganztagsangebot = req.body
    const msg = await getDB().createGanztagsangebot(ganztagsangebot)
    res.status(msg.success ? 200 : 400).json(msg);
});

router.get('/:ganztagsangebotId', async (req, res) => {
    const { ganztagsangebotId } = req.params
    const { schuljahr, halbjahr } = req.query;
    console.log(req.params, req.query)
    const klasse = await getDB().getGanztagsangebot(schuljahr as Schuljahr, halbjahr as Halbjahr, parseInt(ganztagsangebotId))
    res.status(klasse ? 200 : 500).json(klasse);
});

// router.put('/:klassenId', async (req, res) => {

//     const { klassenId } = req.params
//     const { schuljahr, halbjahr } = req.query;
//     const { versionen, klassenlehrer } = req.body

//     const msg = await getDB().editClass(parseInt(klassenId), versionen, klassenlehrer, schuljahr as Schuljahr, halbjahr as Halbjahr)
//     res.status(200).json(msg);
// });



// router.delete('/', async (req: Request<{}, {}, DeleteKlasseRequestBody>, res: Response<DeleteKlasseResponseBody>) => {
//     const klassenId = req.body.klassenId
//     const msg = await getDB().deleteClass(klassenId)
//     res.status(200).json(msg as DeleteSchuelerResponseBody);
// });

export { router };