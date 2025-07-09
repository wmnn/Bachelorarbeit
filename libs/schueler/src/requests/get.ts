import { handleRedirection, SCHUELER_ENDPOINT } from "@thesis/config";
import type { Schueler } from '../models'

export const getSchueler = async () => {
    try {
        const res = await fetch(SCHUELER_ENDPOINT, {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            },
        })
        console.log(res)

        const data = await res.json();
                
        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as Schueler[];
        
    } catch (e) {
        return [];
    }
}

export const getSchuelerComplete = async (schuelerId: number) => {
    try {
        const res = await fetch(SCHUELER_ENDPOINT + '/' + schuelerId, {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            },
        })

        const data = await res.json();
        
        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as Schueler | undefined;
        
    } catch (e) {
        return undefined;
    }
}