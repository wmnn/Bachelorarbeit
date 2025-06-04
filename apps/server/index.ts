import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { router as authRouter, authMiddleware } from "./modules/auth/auth"
import { AUTH_API_ENDPOINT } from "@thesis/config"
import { getDB } from './singleton';
import cookieParser from "cookie-parser"
import https from 'https';
import fs from 'fs'
import { Berechtigung } from '@thesis/auth';

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
app.use(express.static('../client/dist'))

app.get('/{*splat}', (req, res) => {
	return res.sendFile(path.join(__dirname, '../client/dist', "index.html"));
});

https.createServer({ key: privateKey, cert: certificate }, app).listen(PORT)