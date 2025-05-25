import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import { getDB } from "../singleton"
import { LOGIN_ENDPOINT, REGISTER_ENDPOINT, SESSION_COOKIE_NAME } from '@thesis/config';
import { LoginRequestBody, LoginResponseBody, RegisterRequestBody, RegisterResponseBody, User, UsersResponseBody } from '@thesis/auth';
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
    getDB().updateSession(sessionId, sessionData);
    return res;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => { // Middleware to verify and add session cookie
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

    const sessionData = getDB().getSession(sessionId);
    if (!sessionData) {
        next()
    }
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

    console.log(roles)
    if (!roles) {
        return user;
    }
    
    for (const role of roles) {
        if (role.rolle === user.rolle) {
            
            user.rolle = role;
            break;
        }
    }

    console.log(user)
    return user;
}

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

router.post('/role', (req,res) => {

})
router.patch('/role', (req,res) => {

})
router.delete('/role', (req,res) => {

})

export { router };