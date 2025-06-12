import { GANZTAGSANGEBOT_ENDPOINT } from '@thesis/config'
import { type Ganztagsangebot } from '../models/ganztagsangebot';

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