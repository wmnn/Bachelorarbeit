import { AUTH_API_ENDPOINT, handleRedirection, LOGOUT_ENDOINT } from "@thesis/config";

export const logout = async (): Promise<boolean> => {

    try {
        const res = await fetch(AUTH_API_ENDPOINT + LOGOUT_ENDOINT, {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            },
        })

        const data = await res.json();
        
        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return res.status === 200;
        
    } catch (e) {
        return false;
    }
    
}