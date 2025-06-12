import express, { Request, Response } from 'express';
import { getDB } from '../../singleton';
import { CreateClassRequestBody, CreateClassResponseBody, DeleteKlasseRequestBody, DeleteKlasseResponseBody, Halbjahr, Schuljahr } from '@thesis/schule';
import { DeleteSchuelerResponseBody } from '@thesis/schueler';
import { CreateGanztagsangebotRequestBody, CreateGanztagsangebotResponseBody } from '@thesis/schule'

let router = express.Router();

router.get('/', async (req, res) => {
   
    res.status(500).json({
        success: false,
        message: 'Not implemented yet'
    });
});

router.post('/', async (req: Request<{}, {}, CreateGanztagsangebotRequestBody>, res: Response<CreateGanztagsangebotResponseBody>) => {
    const ganztagsangebot = req.body
    const msg = await getDB().createGanztagsangebot(ganztagsangebot)
    res.status(msg.success ? 200 : 400).json(msg);
});

// router.get('/:klassenId', async (req, res) => {
//     const { klassenId } = req.params
//     const { schuljahr, halbjahr } = req.query;
//     const klasse = await getDB().getClass(schuljahr as Schuljahr, halbjahr as Halbjahr, parseInt(klassenId))
//     res.status(klasse ? 200 : 500).json(klasse);
// });

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