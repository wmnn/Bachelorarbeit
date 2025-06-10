import { Rolle } from "../models/role"

export const ROLLE_ENDPOINT = '/api/role'
export type CreateRoleRequestBody = Rolle
export interface CreateRoleResponseBody {
    success: boolean,
    message: string,
}

export const createRole = async (rolle: Rolle) => {
    
    try {
        const res = await fetch(ROLLE_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify(rolle),
            headers: {
                'content-type': 'application/json'
            },
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
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
        const res = await fetch(ROLLE_ENDPOINT, {
            method: 'DELETE',
            body: JSON.stringify({
                rolle
            } as DeleteRoleRequestBody),
            headers: {
                'content-type': 'application/json'
            },
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        return await res.json() as DeleteRoleResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }

}

export interface UpdateRoleRequestBody {
    rollenbezeichnung: string
    updated: Rolle,
}
export type UpdateRoleResponseBody = CreateRoleResponseBody

/**
 * Request um eine Rolle zu aktualisieren
 * @param rollenbezeichnung die Rollenbezeichnung der Rolle die aktualisiert wird
 * @param updated die aktualisierte Rolle
 * @returns 
 */
export const updateRole = async (rollenbezeichnung: string, updated: Rolle) => {

    try {
        const res = await fetch(ROLLE_ENDPOINT, {
            method: 'PATCH',
            body: JSON.stringify({
                rollenbezeichnung,
                updated
            } as UpdateRoleRequestBody),
            headers: {
                'content-type': 'application/json'
            },
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        return await res.json() as UpdateRoleResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Die Rolle konnte nicht aktualisiert werden.'
        };
    }

}