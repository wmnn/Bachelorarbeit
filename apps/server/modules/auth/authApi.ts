import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import {
    AUTH_2_FACTOR_API_ENDPOINT,
    AUTH_API_ENDPOINT,
    LOGIN_ENDPOINT,
    LOGOUT_ENDOINT,
    REGISTER_CALLBACK_ENDPOINT,
    REGISTER_ENDPOINT,
    SESSION_COOKIE_NAME,
} from '@thesis/config';
import {
    DeleteUserRequestBody,
    isValidPassword,
    LoginRedirectAction,
    LoginRequestBody,
    LoginResponseBody,
    NOT_VALID_PASSWORD_MESSAGE,
    RegisterRequestBody,
    RegisterResponseBody,
    SearchUserRequestBody,
    SearchUserResponseBody,
    UpdatePasswordRequestBody,
    UpdatePasswordResponseBody,
    UpdateUserRequestBody,
    UpdateUserResponseBody,
    User,
    UsersResponseBody,
} from '@thesis/auth';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken'
import { sendActivateAccountEmail, sendResetPasswordEmail } from './smtp';
import { countUsersWithPermission, searchUser } from './util';
import { addRoleDataToUser } from '../auth/util';
import { Berechtigung } from '@thesis/rollen';
import { getAuthStore } from '../../singleton';
import { getErrorResponse, getInternalErrorResponse, getNoSessionResponse } from './permissionsUtil';
import { is2FASetup } from './Auth2FactorUtil';

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
    sessionId: string,
    user?: User;
    createdAt: Date;
    expiresAt: Date;
    is2FaVerified: boolean
};

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
        sessionId,
        user,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + SESSION_MAX_AGE),
        is2FaVerified: false
    };
    getAuthStore().setSessionData(sessionId, sessionData);
    return res;
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.originalUrl.startsWith('/api')) {
        return next();
    }
    // Middleware to verify and add session cookie
    const cookie = req.cookies[SESSION_COOKIE_NAME];
    if (!cookie || !cookie.includes('.')) {
        return next();
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
        return res.status(403).json({
            success: false,
            message: 'Die Sitzung ist abgelaufen.',
            redirect: LoginRedirectAction.REDIRECT_TO_LOGIN
        });
    }

    req.sessionId = sessionId;
    const sessionData = await getAuthStore().getSession(sessionId);
    if (!sessionData) {
        res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
        return res.status(403).json({
            success: false,
            message: 'Es wurde keine Sitzung gefunden.',
            redirect: LoginRedirectAction.REDIRECT_TO_LOGIN
        });
    }

    if (!sessionData.is2FaVerified 
        && !req.originalUrl.startsWith(AUTH_2_FACTOR_API_ENDPOINT) 
        && !req.originalUrl.startsWith(AUTH_API_ENDPOINT + LOGIN_ENDPOINT)
        && !req.originalUrl.startsWith(AUTH_API_ENDPOINT + `/reset-password`)
        && !req.originalUrl.startsWith(AUTH_2_FACTOR_API_ENDPOINT + `/2fa-verify`)
        && !req.originalUrl.startsWith(AUTH_API_ENDPOINT + `/register`)
        && !req.originalUrl.startsWith(AUTH_API_ENDPOINT + REGISTER_CALLBACK_ENDPOINT)
    ) {
        return res.status(401).json({
            success: false,
            message: 'Der 2-Faktor Authentifizierungscode wurde noch nicht überprüft.',
            redirect: LoginRedirectAction.VERIFY_2_FACTOR_CODE
        })
    }

    const user = sessionData.user;
    if (!user) {
        return next();
    }
    if (user.isLocked) {
        res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
        // Unreachable, because the session is removed on locking a user.
        return res.status(403).json({
            success: false,
            message: 'Dieser Nutzer ist gesperrt.',
            redirect: LoginRedirectAction.REDIRECT_TO_LOGIN
        });
    }
    
    req.userId = user.id
    if (typeof user.rolle === 'string') {
        req.rolle = user.rolle
    }
    next();
};


router.get(LOGOUT_ENDOINT, async (req, res) => {
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    if (!req.sessionId) return;
    const isSessionRemoved = await getAuthStore().removeSession(req.sessionId);
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
    ): Promise<any> => {
        const { email, passwort } = req.body;
        let user = await getAuthStore().findUser(email, passwort);

        if (!user) {
            return res.status(400).json({
                success: false,
                message:
                    'Es konnte kein Nutzer mit diesen Daten gefunden werden.',
            });
        }

        if (user.isLocked) {
            return res.status(403).json({
                success: false,
                message: 'Dieser Nutzer ist gesperrt.'
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Dieser Nutzer ist noch nicht aktiviert. Schau in dein Email Postfach.'
            });
        }

        res = await createSession(res, user);
        user = await addRoleDataToUser(user);

        if (!await is2FASetup(user?.id ?? -1)) {
            return res.status(200).json({
                success: true,
                user,
                redirect: LoginRedirectAction.SETUP_2_FACTOR_AUTHENTICATION
            });
        }

        res.status(200).json({
            success: true,
            user,
            redirect: LoginRedirectAction.VALIDATE_2_FACTOR_CODE
        });
    }
);

router.get(REGISTER_CALLBACK_ENDPOINT, async (req, res): Promise<any> => {
    const token = req.query.token
    if (!token) {
        return res.status(400).send('Das Konto konnte nicht aktiviert werden.')
    }
    try {
        const decoded: any = jwt.verify(token as string, registerKey)
        if (!decoded.userId || decoded.userId === -1) {
            return res.status(400).send('Das Konto konnte nicht aktiviert werden.')
        }
        const success = await getAuthStore().updateUser(decoded.userId, undefined, undefined, undefined, undefined, undefined, undefined, true)

        if (success) {
            return res.status(200).redirect('/login')
        }

    } catch (_) { }
    res.status(400).send('Das Konto konnte nicht aktiviert werden.')
})

router.post(
    REGISTER_ENDPOINT,
    async (
        req: Request<RegisterRequestBody>,
        res: Response<RegisterResponseBody>
    ): Promise<any> => {
        const { vorname, nachname, email, passwort } = req.body;

        if (!isValidPassword(passwort)) {
            return res.status(400).json({
                success: false,
                message: NOT_VALID_PASSWORD_MESSAGE
            })
        }

        const user = await getAuthStore().createUser(
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

router.get('/users', async (req, res: Response<UsersResponseBody>): Promise<any> => {
    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    let users = await getAuthStore().getUsers();
    const roles = await getAuthStore().getRoles();

    if (!users || !roles) {
        return res.status(500).json({
            users: [],
            rollen: [],
        });
    }

    res.status(200).json({
        users,
        rollen: roles,
    });
});

router.post('/users/search', async (req: Request<{}, {}, SearchUserRequestBody<Berechtigung>>, res: Response<SearchUserResponseBody>): Promise<any> => {
    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    const { query, berechtigung, berechtigungValue} = req.body 
    const users = await searchUser(query, berechtigung, berechtigungValue);
    res.status(200).json({
        success: true,
        message: 'Die Suche war erfolgreich.',
        users: users ? users : []
    });
});

async function updateRoleHandling(req: Request, updatedUser: User, res: Response): Promise<Response | undefined> {
    const savedUser = (await getAuthStore().getUsers() ?? []).find(u => u.id == updatedUser.id)
    if (savedUser?.rolle == updatedUser.rolle) {
        return res.status(400).json({
            success: false,
            message: 'Der Nutzer besitzt bereits diese Rolle.'
        })
    }

    // Rolle entfernen handling
    if (parseInt(updatedUser?.rolle as string ?? '-1') == -1) {
        const { success } = await getAuthStore().updateUser(updatedUser.id ?? -1, undefined, undefined, undefined, undefined, '', undefined, undefined)
        const { success: success2 } = await getAuthStore().removeSessionForUser(updatedUser.id ?? -1)
        if (success && success2) return res.status(200).json({
            success: true,
            message: 'Die Rolle wurde erfolgreich entfernt.'
        });
        return getInternalErrorResponse(res)
    }

    // Mindestens eine Person muss über die Rolle zur Verwaltung von Rollen verfügen.
    const berechtigung = Berechtigung.RollenVerwalten
    const count = await countUsersWithPermission(berechtigung, true)
    if (count == 1 && updatedUser.id == req.userId // Aktualisiert sich selber.
        ) {
        return res.status(400).json({
            success: false,
            message: 'Mindestens eine Person muss über die Rolle zur Verwaltung von Rollen verfügen.'
        })
    }
    
    const msg = await getAuthStore().updateUser(updatedUser.id ?? -1, undefined, undefined, undefined, undefined, updatedUser.rolle as string, undefined, undefined)
    await getAuthStore().removeSessionForUser(updatedUser.id ?? -1)
    /*
    const sessions = await getAuthStore().getSessions()
    let success = msg.success
    for (const session of sessions) {
        if (session.user?.id === updatedUser.id) {
            success = success && await getAuthStore().removeSession(session.sessionId)
            break;
        }
    }*/

    return res.status(200).json(msg);
}
router.patch('/user', async (req: Request<{}, {}, UpdateUserRequestBody>, res: Response<UpdateUserResponseBody>): Promise<any> => {
    const user = req.body.user
    const userId = user.id;

    if (req.userId == undefined) {
        return getNoSessionResponse(res);
    }

    if (userId == undefined) {
        return getErrorResponse(res)
    }

    // Admin changes a user
    if (userId !== req.userId || (user.rolle != undefined || user.isLocked != undefined)) {

        if (!req.permissions?.[Berechtigung.RollenVerwalten]) {
            return res.status(401).json({
                success: false,
                message: 'Du hast nicht die notwendigen Berechtigungen.'
            });
        }

        if (typeof user.rolle == 'string') {
            return updateRoleHandling(req, user, res)
        }

        if (user.isLocked !== undefined) {
            const { success: isLocked } = await getAuthStore().updateUser(userId, undefined, undefined, undefined, undefined, undefined, user.isLocked, undefined)
            const isSessionRemoved = await getAuthStore().removeSessionForUser(userId) 
            if (isLocked && isSessionRemoved) {
                res.status(200).json({
                    success: true,
                    message: user.isLocked ? 'Der Nutzer wurde erfolgreich gesperrt.' : 'Der Nutzer wurde erfolgreich entsperrt.',
                });
                return;
            }
        }
        return getErrorResponse(res);
    }

    // Change email
    if (user.email) {
        const msg = await getAuthStore().updateUser(userId, user.email)
        return res.status(200).json(msg);
    }

    const { vorname, nachname } = user
    if (vorname && nachname) {
        const msg = await getAuthStore().updateUser(userId, undefined, undefined, vorname, nachname)
        return res.status(200).json({
            success: msg.success,
            message: msg.success ? 'Der Name wurde erfolgreich aktualisiert.' : 'Ein Fehler ist aufgetreten.'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Diese Funktion ist noch nicht implementiert.'
    });
});

router.delete('/user', async (req: Request<{}, {}, DeleteUserRequestBody>, res): Promise<any> => {

    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }

    // Mindestens eine Person muss über die Rolle zur Verwaltung von Rollen verfügen.
    const usersWithPermission = await countUsersWithPermission(Berechtigung.RollenVerwalten, true)
    if (usersWithPermission == 1 && req.permissions?.[Berechtigung.RollenVerwalten] == true) {
        return res.status(400).json({
            success: false,
            message: 'Mindestens eine Person muss über die Rolle zur Verwaltung von Rollen verfügen.'
        })
    }

    const userId = req.body.userId
    if (req.permissions?.[Berechtigung.RollenVerwalten] == true || req.userId == userId) {
        const isDeleted = await getAuthStore().deleteUser(userId)
        if (!isDeleted) {
            return res.status(400).json({
                success: false,
                message: 'Das Konto konnte nicht gelöscht werden.'
            });
        }
        if (req.userId == userId) {
            await getAuthStore().removeSession(req?.sessionId ?? '-1')
        } else {
            await getAuthStore().removeSessionForUser(userId)
        }
        return res.status(200).json({
            success: true,
            message: 'Das Konto wurde erfolgreich gelöscht.'
        });
    }

    return res.status(500).json({
        success: false,
        message: 'Ein unbekannter Fehler ist aufgetreten.'
    });
});

router.patch('/password', async (req: Request<{}, {}, UpdatePasswordRequestBody>, res: Response<UpdatePasswordResponseBody>): Promise<any> => {
    if(req.userId == undefined || !req.sessionId) {
        return getNoSessionResponse(res);
    }    
    const { userId, password, newPassword } = req.body;
    if (userId !== req.userId) {
        return res.status(403).json({
            success: false,
            message: 'Du kannst das Passwort nicht aktualisiern'
        })
    }

    const sessionData = await getAuthStore().getSession(req.sessionId)
    if (!sessionData || !sessionData.user?.email) {
        return getNoSessionResponse(res);
    }

    const user = await getAuthStore().findUser(sessionData.user?.email, password)
    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'Das Passwort war nicht korrekt.'
        })
    }
    if (!isValidPassword(newPassword)) {
        return res.status(400).json({
            success: false,
            message: NOT_VALID_PASSWORD_MESSAGE
        })
    }

    const dbMessage = await getAuthStore().updateUser(userId, undefined, newPassword);
    res.status(200).json(dbMessage);
});

router.get('/reset-password', async (req: Request<{}, {}, any>, res: Response<any>): Promise<any> => {
    const { email } = req.query
    if (!email) return;

    const token = jwt.sign({ email }, registerKey, { expiresIn: '10m'})
    const link = `https://${req.get('host')}` + `/reset-password?token=${token}`
    const success = await sendResetPasswordEmail(email as string, link)

    if (success) {
        res.status(200).json({
            success: true,
            message: 'Die Email wurde erfolgreich versendet.'
        })
    } else {
        res.status(500).json({
            success: false,
            message: 'Ein Fehler beim Senden der Email ist aufgetreten.'
        })
    }
})

router.post('/reset-password', async (req: Request<{}, {}, any>, res: Response<any>): Promise<any> => {
    const { token, neuesPasswort, neuesPasswortWiederholt } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'Token fehlt.'
        });
    }

    if (!isValidPassword(neuesPasswort)) {
        return res.status(400).json({
            success: false,
            message: 'Das Passwort erfüllt nicht die erforderlichen Kriterien.'
        });
    }

    if (neuesPasswort !== neuesPasswortWiederholt) {
        return res.status(400).json({
            success: false,
            message: 'Die Passwörter stimmen nicht überein.'
        });
    }

    let decoded: any;
    try {
        decoded = jwt.verify(token, registerKey);
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Ungültiger oder abgelaufener Token.'
        });
    }

    if (!decoded?.email) {
        return res.status(400).json({
            success: false,
            message: 'Der Token enthält keine gültige E-Mail-Adresse.'
        });
    }

    const user = await getAuthStore().getUser(decoded.email);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Der Benutzer wurde nicht gefunden.'
        });
    }

    await getAuthStore().updateUser(user.id ?? -1, undefined, neuesPasswort);

    return res.status(200).json({
        success: true,
        message: 'Das Passwort wurde erfolgreich zurückgesetzt.'
    });
});

export { router };
