import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { router as authRouter, authMiddleware } from "./modules/auth/authApi"
import { router as schuelerRouter } from "./modules/schueler/api"
import { router as klassenRouter } from "./modules/klassen/api"
import { router as anwesenheitenRouter } from "./modules/anwesenheiten/api"
import { router as rollenRouter } from './modules/auth/rollenApi'
import { router as ganztagsangebotRouter } from './modules/ganztagsangebot/api'
import { router as diagnostikRouter } from './modules/diagnostik/diagnostikApi'
import { router as filesApi } from './modules/files/api'
import { router as twoFactorAuthApi } from './modules/auth/Auth2FactorApi'
import { router as nachrichtenApi } from './modules/nachrichten/api'

import { ANWESENHEITEN_ENDPOINT, AUTH_2_FACTOR_API_ENDPOINT, AUTH_API_ENDPOINT, DIAGNOSTIK_ENDPOINT, FILES_ENDPOINT, GANZTAGSANGEBOT_ENDPOINT, KLASSEN_ENDPOINT, NACHRICHTEN_ENDPOINT, SCHUELER_ENDPOINT } from "@thesis/config"
import cookieParser from "cookie-parser"
import https from 'https';
import fs from 'fs'
import { Berechtigungen, ROLLE_ENDPOINT } from '@thesis/rollen';
import { rolleMiddleware } from './modules/auth/util';
import fileUpload from 'express-fileupload';

declare global {
    namespace Express {
        interface Request {
            sessionId?: string,
            userId?: number,
            permissions?: Berechtigungen, // Die Berechtigungen des aktuellen Nutzers
            rolle?: string // Die Rolle des aktuellen Nutzers
        }
    }
}

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
// getDB(); // Init db connection
app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(fileUpload());
app.use(authMiddleware as any)
app.use(rolleMiddleware as any)
app.use(AUTH_API_ENDPOINT, authRouter);
app.use(SCHUELER_ENDPOINT, schuelerRouter);
app.use(KLASSEN_ENDPOINT, klassenRouter);
app.use(ANWESENHEITEN_ENDPOINT, anwesenheitenRouter);
app.use(GANZTAGSANGEBOT_ENDPOINT, ganztagsangebotRouter);
app.use(DIAGNOSTIK_ENDPOINT, diagnostikRouter);
app.use(NACHRICHTEN_ENDPOINT, nachrichtenApi);
app.use(AUTH_2_FACTOR_API_ENDPOINT, twoFactorAuthApi);
app.use(FILES_ENDPOINT, filesApi);
app.use(ROLLE_ENDPOINT, rollenRouter);
app.use(express.static('../client/dist'))

app.get('/{*splat}', (req, res) => {
	return res.sendFile(path.join(__dirname, '../client/dist', "index.html"));
});

https.createServer({ key: privateKey, cert: certificate }, app).listen(PORT)