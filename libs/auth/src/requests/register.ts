import { AUTH_API_ENDPOINT, REGISTER_ENDPOINT } from "@thesis/config"
import { User } from "../models";

export type RegisterRequestBody = {} & User

export interface RegisterResponseBody {
    success: boolean;
    message: string;
}

export const register = async (vorname: string, nachname: string, email: string, passwort: string) => {

    const user: RegisterRequestBody = {
        email,
        passwort,
        vorname,
        nachname
    }

    try {
        const res = await fetch(AUTH_API_ENDPOINT + REGISTER_ENDPOINT, {
            body: JSON.stringify(user),
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
        })

        return await res.json() as RegisterResponseBody;
    } catch (e) {
        return undefined;
    }

}