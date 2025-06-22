import type { Diagnostik } from "@thesis/diagnostik";
import { Dialog } from "../dialog/Dialog";
import { ButtonLight } from "../ButtonLight";

export const DiagnostikListItemInfoDialog = ({ diagnostik, closeDialog }: { 
    diagnostik : Diagnostik,
    closeDialog: () => void
}) => {
    return <Dialog className="p-8 flex flex-col gap-2">

        <div>
            <label>
                Name
            </label>
            <p>{diagnostik.name}</p>
        </div>
        
        <div>
            <label>
                Beschreibung
            </label>
            <p>{diagnostik.beschreibung}</p>
        </div>

        <div>
            <label>
                Obere Grenze
            </label>
            <p>{diagnostik.obereGrenze}</p>
        </div>

        <div>
            <label>
                Untere Grenze
            </label>
            <p>{diagnostik.untereGrenze}</p>
        </div>

        <div>
            <label>
                Geeignete Klassen
            </label>
            {
                diagnostik?.geeigneteKlassen?.map(klasse => <p>{klasse}</p>)
            }
        </div>

        <div>
            <label>
                Kategorien
            </label>
            {
                diagnostik?.kategorien?.map(kategorie => <p>{kategorie}</p>)
            }
        </div>

        


        <ButtonLight onClick={closeDialog}>
            Schließen
        </ButtonLight>
    </Dialog>
}