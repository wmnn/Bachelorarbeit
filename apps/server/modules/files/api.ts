import express from 'express';
import path from 'path';
import fs from 'fs'

let router = express.Router();

router.get('/diagnostik/:diagnostikId/:datei', async (req, res): Promise<any> => {
    const { diagnostikId, datei } = req.params;

    const filePath = path.resolve(__dirname, '../../protected/diagnostik', diagnostikId, datei);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Datei nicht gefunden.' });
    }

    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Send file error:', err);
            res.status(500).send('Fehler beim Senden der Datei');
        }
    });
});

export { router };