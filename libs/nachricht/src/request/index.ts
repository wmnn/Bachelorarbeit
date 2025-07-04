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

export const nachrichtBearbeiten = async (inhalt: string, nachrichtId: number) => {

    try {
        const res = await fetch(NACHRICHTEN_ENDPOINT, {
            method: 'PATCH',
            body: JSON.stringify({
                inhalt, 
                nachrichtId,
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
            message: 'Die Nachricht konnte nicht bearbeitet werden.'
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

export const getNachrichtenVorlagen = async (typ: NachrichtenTyp) => {

    try {
        const res = await fetch(NACHRICHTEN_ENDPOINT + `/vorlage?typ=${typ}`, {
            method: 'GET',
        })

        const data = await res.json();
                
        if (res.status === 401) {
            handleRedirection(data.redirect)
        }
    
        return data as string[];
        
    } catch (e) {
        return []
    }
}


export const nachrichtenVorlagenSpeichern = async (klassenVorlagen: string[], schuelerVorlagen: string[]) => {

    try {
        const res = await fetch(NACHRICHTEN_ENDPOINT + '/vorlage', {
            method: 'POST',
            body: JSON.stringify({
                klassenVorlagen, 
                schuelerVorlagen
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
            message: 'Die Nachrichtenvorlage konnte nicht erstellt werden.'
        };
    }
}
