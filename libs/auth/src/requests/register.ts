import { AUTH_API_ENDPOINT, REGISTER_ENDPOINT } from "@thesis/config"
import { User } from "../models";

export type RegisterRequestBody = {} & User

export interface RegisterResponseBody {
    status: number;
    message?: string;
    user?: User;
}

export const register = async (vorname: string, nachname: string, email: string, passwort: string) => {

    const user: RegisterRequestBody = {
        email,
        passwort,
        vorname,
        nachname
    }
    const res: RegisterResponseBody = await fetch(AUTH_API_ENDPOINT + REGISTER_ENDPOINT, {
        body: JSON.stringify(user),
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
    })

    return res;

}