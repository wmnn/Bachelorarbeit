import { Link } from "@tanstack/react-router";
import { SchuelerIcons } from "../SchuelerIcons";
import { AnwesenheitTyp } from "@thesis/anwesenheiten";
import { GeprüftCheckbox } from "../../anwesenheitsstatus/GeprüftCheckbox";
import type { Schueler } from "@thesis/schueler";
import { AnwesenheitsstatusSchuelerListSelect } from "@/components/anwesenheitsstatus/AnwesenheitsstatusSchuelerListSelect";
import { NachrichtNotification } from "@/components/shared/Nachricht/NachrichtNotification";
import { countUnreadMessages, NachrichtenTyp } from "@thesis/nachricht";
import { useNachrichten } from "@/components/shared/Nachricht/useNachrichten";
import { userHasPermission } from "@/components/auth/userHasPermission";
import { Berechtigung } from "@thesis/rollen";
import { use } from "react";
import { userContext } from "@/context/UserContext";

export function SchuelerListItem({ schueler, typ, showDerzeitigeKlasse = false }: { schueler: Schueler, typ: AnwesenheitTyp, showDerzeitigeKlasse?: boolean }) {
   
    const nachrichtenQuery = useNachrichten(NachrichtenTyp.SCHÜLER, schueler.id ?? -1)
    const isUnreadMessage = countUnreadMessages([...nachrichtenQuery.query.data]) > 0
    const { user } = use(userContext)

    return <li className='py-2 px-8 flex flex-col md:flex-row justify-between w-[100%]'>
       
        <Link 
            to="/schueler/$schuelerId"
            params={{
                schuelerId: `${schueler.id ?? -1}`
            }}
            className="basis-0 grow-1"
        >
            <div className="flex gap-2 items-center">
                <p>{schueler.vorname}</p> 
                <p>{schueler.nachname}</p>
                <SchuelerIcons schueler={schueler} />

                {
                    (schueler.derzeitigeKlasse && showDerzeitigeKlasse) && <p className="ml-16">{schueler.derzeitigeKlasse}</p>
                }
                { 
                    isUnreadMessage && <NachrichtNotification />
                }
            </div>
        
        </Link>

        
        <div className='flex gap-6 items-center flex-wrap mt-4 md:mt-0'>

            {
                userHasPermission(user, Berechtigung.AnwesenheitsstatusRead, true ) && <> <div className="flex items-center gap-2">
                        <label className="md:hidden">Heute geprüft:</label>
                        <GeprüftCheckbox schuelerId={schueler.id ?? -1} typ={typ} />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <label className="md:hidden">
                            Status ändern:
                        </label>
                        <AnwesenheitsstatusSchuelerListSelect 
                            typ={typ} 
                            schuelerId={schueler.id ?? -1}
                        />
                    </div>
                </>
            }
            
        </div>
    
    </li>
}