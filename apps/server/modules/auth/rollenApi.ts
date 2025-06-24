import express from 'express';
import { Request, Response } from 'express';
import {
    CreateRoleRequestBody,
    CreateRoleResponseBody,
    DeleteRoleRequestBody,
    DeleteRoleResponseBody,
    UpdateRoleRequestBody,
} from '@thesis/auth';
import { Berechtigung } from '@thesis/rollen';
import { getAuthStore } from '../../singleton';
import { getErrorResponse, getInternalErrorResponse, getNoPermissionResponse, getNoSessionResponse } from './permissionsUtil';
import { countUsersWithPermission, countUsersWithRole } from './util';

let router = express.Router();

/**
 * Rolle erstellen Endpunkt
 */
router.post('/',async (
    req: Request<{}, {}, CreateRoleRequestBody>,
    res: Response<CreateRoleResponseBody>
): Promise<any> => {
    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    if (!req.permissions?.[Berechtigung.RollenVerwalten]) {
        return getNoPermissionResponse(res)
    }
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

router.patch('/', async (req: Request<{}, {}, UpdateRoleRequestBody>, res): Promise<any> => {
    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    if (!req.permissions?.[Berechtigung.RollenVerwalten]) {
        return getNoPermissionResponse(res)
    }
    const { rollenbezeichnung, updated } = req.body;

    // Mindestens eine Person muss über die Rolle zur Verwaltung von Rollen verfügen.

    // 1. Zählen, wie viele Rollen diese Berechtigung haben.
    const rolesWithPermission = (await getAuthStore().getRoles() ?? []).filter(role => role.berechtigungen[Berechtigung.RollenVerwalten] == true)
    const countRolesWithPermission = rolesWithPermission.length

    // 2. Wenn nur eine Rolle die Berechtigung hat und die Berechtigung verändert wird.
    if (countRolesWithPermission == 1 && updated.rolle == rolesWithPermission[0].rolle) {
        return res.status(400).json({
             success: false,
             message: 'Mindestens eine Person muss über die Rolle zur Verwaltung von Rollen verfügen.'
        })
    } 

    const dbMessage = await getAuthStore().updateRole(rollenbezeichnung, updated);
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
router.delete('/', async (req: Request<{}, {}, DeleteRoleRequestBody>, res: Response<DeleteRoleResponseBody>): Promise<any> => {
    if(req.userId == undefined) {
        return getNoSessionResponse(res);
    }
    if (!req.permissions?.[Berechtigung.RollenVerwalten]) {
        return getNoPermissionResponse(res)
    }
    
    const { rolle } = req.body;
    // Rollen die aktuell zugewiesen sind, können nicht gelöscht werden
    const amountOfUsersWithAccordingRole = await countUsersWithRole(rolle)
    if (amountOfUsersWithAccordingRole != 0) {
        return res.status(400).json({
            success: false,
            message: 'Rollen die aktuell zugewiesen sind, können nicht gelöscht werden.'
        })
    }

    const dbMessage = await getAuthStore().deleteRole(rolle);
    res.status(200).json(dbMessage);
});

export { router };
