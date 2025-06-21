import { User } from "@thesis/auth";
import { Berechtigung, Berechtigungen } from "@thesis/rollen";
import { NextFunction } from "express";
import { Request } from "express";
import { getAuthStore } from "../../singleton";

export async function searchUser<T extends Berechtigung>(query: string, berechtigung: T, berechtigungValue: Berechtigungen[T][]): Promise<User[] | undefined> {
    let users = await getAuthStore().getUsers();
    let roles = await getAuthStore().getRoles();

    if (!users || !roles) {
        return;
    }
    roles = roles.filter(role => {
        return berechtigungValue.includes(role.berechtigungen[berechtigung])
    })

    users = users.filter(user => {
        if (roles.some(role => role.rolle === user.rolle)) {
            return true;
        }
        return false;
    })

    users = users.filter(user => {
        return `${user.vorname} ${user.vorname}`.includes(query)
    }).splice(0, 10)
    return users;
}

export const addRoleDataToUser = async (user: User) => {
    if (!user.rolle) {
        return user;
    }

    if (typeof user.rolle !== 'string') {
        return user;
    }

    const roles = await getAuthStore().getRoles();

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
    const roles = await getAuthStore().getRoles();

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