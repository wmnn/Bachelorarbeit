import { handleRedirection, SCHUELER_ENDPOINT } from "@thesis/config";
import type { Schueler } from "../models";

export type EditSchuelerRequestBody = { } & Schueler

export interface EditSchuelerResponseBody {
    success: boolean;
    message: string;
}


export const editSchueler = async (
    schueler: Schueler,
    schuelerId: string
) => {

    try {
        const res = await fetch(SCHUELER_ENDPOINT + `/${schuelerId}`, {
            body: JSON.stringify(schueler),
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
        })

        const data = await res.json();
                
        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as EditSchuelerResponseBody;
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }

}