import { DIAGNOSTIK_ENDPOINT } from "../../../config/config";
import type { Diagnostik, DiagnostikTyp, Ergebnis, Row } from "../models";

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

export const editDiagnostik = async (diagnostik: Diagnostik) => {
    
    try {
        const res = await fetch(DIAGNOSTIK_ENDPOINT, {
            method: 'PUT',
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
            message: 'Die Diagnostik konnte nicht bearbeitet werden.'
        };
    }

}

export type GetDiagnostikenResponseBody = Diagnostik[]

export const getDiagnostiken = async (speicherTyp: DiagnostikTyp) => {
    
    try {
        const res = await fetch(DIAGNOSTIK_ENDPOINT + `?typ=${speicherTyp}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            },
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        return await res.json() as GetDiagnostikenResponseBody;
        
    } catch (e) {
        return []
    }

}


export const getDiagnostik = async (diagnostikId: number) => {
    
    try {
        const res = await fetch(DIAGNOSTIK_ENDPOINT + `/${diagnostikId}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            },
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        return await res.json() as Diagnostik | undefined;
        
    } catch (e) {
        return undefined
    }

}

export interface AddErgebnisseResponseBody {
    success: boolean,
    message: string
}

export const addErgebnisse = async (ergebnisse: Ergebnis[], diagnostikId: string, datum: string) => {
    
    try {
        const res = await fetch(DIAGNOSTIK_ENDPOINT + `/${diagnostikId}?datum=${datum}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(ergebnisse)
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        return await res.json() as AddErgebnisseResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        }
    }

}

export const getErgebnisse = async (diagnostikId: string) => {
    
    try {
        const res = await fetch(DIAGNOSTIK_ENDPOINT + `/${diagnostikId}/data`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            },
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        return await res.json() as Row[];
        
    } catch (e) {
        return []
    }

}


export const deleteDiagnostik = async (diagnostikId: string) => {

    try {
        const res = await fetch(DIAGNOSTIK_ENDPOINT + `/${diagnostikId}`, {
            method: 'DELETE',
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
            message: 'Ein Fehler ist aufgetreten.'
        };
    }

}