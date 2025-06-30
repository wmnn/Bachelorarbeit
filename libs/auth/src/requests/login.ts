import { AUTH_API_ENDPOINT, LOGIN_ENDPOINT } from "@thesis/config"
import type { User } from "../models";

export interface LoginRequestBody {
    email: string;
    passwort: string;
}

export interface LoginResponseBody {
    success: boolean;
    message?: string;
    user?: User;
    redirect?: LoginRedirectAction
}

export enum LoginRedirectAction {
    SETUP_2_FACTOR_AUTHENTICATION,
    LOGIN_SUCCESS,
    REDIRECT_TO_LOGIN,
    VERIFY_2_FACTOR_CODE,
    VALIDATE_2_FACTOR_CODE
}

export const login = async (email: string, passwort: string): Promise<LoginResponseBody> => {

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
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }
    
}