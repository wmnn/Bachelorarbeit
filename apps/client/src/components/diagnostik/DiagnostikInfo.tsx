import type { Diagnostik } from "@thesis/diagnostik"
import { ButtonLight } from "../ButtonLight"
import { downloadDateien } from "./Diagramme/util"

export const DiagnostikInfo = ({ diagnostik }: { diagnostik : Diagnostik }) => {
    return <div className="flex flex-col gap-4">
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
                Dateien
            </label>
            {diagnostik.files?.map(file => <p>{file}</p>)}
            {
                diagnostik?.files && diagnostik?.files?.length > 0 && <ButtonLight onClick={() => downloadDateien(`${diagnostik.id ?? -1}`, diagnostik.files ?? [])}>
                    Download
                </ButtonLight>
            }
            
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
    </div>
}