import type { User } from "@thesis/auth";
import type { Berechtigungen } from "@thesis/rollen";

export function userHasPermission<T extends keyof Berechtigungen>(user: User | undefined, permission: T, permissionValue: Berechtigungen[T]): boolean {
    if (!user) {
        return false;
    }
    if (typeof user?.rolle === "string") {
        return false
    }
    return user?.rolle?.berechtigungen[permission] === permissionValue
} 