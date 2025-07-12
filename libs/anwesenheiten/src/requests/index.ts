import { ANWESENHEITEN_ENDPOINT, handleRedirection } from "../../../config/config";
import type { Anwesenheitsstatus, Anwesenheitstyp } from "../models";
import type { Schuljahr } from "@thesis/schule";

export interface GetAnwesenheitenResponseData {
    datum: string,
    typ: Anwesenheitstyp,
    status: Anwesenheitsstatus
}
export const getAnwesenheiten = async (
    schuelerId: number,
    schuljahr: Schuljahr,
    typ: Anwesenheitstyp,
    redirect: boolean = true
) => {
    try {
        const res = await fetch(ANWESENHEITEN_ENDPOINT  + `/${schuelerId}?schuljahr=${schuljahr}&typ=${typ}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            },
        })

        const data = await res.json();
        
        if (res.status === 403 && redirect) {
            handleRedirection(data.redirect)
        }
    
        return data as GetAnwesenheitenResponseData[];
    } catch (e) {
        return undefined;
    }

}

export interface UpdateStatusReqBody {
    status: Anwesenheitsstatus,
    typ: Anwesenheitstyp, // Ganztag oder Unterricht
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
    status: Anwesenheitsstatus,
    typ: Anwesenheitstyp,
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
    status: Anwesenheitsstatus,
    typ: Anwesenheitstyp,
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
    typ: Anwesenheitstyp,
    datum: string
}

export const deleteStatus = async (
    schuelerId: number,
    typ: Anwesenheitstyp,
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