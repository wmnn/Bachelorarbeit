import { DeleteIcon } from "@/components/icons/DeleteIcon";
import { NachrichtenTyp, type Nachricht } from "@thesis/nachricht";
import { useEffect, useState } from "react";
import { useAllUsers } from "../useAllUsers";
import { useUserStore } from "@/components/auth/UserStore";
import { useAllSchueler } from "@/components/schueler/useSchueler";
import { useKlassen } from "../useKlassen";
import { useSchuelerStore } from "@/components/schueler/SchuelerStore";
import { getTitle } from "@thesis/schule";
import { NachrichtLoeschenDialog } from "./NachrichtLoeschenDialog";

export const NachrichtenListItem = ({ nachricht, showId }: { nachricht: Nachricht, showId: boolean }) => {
    
    const [isDeleteDialogShown, setIsDeleteDialogShown] = useState(false)
    
    const users = useUserStore(store => store.users)
    const user = users.find(o => o.id == nachricht.userId)
    const userName = user ? `${user.vorname} ${user.nachname}` : 'Ein Fehler ist aufgetreten.'
    useAllSchueler()
    useAllUsers()
    const schueler = useSchuelerStore(store => store.schueler)
    const klassenQuery = useKlassen()

    const [label, setLabel] = useState('')

    function getLabel() {
        if (nachricht.typ === NachrichtenTyp.SCHÜLER) {
            const s = schueler.find(o => o.id == nachricht.id)
            if (!s) {
                return 'ERROR'
            }
            return `${s.vorname} ${s.nachname}`
        } else {
            const klasse = klassenQuery.data.find(o => o.id == nachricht.id)
            if (!klasse) {
                return 'ERROR'
            }
            return getTitle(klasse)
        }
    }

    useEffect(() => {
        setLabel(getLabel())
    }, [schueler, klassenQuery.data, nachricht])
    
    
    return <li className='py-2 px-8 flex justify-between w-[100%] gap-8'>
        {
            isDeleteDialogShown && <NachrichtLoeschenDialog typ={nachricht.typ} nachrichtId={nachricht.nachrichtId} id={nachricht.id} closeDialog={() => setIsDeleteDialogShown(false)} />
        }
        <div className="flex flex-col w-full gap-4">
            <div className="flex flex-col w-full">
                 {
                    nachricht.versionen.map(version => <div className="flex gap-2 justify-between">
                        <p>{version.inhalt}</p>
                        <p>{new Date(version.zeitstempel ?? '').toLocaleDateString('de')}</p>
                    </div>)
                }
            </div>
           

            <p>{userName} {showId && label}</p>
        </div>
        
        <div className='flex gap-4'>
            <button onClick={() => setIsDeleteDialogShown(true)}>
                <DeleteIcon />
            </button>
        </div>
        
    </li>
}