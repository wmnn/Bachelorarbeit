import { type SchuelerSimple } from "@thesis/schueler";
import { useState } from "react";
import { SchuelerLoeschenDialog } from "./SchuelerLoeschenDialog";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Link } from "@tanstack/react-router";
import { SchuelerIcons } from "./SchuelerIcons";

export function SchuelerListItem({ schueler }: { schueler: SchuelerSimple }) {

    const [isDeleteDialogShown, setIsDeleteDialogShown] = useState(false)

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
        
        <div className='flex gap-4'>
            <input type='checkbox'/>
            <button onClick={() => setIsDeleteDialogShown(true)}>
                <DeleteIcon />
            </button>
        </div>
    
    </li>
}