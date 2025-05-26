import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import { getDB } from "../singleton"
import { LOGIN_ENDPOINT, LOGOUT_ENDOINT, REGISTER_ENDPOINT, SESSION_COOKIE_NAME } from '@thesis/config';
import { Berechtigung, Berechtigungen, CreateRoleRequestBody, CreateRoleResponseBody, LoginRequestBody, LoginResponseBody, RegisterRequestBody, RegisterResponseBody, Rolle, ROLLE_ENDPOINT, UpdateRoleRequestBody, User, UsersResponseBody } from '@thesis/auth';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import fs from "fs"
import path from "path"


const cookieKey = fs.readFileSync(
  path.join(__dirname, '../../../cookie_signing.key'),
  'utf8'
);
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days
let router = express.Router()

export type SessionData = {
    user?: User,
    createdAt: Date,
    expiresAt: Date
}

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      permissions?: Berechtigungen
    }
  }
}

async function createSession(res: Response, user: User): Promise<Response> {
    
    const sessionId = randomUUID(); 
    const signature = createHmac('sha256', cookieKey)
        .update(sessionId)
        .digest('hex');
    const cookieData = `${sessionId}.${signature}`;
    res.cookie(SESSION_COOKIE_NAME, cookieData, { 
        maxAge: SESSION_MAX_AGE, 
        httpOnly: true,
        secure: true    
    });

    if (user.rolle && typeof user.rolle !== "string") {
        user.rolle = user.rolle.rolle
    }
    const sessionData: SessionData = {
        user,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + SESSION_MAX_AGE),
    }
    getDB().createSession(sessionId, sessionData);
    return res;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => { // Middleware to verify and add session cookie
    const cookie = req.cookies[SESSION_COOKIE_NAME];

    if (!cookie || !cookie.includes('.')) {
        next()
        return;
    }

    const [sessionId, signature] = cookie.split('.');

    const expectedSignature = createHmac('sha256', cookieKey)
        .update(sessionId)
        .digest('hex');

    const valid = timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );

    if (!valid) {
        next()
        return;
    }

    req.sessionId = sessionId
    const sessionData = await getDB().getSession(sessionId);
    if (!sessionData) {
        next()
        return;
    }

    const user = sessionData.user
    if (!user) {
        next()
        return
    }
    const rolle = (await addRoleDataToUser(user)).rolle
    if (!rolle || typeof rolle === "string") {
        next()
        return;
    }
    req.permissions = rolle.berechtigungen
    next();
}

const addRoleDataToUser = async (user: User) => {

    if (!user.rolle) {
        return user;
    }

    if (typeof user.rolle !== "string") {
        return user;
    }

    const roles = await getDB().getRoles();

    if (!roles) {
        return user;
    }
    
    for (const role of roles) {
        if (role.rolle === user.rolle) {
            
            user.rolle = role;
            break;
        }
    }

    return user;
}

router.get(LOGOUT_ENDOINT, async (req, res) => {
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    if (!req.sessionId) return;
    const isSessionRemoved = await getDB().removeSession(req.sessionId);
    if (isSessionRemoved) {
        res.status(200).json({ message: 'Der Nutzer wurde erfolgreich abgemeldet.' });
    } else {
        res.status(400).json({ message: 'Der Nutzer konnte nicht abgemeldet werden.' });
    }
})
router.post(LOGIN_ENDPOINT, async (req: Request<LoginRequestBody>, res: Response<LoginResponseBody>) => {
    const { email, passwort } = req.body;
    let user = await getDB().findUser(email, passwort);

    if (!user) {
        res.status(401).json({
            status: 401,
            message: 'Es konnte kein Nutzer mit diesen Daten gefunden werden.',
        });
        return;
    }
    
    res = await createSession(res, user);
    user = await addRoleDataToUser(user);

    res.status(200).json({
        status: 200,
        user,
    });
});


router.post(REGISTER_ENDPOINT, async (req: Request<RegisterRequestBody>, res: Response<RegisterResponseBody>) => {

    const { vorname, nachname, email, passwort } = req.body
    const user = await getDB().createUser(vorname, nachname, email, passwort)

    if (!user) {
        res.status(401).json({
            status: 401,
            message: 'Der Nutzer konnte nicht erstellt werden.'
        });
        return;
    }

    res.status(200).json({
        status: 200,
        user
    })
})

router.get('/users', async (req, res: Response<UsersResponseBody>) => {
    let users = await getDB().getUsers()
    const roles = await getDB().getRoles()

    if (!users || !roles) {
        res.status(500).json({
            users: [],
            rollen: []
        })
        return;
    }

    res.status(200).json({
        users,
        rollen: roles
    })
})

router.patch('/user', (req,res) => {
    
})

router.delete('/user', (req,res) => {
    
})

router.post(ROLLE_ENDPOINT, async (req: Request<CreateRoleRequestBody>,res: Response<CreateRoleResponseBody>) => {
    const { rolle, berechtigungen } = req.body

    if (rolle.rolle == '') {
        res.status(400).json({
            success: false,
            message: 'Die Rollenbezeichnung darf nicht leer sein.'
        })
        return;
    }
    // Verifying format
    let legitRole: any = {
        rolle,
        berechtigungen: {},
    }
    for (const [key] of Object.entries(Berechtigung)) {
        if (isNaN(Number(key))) continue;
        legitRole["berechtigungen"][key] = berechtigungen[key];
    }

    const dbMessage = await getDB().createRole(legitRole)
    res.status(200).json(dbMessage)
})

router.patch(ROLLE_ENDPOINT, async (req: Request<UpdateRoleRequestBody>, res) => {
    const { rollenbezeichnung, updated } = req.body
    const dbMessage = await getDB().updateRole(rollenbezeichnung, updated)
    res.status(200).json(dbMessage)
})
router.delete(ROLLE_ENDPOINT, (req,res) => {

})

export { router };