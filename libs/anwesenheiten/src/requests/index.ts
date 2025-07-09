import { ANWESENHEITEN_ENDPOINT, handleRedirection } from "../../../config/config";
import type { Anwesenheiten, AnwesenheitTyp } from "../models";
import type { Schuljahr } from "@thesis/schule";

export interface AnwesenheitResponseData {
    datum: string,
    typ: AnwesenheitTyp,
    status: Anwesenheiten
}
export const getAnwesenheiten = async (
    schuelerId: number,
    schuljahr: Schuljahr,
    typ: AnwesenheitTyp
) => {
    try {
        const res = await fetch(ANWESENHEITEN_ENDPOINT  + `/${schuelerId}?schuljahr=${schuljahr}&typ=${typ}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            },
        })

        const data = await res.json();
        
        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as AnwesenheitResponseData[];
    } catch (e) {
        return undefined;
    }

}

export interface UpdateStatusReqBody {
    status: Anwesenheiten,
    typ: AnwesenheitTyp, // Ganztag oder Unterricht
    startDatum: string,
    endDatum: string,
}
export type UpdateStatusBatchReqBody = {
    schuelerIds: number[]
} & UpdateStatusReqBody

export interface UpdateStatusResBody {
    success: false,
    message: string
}

export const updateStatus = async (
    schuelerId: number,
    status: Anwesenheiten,
    typ: AnwesenheitTyp,
    startDatum: string,
    endDatum: string,
) => {
    try {
        const res = await fetch(ANWESENHEITEN_ENDPOINT  + `/${schuelerId}`, {
            body: JSON.stringify({
                status,
                typ,
                startDatum, 
                endDatum
            }),
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
        })

        const data = await res.json();
        
        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as UpdateStatusResBody;
    } catch (e) {
        return undefined;
    }

}

export const updateStatusBatch = async (
    schuelerIds: number[],
    status: Anwesenheiten,
    typ: AnwesenheitTyp,
    startDatum: string,
    endDatum: string,
) => {
    try {
        const res = await fetch(ANWESENHEITEN_ENDPOINT, {
            body: JSON.stringify({
                schuelerIds,
                status,
                typ,
                startDatum, 
                endDatum
            }),
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
        })

        const data = await res.json();
        
        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as UpdateStatusResBody;
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

        const data = await res.json();
        
        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as UpdateStatusResBody;
    } catch (e) {
        return undefined;
    }

}