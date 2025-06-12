import { GANZTAGSANGEBOT_ENDPOINT } from '@thesis/config'
import { type Ganztagsangebot } from '../models/ganztagsangebot';
import type { Halbjahr, Schuljahr } from '../models';


export const getGanztagsangebot = async (schuljahr: Schuljahr, halbjahr: Halbjahr, ganztagsangebotId: number) => {
    try {
        const res = await fetch(GANZTAGSANGEBOT_ENDPOINT + `/${ganztagsangebotId}?schuljahr=${schuljahr}&halbjahr=${halbjahr}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            },
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        return await res.json() as Ganztagsangebot | undefined;
        
    } catch (e) {
        return undefined
    }
}

export const getGanztagsangebote = async (schuljahr: Schuljahr, halbjahr: Halbjahr) => {
    try {
        const res = await fetch(GANZTAGSANGEBOT_ENDPOINT + `?schuljahr=${schuljahr}&halbjahr=${halbjahr}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            }
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        return await res.json() as Ganztagsangebot[];
        
    } catch (e) {
        return []
    }
}

export type CreateGanztagsangebotRequestBody = Ganztagsangebot

export interface CreateGanztagsangebotResponseBody {
    success: boolean;
    message: string;
}


export const createGanztagsangebot = async (ganztagsangebot: Ganztagsangebot) => {
    try {
        const res = await fetch(GANZTAGSANGEBOT_ENDPOINT, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(ganztagsangebot)
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        return await res.json() as CreateGanztagsangebotResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }
}