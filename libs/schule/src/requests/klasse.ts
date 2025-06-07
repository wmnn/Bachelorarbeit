import { KLASSEN_ENDPOINT } from '@thesis/config'
import type { Halbjahr, KlassenVersion, Schuljahr } from '../models';

export const getKlassen = async (schuljahr: Schuljahr, halbjahr: Halbjahr) => {
    try {
        const res = await fetch(KLASSEN_ENDPOINT + `?schuljahr=${schuljahr}&halbjahr=${halbjahr}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            },
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        return await res.json();
        
    } catch (e) {
        return [];
    }
}

export type CreateClassRequestBody = KlassenVersion[]
export interface CreateClassResponseBody {
    success: boolean;
    message: string;
}

export const createKlasse = async (klassen: KlassenVersion[]) => {
    try {
        const res = await fetch(KLASSEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(klassen)
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        return await res.json();
        
    } catch (e) {
        return [];
    }
}

