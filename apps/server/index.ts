import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { router as authRouter, authMiddleware } from "./modules/auth/auth"
import { router as schuelerRouter } from "./modules/schueler/schueler"
import { AUTH_API_ENDPOINT, SCHUELER_ENDPOINT } from "@thesis/config"
import { getDB } from './singleton';
import cookieParser from "cookie-parser"
import https from 'https';
import fs from 'fs'
import { Berechtigung } from '@thesis/auth';

// setTimeout(() => {
//     getDB().createRole({
//         // rolle: `${crypto.randomUUID().slice(0, 24)}`,
//         rolle: `admin`,
//         berechtigungen: {
//             [Berechtigung.KlasseCreate]: true,
//             [Berechtigung.KlasseRead]: "alle",
//             [Berechtigung.KlasseUpdate]: true,
//             [Berechtigung.KlasseDelete]: true,
//             [Berechtigung.GanztagsangebotCreate]: true,
//             [Berechtigung.GanztagsangebotRead]: "alle",
//             [Berechtigung.GanztagsangebotUpdate]: true,
//             [Berechtigung.GanztagsangebotDelete]: true,
//             [Berechtigung.SchuelerCreate]: true,
//             [Berechtigung.SchuelerRead]: "alle",
//             [Berechtigung.SchuelerUpdate]: true,
//             [Berechtigung.SchuelerDelete]: true,
//             [Berechtigung.AnwesenheitsstatusUpdate]: true,
//             [Berechtigung.AnwesenheitsstatusRead]: true,
//             [Berechtigung.DiagnostikverfahrenRead]: "alle",
//             [Berechtigung.DiagnostikverfahrenDelete]: true,
//             [Berechtigung.RollenVerwalten]: true,
//             [Berechtigung.NachrichtenvorlagenVerwalten]: true,
//             [Berechtigung.NachrichtenDelete]: "alle",
//         }
//     })
// }, 5000)


const privateKey  = fs.readFileSync('../../https.key', 'utf8');
const certificate = fs.readFileSync('../../https.crt', 'utf8');
const PORT = process.env.PORT || 443
const app = express();
dotenv.config({
    path: '../../.env'
});
getDB(); // Init db connection
app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(authMiddleware)
app.use(AUTH_API_ENDPOINT, authRouter);
app.use(SCHUELER_ENDPOINT, schuelerRouter);
app.use(express.static('../client/dist'))

app.get('/{*splat}', (req, res) => {
	return res.sendFile(path.join(__dirname, '../client/dist', "index.html"));
});

https.createServer({ key: privateKey, cert: certificate }, app).listen(PORT)