import { AUTH_API_ENDPOINT, handleRedirection } from "@thesis/config"
import { Berechtigung, type Berechtigungen } from "@thesis/rollen"
import { type User } from "../models"

export interface SearchUserRequestBody <T extends Berechtigung>{
    berechtigung: T,
    berechtigungValue: Berechtigungen[T][],
    query: string,
}

export type SearchUserResponseBody = {
    success: boolean,
    message: string,
    users: User[]
}

export const searchUser = async <T extends Berechtigung>(
    query: string, 
    berechtigung: T,  
    berechtigungValue: Berechtigungen[T][]
) => {
    try {
        const res = await fetch(AUTH_API_ENDPOINT + '/users/search', {
            method: 'POST',
            body: JSON.stringify({
                query,
                berechtigung,
                berechtigungValue
            }),
            headers: {
                'content-type': 'application/json'
            },
        })

        const data = await res.json();
        
        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as SearchUserResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.',
            users: []
        };
    }
}