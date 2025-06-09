import { KLASSEN_ENDPOINT } from '@thesis/config'
import type { Halbjahr, KlassenVersion, Schuljahr } from '../models';
import { User } from '../../../auth/src';

export const getKlasse = async (schuljahr: Schuljahr, halbjahr: Halbjahr, klassenId: number) => {
    try {
        const res = await fetch(KLASSEN_ENDPOINT + `/${klassenId}?schuljahr=${schuljahr}&halbjahr=${halbjahr}`, {
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
        return undefined
    }
}


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

export type CreateClassRequestBody = {
    versionen: KlassenVersion[],
    klassenlehrer: User[]
}

export interface CreateClassResponseBody {
    success: boolean;
    message: string;
}

export const createKlasse = async (klassen: KlassenVersion[], klassenlehrer: User[]) => {
    try {
        const res = await fetch(KLASSEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                versionen: klassen,
                klassenlehrer
            } as CreateClassRequestBody)
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        return await res.json() as CreateClassResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }
}

export interface DeleteKlasseRequestBody {
   klassenId: number
}

export interface DeleteKlasseResponseBody {
    success: boolean;
    message: string;
}

export const deleteKlasse = async (klassenId: number) => {

    try {
        const res = await fetch(KLASSEN_ENDPOINT, {
            method: 'DELETE',
            body: JSON.stringify({
                klassenId
            } as DeleteKlasseRequestBody),
            headers: {
                'content-type': 'application/json'
            },
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        return await res.json() as DeleteKlasseResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }

}
