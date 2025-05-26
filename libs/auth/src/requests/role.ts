import { AUTH_API_ENDPOINT, REGISTER_ENDPOINT } from "@thesis/config"
import { Rolle, User } from "../models";

export const ROLLE_ENDPOINT = '/role'
export type CreateRoleRequestBody = Rolle
export interface CreateRoleResponseBody {
    success: boolean,
    message: string,
}

export const createRole = async (rolle: Rolle) => {
    
    try {
        const res = await fetch(AUTH_API_ENDPOINT + ROLLE_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify(rolle),
            headers: {
                'content-type': 'application/json'
            },
        })
    
        return await res.json() as CreateRoleResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Die Rolle konnte nicht erstellt werden.'
        };
    }

}

export interface DeleteRoleRequestBody {
    rolle: string,
}

export type DeleteRoleResponseBody = CreateRoleResponseBody;


export const deleteRole = async (rolle: string) => {

    try {
        const res = await fetch(AUTH_API_ENDPOINT + ROLLE_ENDPOINT, {
            method: 'DELETE',
            body: JSON.stringify({
                rolle
            } as DeleteRoleRequestBody),
            headers: {
                'content-type': 'application/json'
            },
        })
    
        return await res.json() as DeleteRoleResponseBody;
        
    } catch (e) {
        return undefined;
    }

}