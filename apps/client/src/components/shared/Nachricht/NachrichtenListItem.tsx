import { DeleteIcon } from "@/components/icons/DeleteIcon";
import type { Nachricht } from "@thesis/nachricht";
import { useState } from "react";
import { useAllUsers } from "../useAllUsers";
import { useUserStore } from "@/components/auth/UserStore";

export const NachrichtenListItem = ({ nachricht }: { nachricht: Nachricht }) => {
    
    const [_, setIsDeleteDialogShown] = useState(false)
    
    useAllUsers()
    const users = useUserStore(store => store.users)
    const user = users.find(o => o.id == nachricht.userId)
    const userName = user ? `${user.vorname} ${user.nachname}` : 'Ein Fehler ist aufgetreten.'
    
    return <li className='py-2 px-8 flex justify-between w-[100%] gap-8'>
    
        <div className="flex flex-col w-full gap-4">
            <div className="flex flex-col w-full">
                 {
                    nachricht.versionen.map(version => <div className="flex gap-2 justify-between">
                        <p>{version.inhalt}</p>
                        <p>{new Date(version.zeitstempel ?? '').toLocaleDateString('de')}</p>
                    </div>)
                }
            </div>
           

            <p>{userName}</p>
        </div>
        
        <div className='flex gap-4'>
            <button onClick={() => setIsDeleteDialogShown(true)}>
                <DeleteIcon />
            </button>
        </div>
        
    </li>
}