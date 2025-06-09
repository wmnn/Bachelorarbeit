import { useState } from "react";
import { KlasseLoeschenDialog } from "./KlasseLoeschenDialog";
import { DeleteIcon } from "../icons/DeleteIcon";
import type { Klasse } from "@thesis/schule";
import { getTitle } from "./util";
import { Link } from "@tanstack/react-router";
import type { User } from "@thesis/auth";

export function KlasseListItem({ klasse }: { klasse: Klasse }) {

    const [isDeleteDialogShown, setIsDeleteDialogShown] = useState(false)

    function formatLehrer(klassenlehrer: User[] | undefined) {
        if (!klassenlehrer) {
            return ''
        }
        return klassenlehrer.map(lehrer => {
            return `${lehrer.vorname} ${lehrer.nachname}`
        }).join(', ')
    }
    return <li className='py-2 px-8 flex justify-between w-[100%] gap-8'>

        {
            isDeleteDialogShown && <KlasseLoeschenDialog klasseId={klasse.id} closeDialog={() => setIsDeleteDialogShown(false)}/>
        }
        <Link className="flex gap-2 w-full"
            to="/klassen/$klassenId"
            params={{
                klassenId: `${klasse.id}`
            }}
        >
            <p>{getTitle(klasse)}</p> 
        </Link>

        <p className="md:text-nowrap">{`${formatLehrer(klasse.klassenlehrer)}`}</p>
        
        <div className='flex gap-4'>
            <button onClick={() => setIsDeleteDialogShown(true)}>
                <DeleteIcon />
            </button>
        </div>
    
    </li>
}