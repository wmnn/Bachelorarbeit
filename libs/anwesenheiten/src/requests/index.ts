import { ANWESENHEITEN_ENDPOINT } from "../../../config/config";
import type { Anwesenheiten, AnwesenheitTyp } from "../models";

export interface UpdateStatusReqBody {
    schuelerId: string,
    status: Anwesenheiten,
    typ: AnwesenheitTyp,
    datum: string
}
export interface UpdateStatusResBody {
    success: false,
    message: string
}

export const updateStatus = async (
    schuelerId: number,
    status: Anwesenheiten,
    typ: AnwesenheitTyp,
    datum: string,
) => {
    try {
        const res = await fetch(ANWESENHEITEN_ENDPOINT, {
            body: JSON.stringify({
                schuelerId,
                status,
                typ,
                datum
            }),
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }

        return await res.json() as UpdateStatusResBody;
    } catch (e) {
        return undefined;
    }

}

export interface DeleteStatusReqBody {
    schuelerId: number,
    typ: AnwesenheitTyp,
    datum: string
}

export const deleteStatus = async (
    schuelerId: number,
    typ: AnwesenheitTyp,
    datum: string,
) => {
    try {
        const res = await fetch(ANWESENHEITEN_ENDPOINT, {
            body: JSON.stringify({
                schuelerId,
                typ,
                datum
            } as DeleteStatusReqBody),
            method: 'DELETE',
            headers: {
                'content-type': 'application/json'
            },
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }

        return await res.json() as UpdateStatusResBody;
    } catch (e) {
        return undefined;
    }

}