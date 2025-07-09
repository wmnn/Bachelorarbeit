import { DIAGNOSTIK_ENDPOINT, handleRedirection } from "../../../config/config";
import { Sichtbarkeit, type Auswertungsgruppe, type Diagnostik, type DiagnostikenSchuelerData, type DiagnostikTyp, type Ergebnis, type Row, type UploadedFile } from "../models";

export type CreateDiagnostikRequestBody = {
    diagnostik: string,
    files: UploadedFile[]
}
export interface CreateDiagnostikResponseBody {
    success: boolean,
    message: string,
}

export const createDiagnostik = async (diagnostik: Diagnostik, files: File[]) => {
    
    try {
        const formData = new FormData();
        formData.append('diagnostik', JSON.stringify(diagnostik));
        for (const file of files) {
            formData.append('files', file);
        }

        const res = await fetch(DIAGNOSTIK_ENDPOINT, {
            method: 'POST',
            body: formData
        })

        const data = await res.json();

        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as CreateDiagnostikResponseBody
        
    } catch (e) {
        return {
            success: false,
            message: 'Die Diagnostik konnte nicht erstellt werden.'
        };
    }

}

export const copyDiagnostik = async (diagnostikId: string) => {
    
    try {
        const res = await fetch(DIAGNOSTIK_ENDPOINT + `/copy/${diagnostikId}`, {
            method: 'POST'
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        const data = await res.json();

        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as CreateDiagnostikResponseBody
        
    } catch (e) {
        return {
            success: false,
            message: 'Die Diagnostik konnte nicht kopiert werden.'
        };
    }

}

export const updateAuswertungsgrupen = async (diagnostikId: string, auswertungsgruppen: Auswertungsgruppe[]) => {
    try {
        const res = await fetch(DIAGNOSTIK_ENDPOINT + `/auswertungsgruppen/${diagnostikId}`, {
            method: 'POST',
            body: JSON.stringify(auswertungsgruppen),
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const data = await res.json();

        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as CreateDiagnostikResponseBody

    } catch (e) {
        return {
            success: false,
            message: 'Die Auswertungsgruppen konnten nicht aktualisiert werden.'
        };
    }
}


export const updateSichtbarkeit = async (diagnostikId: string, sichtbarkeit: Sichtbarkeit) => {
    
    try {
        const res = await fetch(DIAGNOSTIK_ENDPOINT + `/sichtbarkeit?diagnostikId=${diagnostikId}&sichtbarkeit=${sichtbarkeit}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
        })

        const data = await res.json();

        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as CreateDiagnostikResponseBody
        
    } catch (e) {
        return {
            success: false,
            message: 'Die Sichtbarkeit konnte nicht aktualisiert werden.'
        };
    }

}

export const editDiagnostik = async (diagnostik: Diagnostik, files: File[]) => {
    
    try {
        const formData = new FormData();
        formData.append('diagnostik', JSON.stringify(diagnostik));
        for (const file of files) {
            formData.append('files', file);
        }

        const res = await fetch(DIAGNOSTIK_ENDPOINT, {
            method: 'PUT',
            body: formData
        })

        const data = await res.json();

        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as CreateDiagnostikResponseBody
        
    } catch (e) {
        console.log(e)
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

        const data = await res.json();

        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as GetDiagnostikenResponseBody
        
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

        const data = await res.json();

        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as Diagnostik | undefined
        
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

        const data = await res.json();

        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as AddErgebnisseResponseBody
        
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

        const data = await res.json();

        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as Row[];
        
    } catch (e) {
        return []
    }

}


export interface GetSchuelerDataResponseBody {
    success: boolean,
    message: string,
    data?: DiagnostikenSchuelerData[]
}

export const getDiagnostikSchuelerData = async (schuelerId: string) => {
    
    try {
        const res = await fetch(DIAGNOSTIK_ENDPOINT + `/schueler?schuelerId=${schuelerId}`, {
            method: 'GET',
        })

        const data = await res.json();

        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as GetSchuelerDataResponseBody
        
    } catch (e) {
        console.log(e)
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        }
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

        const data = await res.json();

        if (res.status === 403) {
            handleRedirection(data.redirect)
        }
    
        return data as CreateDiagnostikResponseBody
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }

}