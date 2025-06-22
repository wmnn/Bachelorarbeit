import { Link } from "@tanstack/react-router"
import type { Diagnostik } from "@thesis/diagnostik"
import { useState } from "react"
import { DiagnostikListItemInfoDialog } from "./DiagnostikListItemInfoDialog"
import { Edit2, Info, Trash2 } from "lucide-react"
import { useKlassen } from "../shared/useKlassen"
import { getTitle } from "@thesis/schule"
import { Tooltip } from "../Tooltip"
import { DeleteDiagnostikDialog } from "./DeleteDiagnostikDialog"
import { ErrorDialog } from "../dialog/MessageDialog"

export const DiagnostikListItem = ({ diagnostik }: { diagnostik: Diagnostik }) => {

    const [isInfoDialogShown, setIsInfoDialogShown] = useState(false)
    const [isDeleteDialogShown, setIsDeleteDialogShown] = useState(false)
    const [responseMessage, setResponseMsg] = useState('')

    const klassenQuery = useKlassen()

    if (klassenQuery.isPending) {
        return <p>...Loading</p>
    }
    const klassen = klassenQuery.data
    const klasse = klassen.find(item => item.id == diagnostik.klasseId)

    return <li className="px-4 py-4">
        {
            isInfoDialogShown && <DiagnostikListItemInfoDialog 
                closeDialog={() => setIsInfoDialogShown(false)} 
                diagnostik={diagnostik}
            />
        }
        {
            isDeleteDialogShown && <DeleteDiagnostikDialog 
                diagnostikId={`${diagnostik.id ?? -1}`} 
                setResponseMsg={setResponseMsg}
                closeDialog={() => setIsDeleteDialogShown(false)}
            />
        }
        {(responseMessage !== '') && <ErrorDialog message={responseMessage} closeDialog={() => setResponseMsg('')}/>}
        <div className="flex justify-between items-center">
            <Link className="flex gap-2 w-full"
                to="/diagnostikverfahren/$diagnostikId"
                params={{
                    diagnostikId: `${diagnostik.id}`
                }}
            >
                <p>{diagnostik.name}</p>   
                {
                    diagnostik.erstellungsDatum && <label>
                        Erstellt am: {new Date(diagnostik.erstellungsDatum).toLocaleDateString('de')}
                    </label> 
                }
                
            </Link>
            <div className="flex gap-4 items-center">
                <p>{klasse !== undefined && getTitle(klasse)}</p>

                <Tooltip content={'Info'}>
                    <button onClick={() => setIsInfoDialogShown(true)}>
                        <Info />
                    </button>
                </Tooltip>
                

                <Tooltip content={'Bearbeiten'}>
                    <button onClick={() => setIsInfoDialogShown(true)}>
                    <Edit2 />
                </button>
                </Tooltip>
                
                <Tooltip content={'Löschen'}>
                    <button onClick={() => setIsDeleteDialogShown(true)}>
                        <Trash2 />
                    </button>
                </Tooltip>
            </div>
            
            
        </div>        
    
    </li>
}