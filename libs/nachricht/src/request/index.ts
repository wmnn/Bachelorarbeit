import { handleRedirection, NACHRICHTEN_ENDPOINT } from '../../../config/config';
import { type Nachricht, type NachrichtenTyp } from '../model'


export const getAllNachrichten = async (typ: NachrichtenTyp): Promise<Nachricht[]> => {

    try {
        const res = await fetch(NACHRICHTEN_ENDPOINT + `/all?typ=${typ}`, {
            method: 'GET',
        })

        const data = await res.json();
                
        if (res.status === 401) {
            handleRedirection(data.redirect)
        }
    
        return data as Nachricht[];
        
    } catch (e) {
        return []
    }
}

export const getNachrichten = async (id: number, typ: NachrichtenTyp): Promise<Nachricht[]> => {

    try {
        const res = await fetch(NACHRICHTEN_ENDPOINT + `?id=${id}&typ=${typ}`, {
            method: 'GET',
        })

        const data = await res.json();
                
        if (res.status === 401) {
            handleRedirection(data.redirect)
        }
    
        return data as Nachricht[];
        
    } catch (e) {
        return []
    }
}

export interface NachrichtErstellenRequestBody {
    inhalt: string,
    id: number,
    typ: NachrichtenTyp
}

export interface NachrichtErstellenResponseBody {
    success: boolean,
    message: string,
}

export const nachrichtErstellen = async (inhalt: string, id: number, typ: NachrichtenTyp) => {

    try {
        const res = await fetch(NACHRICHTEN_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify({
                inhalt, 
                id,
                typ
            }),
            headers: {
                'content-type': 'application/json'
            },
        })

        const data = await res.json();
                
        if (res.status === 401) {
            handleRedirection(data.redirect)
        }
    
        return data as NachrichtErstellenResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Die Nachricht konnte nicht erstellt werden.'
        };
    }
}

export const nachrichtLoeschen = async (nachrichtId: number): Promise<NachrichtErstellenResponseBody> => {

    try {
        const res = await fetch(NACHRICHTEN_ENDPOINT + `?nachrichtId=${nachrichtId}`, {
            method: 'DELETE',
        })

        const data = await res.json();
                
        if (res.status === 401) {
            handleRedirection(data.redirect)
        }
    
        return data as NachrichtErstellenResponseBody
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        }
    }
}