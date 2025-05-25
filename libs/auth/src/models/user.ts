import { Rolle } from "./role"

export type User = {
    email: string,
    passwort?: string,
    vorname?: string,
    nachname?: string,
    rolle?: string | Rolle
}