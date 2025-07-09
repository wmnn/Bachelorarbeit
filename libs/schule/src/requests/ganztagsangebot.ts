import { GANZTAGSANGEBOT_ENDPOINT, handleRedirection } from '@thesis/config'
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

        const data = await res.json();
                
        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as Ganztagsangebot | undefined;
        
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

        const data = await res.json();
        
        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as Ganztagsangebot[];
        
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

        const data = await res.json();
        
        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as CreateGanztagsangebotResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }
}

export const editGanztagsangebot = async (ganztagsangebot: Ganztagsangebot, schuljahr: Schuljahr, halbjahr: Halbjahr) => {
    try {
        const res = await fetch(GANZTAGSANGEBOT_ENDPOINT + `/${ganztagsangebot.id ?? -1}?schuljahr=${schuljahr}&halbjahr=${halbjahr}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(ganztagsangebot)
        })

        const data = await res.json();
        
        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }
}

export interface DeleteGanztagsangebotRequestBody {
   ganztagsangebotId: number,
   schuljahr: Schuljahr,
    halbjahr: Halbjahr
}

export interface DeleteGanztagsangebotResponseBody {
    success: boolean;
    message: string;
}

export const deleteGanztagsangebot = async (ganztagsangebotId: number, schuljahr: Schuljahr, halbjahr: Halbjahr) => {

    try {
        const res = await fetch(GANZTAGSANGEBOT_ENDPOINT, {
            method: 'DELETE',
            body: JSON.stringify({
                ganztagsangebotId,
                schuljahr,
                halbjahr
            } as DeleteGanztagsangebotRequestBody),
            headers: {
                'content-type': 'application/json'
            },
        })

        const data = await res.json();
        
        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as DeleteGanztagsangebotResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }

}
