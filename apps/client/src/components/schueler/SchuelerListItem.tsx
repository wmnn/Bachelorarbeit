import { useState } from "react";
import { SchuelerLoeschenDialog } from "./SchuelerLoeschenDialog";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Link } from "@tanstack/react-router";
import { SchuelerIcons } from "./SchuelerIcons";
import { AnwesenheitsstatusSelect } from "../anwesenheitsstatus/AnwesenheitsstatusSelect";
import { useSchuelerStore } from "./SchuelerStore";
import { AnwesenheitTyp } from "@thesis/anwesenheiten";
import { GeprüftCheckbox } from "../anwesenheitsstatus/GeprüftCheckbox";

export function SchuelerListItem({ schuelerId, typ }: { schuelerId: number, typ: AnwesenheitTyp }) {

    const [isDeleteDialogShown, setIsDeleteDialogShown] = useState(false)
    let schuelers = useSchuelerStore(store => store.schueler)

    if (!schuelers) {
        return <p>Ein Fehler ist aufgetreten.</p>
    }
    const schueler = schuelers.find(schueler => schueler.id === schuelerId)
    if (!schueler) {
        return <p>Ein Fehler ist aufgetreten.</p>
    }

    return <li className='py-2 px-8 flex justify-between w-[100%]'>

        {
            isDeleteDialogShown && <SchuelerLoeschenDialog schuelerId={schueler.id ?? -1} closeDialog={() => setIsDeleteDialogShown(false)}/>
        }
        <Link 
            to="/schueler/$schuelerId"
            params={{
                schuelerId: `${schueler.id ?? -1}`
            }}
        >
            <div className="flex gap-2">
                <p>{schueler.vorname}</p> 
                <p>{schueler.nachname}</p>
                <SchuelerIcons schueler={schueler} />
            </div>
           
        </Link>
        
        <div className='flex gap-6'>
            <GeprüftCheckbox schuelerId={schuelerId} typ={typ} />
            <AnwesenheitsstatusSelect typ={AnwesenheitTyp.UNTERRICHT} schuelerId={schuelerId} />
            
            <button onClick={() => setIsDeleteDialogShown(true)}>
                <DeleteIcon />
            </button>
        </div>
    
    </li>
}