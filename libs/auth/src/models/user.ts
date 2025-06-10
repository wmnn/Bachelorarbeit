import type { Rolle } from "../../../rollen/src/models/role"

export type User = {
    id?: number,
    email?: string,
    passwort?: string,
    vorname?: string,
    nachname?: string,
    rolle?: string | Rolle,
    isLocked?: boolean,
    isVerified?: boolean
}