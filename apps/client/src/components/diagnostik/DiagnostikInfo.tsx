import { getMindeststandard, type Diagnostik } from "@thesis/diagnostik"
import { ButtonLight } from "../ButtonLight"
import { downloadDateien } from "./Diagramme/util"
import { userContext } from "@/context/UserContext"
import { use } from "react"
import { Berechtigung } from "@thesis/rollen"
import { useUserStore } from "../auth/UserStore"
import { useAllUsers } from "../shared/useAllUsers"

export const DiagnostikInfo = ({ diagnostik }: { diagnostik : Diagnostik }) => {

    const { user } = use(userContext)
    useAllUsers()
    const users = useUserStore(store => store.users)
    const entry = users.find(o => o.id == diagnostik.userId)
    const nutzerLabel = entry ? `${entry?.vorname} ${entry?.nachname}` : diagnostik.userId

    if (typeof user?.rolle === "string") {
        return;
    }
    
    return <div className="flex flex-col gap-4">
        <div>
            <label>
                Name
            </label>
            <p>{diagnostik.name}</p>
        </div>

        {
            user?.rolle?.berechtigungen[Berechtigung.DiagnostikverfahrenRead] === "alle" && <div>
                <label>
                    Nutzer
                </label>
                <p>{nutzerLabel}</p>
            </div>
        }
        
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
                Mindeststandard
            </label>
            <p>{getMindeststandard(diagnostik)}</p>
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