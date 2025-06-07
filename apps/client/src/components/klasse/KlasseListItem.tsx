import { useState } from "react";
import { KlasseLoeschenDialog } from "./KlasseLoeschenDialog";
import { DeleteIcon } from "../icons/DeleteIcon";
import type { Klasse } from "@thesis/schule";
import { getTitle } from "./util";

export function KlasseListItem({ klasse }: { klasse: Klasse }) {

    const [isDeleteDialogShown, setIsDeleteDialogShown] = useState(false)

    return <li className='py-2 px-8 flex justify-between w-[100%] gap-8'>

        {
            isDeleteDialogShown && <KlasseLoeschenDialog klasseId={klasse.id} closeDialog={() => setIsDeleteDialogShown(false)}/>
        }
        <button className="flex gap-2 w-full">
            <p>{getTitle(klasse)}</p> 
        </button>
        
        <div className='flex gap-4'>
            <button onClick={() => setIsDeleteDialogShown(true)}>
                <DeleteIcon />
            </button>
        </div>
    
    </li>
}