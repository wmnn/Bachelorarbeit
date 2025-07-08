import { useState } from "react";
import { KlasseLoeschenDialog } from "./KlasseLoeschenDialog";
import { DeleteIcon } from "../icons/DeleteIcon";
import { getTitle, type Klasse } from "@thesis/schule";
import { Link } from "@tanstack/react-router";
import type { User } from "@thesis/auth";
import { countUnreadMessages, NachrichtenTyp } from "@thesis/nachricht";
import { useNachrichten } from "../shared/Nachricht/useNachrichten";
import { NachrichtNotification } from "../shared/Nachricht/NachrichtNotification";
import { ErrorDialog } from "../dialog/MessageDialog";

export function KlasseListItem({ klasse }: { klasse: Klasse }) {

    const [isDeleteDialogShown, setIsDeleteDialogShown] = useState(false)
    const klasseQuery = useNachrichten(NachrichtenTyp.KLASSE, klasse.id)
    const isUnreadMessage = countUnreadMessages([...klasseQuery.query.data]) > 0
    const [responseMessage, setResponseMessage] = useState('')

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
            isDeleteDialogShown && <KlasseLoeschenDialog klasseId={klasse.id} closeDialog={() => setIsDeleteDialogShown(false)} setDeleteMsg={setResponseMessage}/>
        }
        {(responseMessage !== '') && <ErrorDialog message={responseMessage} closeDialog={() => setResponseMessage('')}/>}
        <Link className="flex gap-4 w-full items-center"
            to="/klassen/$klassenId"
            params={{
                klassenId: `${klasse.id}`
            }}
        >
            <p>{getTitle(klasse)}</p> 
            { 
                isUnreadMessage && <NachrichtNotification />
            }
        </Link>

        <div className="flex items-center gap-4">
            <p className="md:text-nowrap">{`${formatLehrer(klasse.klassenlehrer)}`}</p>    
        </div>
        
        
        <div className='flex gap-4'>
            <button onClick={() => setIsDeleteDialogShown(true)}>
                <DeleteIcon />
            </button>
        </div>
    
    </li>
}