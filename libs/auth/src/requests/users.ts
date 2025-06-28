import { AUTH_API_ENDPOINT, handleRedirection } from "@thesis/config"
import type { User } from "../models";
import type { Rolle } from "@thesis/rollen";

export interface UsersResponseBody {
    users: User[],
    rollen: Rolle[]
}

export const getUsersQueryKey = "users"
export const getUsers = async () => {
    
    try {
        const res = await fetch(AUTH_API_ENDPOINT + "/users", {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            },
        })

        const data = await res.json();
        
        if (res.status === 401) {
            handleRedirection(data.redirect)
        }
    
        return data as UsersResponseBody;
        
    } catch (e) {
        return undefined;
    }

}

export interface DeleteUserRequestBody {
    userId: number,
}
export interface DeleteUserResponseBody {
    success: boolean,
    message: string
}
export const deleteUser = async (userId: number) => {

    try {
        const res = await fetch(AUTH_API_ENDPOINT + "/user", {
            method: 'DELETE',
            body: JSON.stringify({
                userId
            } as DeleteUserRequestBody),
            headers: {
                'content-type': 'application/json'
            },
        })

        const data = await res.json();
        
        if (res.status === 401) {
            handleRedirection(data.redirect)
        }
    
        return data as DeleteUserResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }

}

export interface UpdateUserRequestBody {
    user: User
}
export interface UpdateUserResponseBody {
    success: boolean,
    message: string
}
export const updateUser = async (user: User) => {

    try {
        const res = await fetch(AUTH_API_ENDPOINT + "/user", {
            method: 'PATCH',
            body: JSON.stringify({
                user
            } as UpdateUserRequestBody),
            headers: {
                'content-type': 'application/json'
            },
        })

        const data = await res.json();
        
        if (res.status === 401) {
            handleRedirection(data.redirect)
        }
    
        return data as UpdateUserResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }

}

export interface UpdatePasswordRequestBody {
    userId: number,
    password: string,
    newPassword: string
}

export interface UpdatePasswordResponseBody {
    success: boolean,
    message: string
}
export const updatePassword = async (userId: number, password: string, newPassword: string) => {

    try {
        const res = await fetch(AUTH_API_ENDPOINT + "/password", {
            method: 'PATCH',
            body: JSON.stringify({
                userId,
                password,
                newPassword
            } as UpdatePasswordRequestBody),
            headers: {
                'content-type': 'application/json'
            },
        })

        const data = await res.json();
        
        if (res.status === 401) {
            handleRedirection(data.redirect)
        }
    
        return data as UpdateUserResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }

}