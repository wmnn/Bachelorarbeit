import { User } from "@thesis/auth";
import { getDB } from "../../singleton";
import { NextFunction } from "express";
import { Request } from "express";

export const addRoleDataToUser = async (user: User) => {
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

export const getPermissions = async (rolle: string) => {
    const roles = await getDB().getRoles();

    if (!roles) {
        return undefined
    }

    for (const role of roles) {
        if (role.rolle === rolle) {
            return role.berechtigungen
        }
    }
    return undefined
    
};

export const rolleMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const rolle = req.rolle
    if (!rolle) {
        next();
        return;
    }
    const permission = await getPermissions(rolle)
    if (!permission) {
        next();
        return;
    }
    req.permissions = permission;
    next();
};