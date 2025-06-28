import { handleRedirection, SCHUELER_ENDPOINT } from "@thesis/config";

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

        const data = await res.json();
                
        if (res.status === 401) {
            handleRedirection(data.redirect)
        }
    
        return data as DeleteSchuelerResponseBody;
        
    } catch (e) {
        return {
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
        };
    }

}