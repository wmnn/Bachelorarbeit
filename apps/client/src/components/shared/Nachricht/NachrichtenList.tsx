import { List } from "@/components/List"
import { NachrichtenTyp, type Nachricht } from '@thesis/nachricht'
import { useState } from "react"
import { NachrichtenListItem } from "./NachrichtenListItem"
import { NachrichtErstellenDialog } from "./NachrichtErstellenDialog"

export const NachrichtenList = ({ nachrichten, typ, id, ...rest }: { nachrichten: Nachricht[], typ: NachrichtenTyp, id: number}) => {

    const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)
    
    return <List 
        header={<></>}
        {...rest}
        createButonLabel="Nachricht erstellen"
        setIsCreateDialogShown={setIsCreateDialogShown}
        >
        { isCreateDialogShown && <NachrichtErstellenDialog 
            closeDialog={() => setIsCreateDialogShown(false)}
            typ={typ}
            id={id}
        />}
        {
            nachrichten.map(nachricht => {
                return <NachrichtenListItem key={nachricht.id} nachricht={nachricht} />
            })
        }
    </List>   
}