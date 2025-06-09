import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import { getDB } from '../../singleton';
import {
    AUTH_API_ENDPOINT,
    LOGIN_ENDPOINT,
    LOGOUT_ENDOINT,
    REGISTER_CALLBACK_ENDPOINT,
    REGISTER_ENDPOINT,
    SESSION_COOKIE_NAME,
} from '@thesis/config';
import {
    Berechtigung,
    Berechtigungen,
    CreateRoleRequestBody,
    CreateRoleResponseBody,
    DeleteRoleRequestBody,
    DeleteRoleResponseBody,
    DeleteUserRequestBody,
    LoginRequestBody,
    LoginResponseBody,
    RegisterRequestBody,
    RegisterResponseBody,
    ROLLE_ENDPOINT,
    SearchUserRequestBody,
    SearchUserResponseBody,
    UpdatePasswordRequestBody,
    UpdatePasswordResponseBody,
    UpdateRoleRequestBody,
    UpdateUserRequestBody,
    UpdateUserResponseBody,
    User,
    UsersResponseBody,
} from '@thesis/auth';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken'
import { sendActivateAccountEmail } from './smtp';
import { searchUser } from './util';

const cookieKey = fs.readFileSync(
    path.join(__dirname, '../../../../cookie_signing.key'),
    'utf8'
);
const registerKey = fs.readFileSync(
    path.join(__dirname, '../../../../register.key'),
    'utf8'
);
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
let router = express.Router();

export type SessionData = {
    user?: User;
    createdAt: Date;
    expiresAt: Date;
};

declare global {
    namespace Express {
        interface Request {
            sessionId?: string
            userId?: number
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
        secure: true,
    });
    if (user.rolle && typeof user.rolle !== 'string') {
        user.rolle = user.rolle.rolle;
    }
    const sessionData: SessionData = {
        user,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + SESSION_MAX_AGE),
    };
    getDB().createSession(sessionId, sessionData);
    return res;
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Middleware to verify and add session cookie
    const cookie = req.cookies[SESSION_COOKIE_NAME];
    if (!cookie || !cookie.includes('.')) {
        next();
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
        res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
        res.status(403).json({
            success: false,
            message: 'Die Sitzung ist abgelaufen.'
        });
        return;
    }

    req.sessionId = sessionId;
    const sessionData = await getDB().getSession(sessionId);
    if (!sessionData) {
        res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
        res.status(403).json({
            success: false,
            message: 'Es wurde keine Sitzung gefunden.'
        });
        return;
    }

    const user = sessionData.user;
    if (!user) {
        next();
        return;
    }
    if (user.isLocked) {
        res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
        // Unreachable, because the session is removed on locking a user.
        res.status(403).json({
            success: false,
            message: 'Dieser Nutzer ist gesperrt.'
        });
        return;
    }
    const userWithPermissions = await addRoleDataToUser(user)
    const rolle = userWithPermissions.rolle;
    if (!rolle || typeof rolle === 'string') {
        next();
        return;
    }
    req.userId = user.id
    req.permissions = rolle.berechtigungen;
    next();
};

const addRoleDataToUser = async (user: User) => {
    if (!user.rolle) {
        return user;
    }

    if (typeof user.rolle !== 'string') {
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
};

router.get(LOGOUT_ENDOINT, async (req, res) => {
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    if (!req.sessionId) return;
    const isSessionRemoved = await getDB().removeSession(req.sessionId);
    if (isSessionRemoved) {
        res.status(200).json({
            message: 'Der Nutzer wurde erfolgreich abgemeldet.',
        });
    } else {
        res.status(400).json({
            message: 'Der Nutzer konnte nicht abgemeldet werden.',
        });
    }
});
router.post(
    LOGIN_ENDPOINT,
    async (
        req: Request<{}, {}, LoginRequestBody>,
        res: Response<LoginResponseBody>
    ) => {
        const { email, passwort } = req.body;
        let user = await getDB().findUser(email, passwort);

        if (!user) {
            res.status(401).json({
                success: false,
                message:
                    'Es konnte kein Nutzer mit diesen Daten gefunden werden.',
            });
            return;
        }

        if (user.isLocked) {
            res.status(403).json({
                success: false,
                message: 'Dieser Nutzer ist gesperrt.'
            });
            return;
        }

        if (!user.isVerified) {
            res.status(403).json({
                success: false,
                message: 'Dieser Nutzer ist noch nicht aktiviert. Schau in dein Email Postfach.'
            });
            return;
        }

        res = await createSession(res, user);
        user = await addRoleDataToUser(user);

        res.status(200).json({
            success: true,
            user,
        });
    }
);

router.get(REGISTER_CALLBACK_ENDPOINT, async (req, res) => {
    const token = req.query.token
    if (!token) {
        res.status(400).send('Das Konto konnte nicht aktiviert werden.')
        return
    }
    try {
        const decoded: any = jwt.verify(token as string, registerKey)
        if (!decoded.userId || decoded.userId === -1) {
            res.status(400).send('Das Konto konnte nicht aktiviert werden.')
            return;
        }
        const success = await getDB().updateUser(decoded.userId, undefined, undefined, undefined, undefined, undefined, undefined, true)

        if (success) {
            res.status(200).redirect('/login')
            return;
        }

    } catch (_) { }
    res.status(400).send('Das Konto konnte nicht aktiviert werden.')
})

router.post(
    REGISTER_ENDPOINT,
    async (
        req: Request<RegisterRequestBody>,
        res: Response<RegisterResponseBody>
    ) => {
        const { vorname, nachname, email, passwort } = req.body;
        const user = await getDB().createUser(
            email,
            passwort,
            vorname,
            nachname
        );

        if (!user || !user.email) {
            res.status(401).json({
                success: false,
                message: 'Der Nutzer konnte nicht erstellt werden.',
            });
            return;
        }

        const jwtPayload = {
			userId: user.id ?? -1
        }
		
	    const token = jwt.sign(jwtPayload, registerKey, {expiresIn: '2h'})
        const cbEndpoint = req.headers.origin + AUTH_API_ENDPOINT + REGISTER_CALLBACK_ENDPOINT + '?token=' + token
        const success = await sendActivateAccountEmail(user.email, cbEndpoint)
        if (!success) {
            res.status(401).json({
                success: false,
                message: 'Ein Fehler beim Senden der Aktivierungsemail ist aufgetreten.',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Der Nutzer wurde erfolgreich erstellt. Schau in dein Email Postfach, um das Konto zu aktivieren.',
        });
    }
);

router.get('/users', async (req, res: Response<UsersResponseBody>) => {
    let users = await getDB().getUsers();
    const roles = await getDB().getRoles();

    if (!users || !roles) {
        res.status(500).json({
            users: [],
            rollen: [],
        });
        return;
    }

    res.status(200).json({
        users,
        rollen: roles,
    });
});

router.post('/users/search', async (req: Request<{}, {}, SearchUserRequestBody<Berechtigung>>, res: Response<SearchUserResponseBody>) => {
    const { query, berechtigung, berechtigungValue} = req.body 
    const users = await searchUser(query, berechtigung, berechtigungValue);
    res.status(200).json({
        success: true,
        message: 'Die Suche war erfolgreich.',
        users: users ? users : []
    });
});

router.patch('/user', async (req: Request<{}, {}, UpdateUserRequestBody>, res: Response<UpdateUserResponseBody>) => {
    const user = req.body.user
    const userId = user.id;

    if (!userId) {
        res.status(400).json({
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        });
        return;
    }

    if(req.userId == undefined) {
        res.status(401).json({
            success: false,
            message: 'Es wurde keine Sitzung gefunden.'
        })
        return;
    }

    // Admin changes a user
    if (userId !== undefined && userId !== req.userId) {

        if (!req.permissions?.[Berechtigung.RollenVerwalten]) {
            res.status(401).json({
                success: false,
                message: 'Du hast nicht die notwendigen Berechtigungen.'
            });
            return;
        }

        const rolle = req.body.user.rolle
        if (typeof rolle == 'string') {
            const msg = await getDB().updateUser(userId, undefined, undefined, undefined, undefined, rolle, undefined, undefined)
            res.status(200).json(msg);
            return;
        }

        if (user.isLocked !== undefined) {
            const { success: isLocked } = await getDB().updateUser(userId, undefined, undefined, undefined, undefined, undefined, user.isLocked, undefined)
            const isSessionRemoved = await getDB().removeSessionForUser(userId) 
            if (isLocked && isSessionRemoved) {
                res.status(200).json({
                    success: true,
                    message: user.isLocked ? 'Der Nutzer wurde erfolgreich gesperrt.' : 'Der Nutzer wurde erfolgreich entsperrt.',
                });
                return;
            }
        }

        res.status(400).json({
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        });
        return;
    }

    // Change email
    if (user.email) {
        const msg = await getDB().updateUser(userId, user.email)
        res.status(200).json(msg);
        return;
    }

    const vorname = user.vorname
    const nachname = user.nachname
    if (vorname && nachname) {
        const msg = await getDB().updateUser(userId, undefined, undefined, vorname, nachname)
        res.status(200).json({
            success: msg.success,
            message: msg.success ? 'Der Name wurde erfolgreich aktualisiert.' : 'Ein Fehler ist aufgetreten.'
        });
        return;
    }

    res.status(500).json({
        success: false,
        message: 'Diese Funktion ist noch nicht implementiert.'
    });

});

router.delete('/user', async (req: Request<{}, {}, DeleteUserRequestBody>, res) => {

    const userId = req.body.userId
    if (req.permissions?.[Berechtigung.RollenVerwalten] || (req.userId !== undefined && req.userId == userId)) {
        const isDeleted = await getDB().deleteUser(userId)
        if (!isDeleted) {
            res.status(400).json({
                success: false,
                message: 'Das Konto konnte nicht gelöscht werden.'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Das Konto wurde erfolgreich gelöscht.'
        });
        return;
    }


});

router.patch('/password', async (req: Request<{}, {}, UpdatePasswordRequestBody>, res: Response<UpdatePasswordResponseBody>) => {
        const { userId, password, newPassword } = req.body;
        if (!req.userId || !req.sessionId || userId !== req.userId) {
            res.status(403).json({
                success: false,
                message: 'Du kannst das Passwort nicht aktualisiern'
            })
            return;
        }

        const sessionData = await getDB().getSession(req.sessionId)
        if (!sessionData || !sessionData.user?.email) {
            return;
        }

        const user = await getDB().findUser(sessionData.user?.email, password)
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Das Passwort war nicht korrekt.'
            })
            return;
        }

        const dbMessage = await getDB().updateUser(userId, undefined, newPassword);
        res.status(200).json(dbMessage);
    }
);

router.post(
    ROLLE_ENDPOINT,
    async (
        req: Request<{}, {}, CreateRoleRequestBody>,
        res: Response<CreateRoleResponseBody>
    ) => {
        const { rolle, berechtigungen } = req.body;

        if (rolle == '') {
            res.status(400).json({
                success: false,
                message: 'Die Rollenbezeichnung darf nicht leer sein.',
            });
            return;
        }
        // Verifying format
        let legitRole: any = {
            rolle,
            berechtigungen: {},
        };
        for (const [key] of Object.entries(Berechtigung)) {
            if (isNaN(Number(key))) continue;
            //@ts-ignore
            legitRole['berechtigungen'][key] = berechtigungen[key];
        }

        const dbMessage = await getDB().createRole(legitRole);
        res.status(200).json(dbMessage);
    }
);

router.patch(
    ROLLE_ENDPOINT,
    async (req: Request<{}, {}, UpdateRoleRequestBody>, res) => {
        const { rollenbezeichnung, updated } = req.body;
        const dbMessage = await getDB().updateRole(rollenbezeichnung, updated);
        res.status(200).json(dbMessage);
    }
);
router.delete(ROLLE_ENDPOINT, async (req: Request<{}, {}, DeleteRoleRequestBody>, res: Response<DeleteRoleResponseBody>) => {
    if (!req.permissions?.[Berechtigung.RollenVerwalten]) {
        res.status(401).json({
            success: false,
            message: 'Du hast nicht die notwendigen Berechtigungen.'
        });
        return;
    }
    const { rolle } = req.body;
    const dbMessage = await getDB().deleteRole(rolle);
    res.status(200).json(dbMessage);
});

export { router };
