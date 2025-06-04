import { SCHUELER_ENDPOINT } from "@thesis/config";
import type { SchuelerSimple } from '../models'

export const getSchueler = async () => {
    try {
        const res = await fetch(SCHUELER_ENDPOINT, {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            },
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        return await res.json() as SchuelerSimple[];
        
    } catch (e) {
        return [];
    }
}
