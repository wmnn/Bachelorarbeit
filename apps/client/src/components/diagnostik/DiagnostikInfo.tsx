import type { Diagnostik } from "@thesis/diagnostik"

export const DiagnostikInfo = ({ diagnostik }: { diagnostik : Diagnostik }) => {
    return <div>
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
    </div>
}