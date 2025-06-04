import { SCHUELER_ENDPOINT } from "@thesis/config";

export interface DeleteSchuelerRequestBody {
   schuelerId: number
}

export interface DeleteSchuelerResponseBody {
    success: boolean;
    message: string;
}

export const deleteSchueler = async (schuelerId: number) => {

    try {
        const res = await fetch(SCHUELER_ENDPOINT, {
            method: 'DELETE',
            body: JSON.stringify({
                schuelerId
            } as DeleteSchuelerRequestBody),
            headers: {
                'content-type': 'application/json'
            },
        })

        if (res.status === 403) {
            window.location.href = '/login'
        }
    
        return await res.json() as DeleteSchuelerResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }

}