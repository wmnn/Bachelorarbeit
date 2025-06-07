import { type SchuelerSimple } from "@thesis/schueler";
import { useState } from "react";
import { SchuelerLoeschenDialog } from "./SchuelerLoeschenDialog";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Link } from "@tanstack/react-router";
import { CarFront, Users } from "lucide-react";
import { Tooltip } from "../Tooltip";

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
                <p>{schueler.verlaesstSchuleAllein == true ? 
           
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
             
                    
                    : 
                    <Tooltip content="Der Schüler wird abgeholt">
                        <CarFront />
                    </Tooltip>
               
                    
                    }</p>
                <p>{schueler.hatSonderpaedagogischeKraft == true ? <Users /> : null}</p>
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