import { AUTH_API_ENDPOINT, REGISTER_ENDPOINT } from "@thesis/config"
import { Rolle, User } from "../models";

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
    
        return await res.json() as UsersResponseBody;
        
    } catch (e) {
        return undefined;
    }

}

export const deleteUser = async (userId: number) => {

    try {
        const res = await fetch(AUTH_API_ENDPOINT + "/user", {
            method: 'DELETE',
            body: JSON.stringify({
                userId
            }),
            headers: {
                'content-type': 'application/json'
            },
        })
    
        return await res.json() as UsersResponseBody;
        
    } catch (e) {
        return undefined;
    }

}