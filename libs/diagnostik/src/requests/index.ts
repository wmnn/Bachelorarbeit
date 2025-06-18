import { DIAGNOSTIK_ENDPOINT } from "../../../config/config";
import type { Diagnostik } from "../models";

export type CreateDiagnostikRequestBody = Diagnostik
export interface CreateDiagnostikResponseBody {
    success: boolean,
    message: string,
}

export const createDiagnostik = async (diagnostik: Diagnostik) => {
    
    try {
        const res = await fetch(DIAGNOSTIK_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify(diagnostik),
            headers: {
                'content-type': 'application/json'
            },
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        return await res.json() as CreateDiagnostikResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Die Diagnostik konnte nicht erstellt werden.'
        };
    }

}