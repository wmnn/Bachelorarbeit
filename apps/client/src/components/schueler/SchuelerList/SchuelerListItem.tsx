import { Link } from "@tanstack/react-router";
import { SchuelerIcons } from "../SchuelerIcons";
import { AnwesenheitTyp } from "@thesis/anwesenheiten";
import { GeprüftCheckbox } from "../../anwesenheitsstatus/GeprüftCheckbox";
import type { Schueler } from "@thesis/schueler";
import { AnwesenheitsstatusSchuelerListSelect } from "@/components/anwesenheitsstatus/AnwesenheitsstatusSchuelerListSelect";

export function SchuelerListItem({ schueler, typ, showDerzeitigeKlasse = false }: { schueler: Schueler, typ: AnwesenheitTyp, showDerzeitigeKlasse?: boolean }) {
   
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
            </div>
        
        </Link>
        
        <div className='flex gap-6 items-center flex-wrap mt-4 md:mt-0'>
            <div className="flex items-center gap-2">
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
            
        </div>
    
    </li>
}