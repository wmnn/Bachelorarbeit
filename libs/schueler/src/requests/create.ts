import { SCHUELER_ENDPOINT } from "@thesis/config";
import type { Schueler } from "../models";

export type CreateSchuelerRequestBody = { } & Schueler

export interface CreateSchuelerResponseBody {
    success: boolean;
    message: string;
}


export const createSchueler = async (
    schueler: Schueler
) => {

    try {
        const res = await fetch(SCHUELER_ENDPOINT, {
            body: JSON.stringify(schueler),
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }

        return await res.json() as CreateSchuelerResponseBody;
    } catch (e) {
        return undefined;
    }

}