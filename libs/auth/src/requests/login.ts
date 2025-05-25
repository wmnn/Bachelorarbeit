import { AUTH_API_ENDPOINT, LOGIN_ENDPOINT } from "@thesis/config"
import { User } from "../models";

export interface LoginRequestBody {
    email: string;
    passwort: string;
}

export interface LoginResponseBody {
    status: number;
    message?: string;
    user?: User;
}

export const login = async (email: string, passwort: string): Promise<undefined | LoginResponseBody> => {

    const user: LoginRequestBody = {
        email,
        passwort
    }

    try {
        const res = await fetch(AUTH_API_ENDPOINT + LOGIN_ENDPOINT, {
            body: JSON.stringify(user),
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
        })

        return await res.json() as LoginResponseBody;
        
    } catch (e) {
        return undefined;
    }
    
}