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
import { Edit2, Eye } from "lucide-react";
import { NachrichtBearbeitenDialog } from "./NachrichtBearbeitenDialog";
import { NachrichtNotification } from "./NachrichtNotification";
import { Dialog } from "@/components/dialog/Dialog";
import { ButtonLight } from "@/components/ButtonLight";

export const NachrichtenListItem = ({ nachricht, showId }: { nachricht: Nachricht, showId: boolean }) => {
    
    const [isDeleteDialogShown, setIsDeleteDialogShown] = useState(false)
    const [isEditDialogShown, setIsEditDialogShown] = useState(false)
    const [isNachrichtenDialogShown, setIsNachrichtenDialogShown] = useState(false)
    
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
            const s = (schueler ?? []).find(o => o.id == nachricht.id)
            if (!s) {
                return 'ERROR'
            }
            return `Schüler: ${s.vorname} ${s.nachname}`
        } else {
            const klasse = (klassenQuery.data ?? []).find(o => o.id == nachricht.id)
            if (!klasse) {
                return 'ERROR'
            }
            return 'Klasse: ' + getTitle(klasse)
        }
    }

    useEffect(() => {
        setLabel(getLabel())
    }, [schueler, klassenQuery.data, nachricht])

    const mostRecentMessage = getMostRecentMessage(nachricht.versionen)!

    function getMostRecentMessage(versionen: { inhalt: string; zeitstempel?: string }[]) {
        if (!Array.isArray(versionen) || versionen.length === 0) return null;

        return versionen.reduce((latest, current) => {
            const latestTime = new Date(latest.zeitstempel ?? 0).getTime();
            const currentTime = new Date(current.zeitstempel ?? 0).getTime();
            return currentTime > latestTime ? current : latest;
        });
    }

    const someMsgNotread = isSomeMessageNotRead()

    function isSomeMessageNotRead() {
        let status = false;
        for (const msg of nachricht.versionen) {
            if (msg.lesestatus == undefined) {
                status = true
            }
        }
        return status
    }
    
    
    return <li className={`py-2 px-2 lg:px-8 flex justify-between w-[100%] gap-8`}>
        {
            isDeleteDialogShown && <NachrichtLoeschenDialog typ={nachricht.typ} nachrichtId={nachricht.nachrichtId} id={nachricht.id} closeDialog={() => setIsDeleteDialogShown(false)} />
        }
        {
            isEditDialogShown && <NachrichtBearbeitenDialog nachricht={nachricht} closeDialog={() => setIsEditDialogShown(false)} title="Nachricht bearbeiten"/>
        }
        {
            isNachrichtenDialogShown && <Dialog 
            >
                <div className="p-2 xl:p-8 flex flex-col justify-between gap-8">

                
                <div className="flex flex-col w-full">
                    {
                        nachricht.versionen.map(version => <div className={`flex gap-2 justify-between`}>
                            <p>{version.inhalt}</p>
                            <div className="flex gap-2 items-center">
                                {version.lesestatus === undefined && <NachrichtNotification />}
                                <p>{new Date(version.zeitstempel ?? '').toLocaleDateString('de')}</p>
                            </div>
                            
                        </div>)
                    }
                </div>

                <ButtonLight onClick={() => setIsNachrichtenDialogShown(false)}>
                    Schließen
                </ButtonLight>
                </div>

            </Dialog>
        }
        <div className="flex flex-col w-full gap-4">
            <p>{showId && label}</p> 
            
           <p>{mostRecentMessage.inhalt}</p>
            <div className="flex gap-2 lg:items-center flex-col lg:flex-row items-start">
                <p>
                    {userName}
                </p> 
                <p>
                    {new Date(mostRecentMessage.zeitstempel ?? '').toLocaleDateString('de')}
                </p>
                {
                    nachricht.versionen.length > 1 && <div className="flex gap-2 items-center">
                        <label>
                            bearbeitet
                        </label>
                        <button onClick={() => setIsNachrichtenDialogShown(true)} className="text-gray-400">
                            <Eye />
                        </button>
                    </div>
                }
                {
                    someMsgNotread && <NachrichtNotification />
                }

            </div>
        </div>
        
        <div className='flex gap-4'>
            <button onClick={() => setIsEditDialogShown(true)}>
                <Edit2 />
            </button>
            <button onClick={() => setIsDeleteDialogShown(true)}>
                <DeleteIcon />
            </button>
        </div>
        
    </li>
}