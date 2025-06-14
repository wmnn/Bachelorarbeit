import { Link } from "@tanstack/react-router";
import { SchuelerIcons } from "../SchuelerIcons";
import { AnwesenheitTyp } from "@thesis/anwesenheiten";
import { GeprüftCheckbox } from "../../anwesenheitsstatus/GeprüftCheckbox";
import type { Schueler } from "@thesis/schueler";
import { AnwesenheitsstatusSchuelerListSelect } from "@/components/anwesenheitsstatus/AnwesenheitsstatusSchuelerListSelect";

export function SchuelerListItem({ schueler, typ, showDerzeitigeKlasse = false }: { schueler: Schueler, typ: AnwesenheitTyp, showDerzeitigeKlasse?: boolean }) {
   
    return <li className='py-2 px-8 flex justify-between w-[100%]'>
       
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
            </div>
        
        </Link>
        
        <div className='flex gap-6'>
            <GeprüftCheckbox schuelerId={schueler.id ?? -1} typ={typ} />
            <AnwesenheitsstatusSchuelerListSelect 
                typ={typ} 
                schuelerId={schueler.id ?? -1}
            />
        </div>
    
    </li>
}