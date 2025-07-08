import { useState } from "react";
import { DeleteIcon } from "../icons/DeleteIcon";
import { type Ganztagsangebot } from "@thesis/schule";
import { Link } from "@tanstack/react-router";
import { GanztagsangebotLoeschenDialog } from "./GanztagsangebotLoeschenDialog";

export function GanztagsangebotListItem({ ganztagsangebot }: { ganztagsangebot: Ganztagsangebot }) {

    const [isDeleteDialogShown, setIsDeleteDialogShown] = useState(false)

    // function formatLehrer(klassenlehrer: User[] | undefined) {
    //     if (!klassenlehrer) {
    //         return ''
    //     }
    //     return klassenlehrer.map(lehrer => {
    //         return `${lehrer.vorname} ${lehrer.nachname}`
    //     }).join(', ')
    // }

    return <li className='py-2 px-8 flex justify-between w-[100%] gap-8'>

        {
            isDeleteDialogShown && <GanztagsangebotLoeschenDialog ganztagsangebotId={ganztagsangebot.id ?? -1} closeDialog={() => setIsDeleteDialogShown(false)}/>
        }
        <Link className="flex gap-2 w-full"
            to="/ganztagsangebote/$ganztagsangebotId"
            params={{
                ganztagsangebotId: `${ganztagsangebot.id}`
            }}
        >
            <p>{ganztagsangebot.name}</p> 
        </Link>

        {/* <p className="md:text-nowrap">{`${formatLehrer(ganztagsangebot.betreuer)}`}</p> */}
        
        <div className='flex gap-4'>
            <button onClick={() => setIsDeleteDialogShown(true)}>
                <DeleteIcon />
            </button>
        </div>
    
    </li>
}