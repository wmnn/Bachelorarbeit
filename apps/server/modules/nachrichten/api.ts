import express, { Request, Response } from 'express';
import { getNachrichtenStore } from '../../singleton';

let router = express.Router();

router.get('/', async (req, res) => {
    const { id, typ } = req.query as {
        id?: string,
        typ?: string
    }
    if (!id || !typ) {
        return;
    }
    const nachrichten = await getNachrichtenStore().getNachrichten(parseInt(id), parseInt(typ))
    res.status(200).json(nachrichten);
})

router.get('/all', async (req, res) => {
    const { typ } = req.query as {
        typ?: string
    }
    if (!typ) {
        return;
    }
    const nachrichten = await getNachrichtenStore().getAllNachrichten(parseInt(typ))
    res.status(200).json(nachrichten);
})

router.post('/', async (req: Request, res: Response): Promise<any> => {
    const { typ, inhalt, id } = req.body 
    const userId = req.userId
    if (!userId) {
        return;
    }

    if (!inhalt || inhalt == '') {
        return res.status(400).json({
            success: false,
            message: 'Die Nachricht darf nicht leer sein.'
        });
    }

    if (inhalt.length > 280) {
        return res.status(400).json({
            success: false,
            message: 'Die Nachricht darf maximal 280 Zeichen haben.'
        });
    }
    const msg = await getNachrichtenStore().nachrichtErstellen(userId, typ, inhalt, id)
    res.status(msg.success ? 200 : 400).json(msg);
});

router.patch('/', async (req: Request, res: Response): Promise<any> => {
    const { inhalt, nachrichtId } = req.body 
    const userId = req.userId
    if (!userId) {
        return;
    }

    if (!inhalt || inhalt == '') {
        return res.status(400).json({
            success: false,
            message: 'Die Nachricht darf nicht leer sein.'
        });
    }

    if (inhalt.length > 280) {
        return res.status(400).json({
            success: false,
            message: 'Die Nachricht darf maximal 280 Zeichen haben.'
        });
    }
    const msg = await getNachrichtenStore().nachrichtBearbeiten(nachrichtId, inhalt)
    res.status(msg.success ? 200 : 400).json(msg);
});

router.delete('/', async (req, res) => {
    const { nachrichtId } = req.query as {
        nachrichtId?: string,
    }
    if (!nachrichtId) {
        return;
    }
    const msg = await getNachrichtenStore().nachrichtLoeschen(parseInt(nachrichtId))
    res.status(msg.success ? 200 : 400).json(msg);
})

router.post('/vorlage', async (req: Request, res: Response): Promise<any> => {
    const { klassenVorlagen, schuelerVorlagen } = req.body 
    const userId = req.userId
    if (!userId) {
        return;
    }

    if (!Array.isArray(klassenVorlagen) || !Array.isArray(schuelerVorlagen)) {
        return res.status(400).json({
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        }); 
    }

    for (const inhalt of [...klassenVorlagen, ...schuelerVorlagen]) {
        if (!inhalt || inhalt == '') {
            return res.status(400).json({
                success: false,
                message: 'Die Nachricht darf nicht leer sein.'
            });
        }

        if (inhalt.length > 280) {
            return res.status(400).json({
                success: false,
                message: 'Die Nachricht darf maximal 280 Zeichen haben.'
            });
        }    
    }
    
    const msg = await getNachrichtenStore().nachrichtenVorlagenSpeichern(klassenVorlagen, schuelerVorlagen)
    res.status(msg.success ? 200 : 400).json(msg);
});


router.get('/vorlage', async (req: Request, res: Response): Promise<any> => {
    const { typ } = req.query as {
        typ?: string
    }
    const userId = req.userId
    if (!userId || typ == undefined) {
        return;
    }
    const vorlagen = await getNachrichtenStore().getNachrichtenVorlagen(parseInt(typ))
    res.status(200).json(vorlagen)
})



export { router };