import express from 'express';
import { Request, Response } from 'express';
import {
    CreateRoleRequestBody,
    CreateRoleResponseBody,
    DeleteRoleRequestBody,
    DeleteRoleResponseBody,
    ROLLE_ENDPOINT,
    UpdateRoleRequestBody,
} from '@thesis/auth';
import { Berechtigung } from '@thesis/rollen';
import { getAuthStore } from '../../singleton';

let router = express.Router();

router.post('/',async (
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

    const dbMessage = await getAuthStore().createRole(legitRole);
    res.status(200).json(dbMessage);
});

router.patch('/', async (req: Request<{}, {}, UpdateRoleRequestBody>, res) => {
    const { rollenbezeichnung, updated } = req.body;
    const dbMessage = await getAuthStore().updateRole(rollenbezeichnung, updated);
    // TODO delete session with the role
    const sessions = await getAuthStore().getSessions()
    let success = true
    for (const session of sessions) {
        if (typeof session.user?.rolle == 'string' && session.user.rolle === rollenbezeichnung) {
            success = success && await getAuthStore().removeSession(session.sessionId)
        } else if (typeof session.user?.rolle == 'object' && session.user.rolle.rolle == rollenbezeichnung) {
            success = success && await getAuthStore().removeSession(session.sessionId)
        }
    }
    res.status(200).json({
        success: success,
        message: dbMessage.message
    });
});
router.delete('/', async (req: Request<{}, {}, DeleteRoleRequestBody>, res: Response<DeleteRoleResponseBody>) => {
    if (!req.permissions?.[Berechtigung.RollenVerwalten]) {
        res.status(401).json({
            success: false,
            message: 'Du hast nicht die notwendigen Berechtigungen.'
        });
        return;
    }
    const { rolle } = req.body;
    const dbMessage = await getAuthStore().deleteRole(rolle);
    res.status(200).json(dbMessage);
});

export { router };
