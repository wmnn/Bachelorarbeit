import { AUTH_2_FACTOR_API_ENDPOINT, handleRedirection } from "@thesis/config";
import { LoginRedirectAction } from "./login";


export interface Setup2FactorAuthenticationResponseBody {
    success: boolean,
    message: string,
    data?: any,
    redirect?: LoginRedirectAction
}
export const setup2FactorAuthentication = async (): Promise<Setup2FactorAuthenticationResponseBody> => {

    try {
        const res = await fetch(AUTH_2_FACTOR_API_ENDPOINT + `/setup`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            },
        })

        const data = await res.json();
        
        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as Setup2FactorAuthenticationResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }
}

export interface VerifyValidate2FactorAuthenticationResponseBody {
    success: boolean,
    message: string,
    redirect?: LoginRedirectAction
}
export const verify2FactorAuthentication = async (token: string): Promise<VerifyValidate2FactorAuthenticationResponseBody> => {

    try {
        const res = await fetch(AUTH_2_FACTOR_API_ENDPOINT + `/verify`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                token
            })
        })

        const data = await res.json();
        
        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as VerifyValidate2FactorAuthenticationResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }
}

export const validate2FactorAuthentication = async (token: string): Promise<any> => {

    try {
        const res = await fetch(AUTH_2_FACTOR_API_ENDPOINT + `/validate`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                token
            })
        })

        const data = await res.json();

        if (res.status === 200) {
            handleRedirection(data.redirect)
        }

        return data
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }
}