import express from 'express';
import { Request, Response } from 'express';
import {
    LoginRedirectAction,
    Setup2FactorAuthenticationResponseBody,
    VerifyValidate2FactorAuthenticationResponseBody,
} from '@thesis/auth';
import { getErrorResponse, getInternalErrorResponse, getNoSessionResponse } from './permissionsUtil';
import speakeasy from 'speakeasy'
import { getAuth2FactorStore, getAuthStore } from '../../singleton';
import { is2FASetup } from './Auth2FactorUtil';

let router = express.Router();

router.get('/setup',async (
    req: Request<{}, {}, any>,
    res: Response<Setup2FactorAuthenticationResponseBody>
): Promise<any> => {
    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    const userId = req.userId

    if (await is2FASetup(userId)) {
        return res.status(400).json({
            success: false,
            message: '2-Faktor Authentifizierung wurde schon eingerichtet.',
            redirect: LoginRedirectAction.VALIDATE_2_FACTOR_CODE
        });
    }
    const name = process.env.AUTH_2_FACTOR_NAME
    if (!name) {
        return getInternalErrorResponse(res)
    }
   
    const tmpSecret = speakeasy.generateSecret({
        name
    });

    const { success: isTmpSecretStored } = await getAuth2FactorStore().setTmpSecret(userId, tmpSecret.base32)
    if (!isTmpSecretStored) {
        return getErrorResponse(res)
    }
    return res.status(200).json({
        success: true,
        message: 'Die Generierung war erfolgreich.',
        data: tmpSecret
    })
});
router.post('/verify',async (
    req: Request<{}, {}, any>,
    res: Response<VerifyValidate2FactorAuthenticationResponseBody>
): Promise<any> => {
    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    const { token } = req.body;
    const { data } = await getAuth2FactorStore().get2FaktorData(req.userId)
    if (!data) {
        return getErrorResponse(res)
    }
    const { secret, tmpSecret } = data
    if (typeof secret == 'string') {
        return res.status(400).json({
            success: false,
            message: '2-Faktor Authentifizierung wurde schon eingerichtet.',
            redirect: LoginRedirectAction.VALIDATE_2_FACTOR_CODE
        });
    }

    const isVerified = speakeasy.totp.verify({
      secret: tmpSecret,
      encoding: 'base32',
      token
    });

    if (!isVerified) {
        return getErrorResponse(res);
    }

    const { success } = await getAuth2FactorStore().setSecret(req.userId)
    if (!success) {
        return getErrorResponse(res)
    }

    const sessionId = req.sessionId ?? '-1'
    const sessionData = await getAuthStore().getSession(sessionId)
    if (!sessionData) {
        return getErrorResponse(res)
    }
    await getAuthStore().setSessionData(sessionId, {
        ...sessionData,
        is2FaVerified: true
    })
    return res.status(200).json({
        success: true,
        message: 'Die 2-Faktor Authentifizierung wurde erfolgreich aktiviert.',
        redirect: LoginRedirectAction.LOGIN_SUCCESS
    })
});

router.post('/validate',async (
    req: Request<{}, {}, any>,
    res: Response<VerifyValidate2FactorAuthenticationResponseBody>
): Promise<any> => {
    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    const { token } = req.body;
    const { data } = await getAuth2FactorStore().get2FaktorData(req.userId)
    if (!data) {
        return getErrorResponse(res)
    }
    const { secret } = data
    if (typeof secret != 'string') {
        return res.status(401).json({
            success: false,
            message: '2-Faktor Authentifizierung wurde noch nicht eingerichtet.',
            redirect: LoginRedirectAction.SETUP_2_FACTOR_AUTHENTICATION
        });
    }

     const isValidated = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1
    })
    // Setting session data
    const sessionId = req.sessionId ?? '-1'
    const sessionData = await getAuthStore().getSession(sessionId)
    if (!sessionData) {
        return getErrorResponse(res)
    }
    sessionData.is2FaVerified = true
    await getAuthStore().setSessionData(sessionId, sessionData)

    if (!isValidated) {
        return res.status(400).json({
            success: false,
            message: 'Der Code war nicht korrekt.'
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Der Code war korrekt.',
        redirect: LoginRedirectAction.LOGIN_SUCCESS
    });
});

export { router };
