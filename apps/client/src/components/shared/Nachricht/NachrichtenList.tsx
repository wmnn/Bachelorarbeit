import { List } from "@/components/List"
import { NachrichtenTyp, updateLesestatus, type Nachricht } from '@thesis/nachricht'
import { useEffect, useState } from "react"
import { NachrichtenListItem } from "./NachrichtenListItem"
import { NachrichtErstellenDialog } from "./NachrichtErstellenDialog"

export const NachrichtenList = ({ nachrichten, typ, id, ...rest }: { nachrichten: Nachricht[], typ: NachrichtenTyp, id?: number}) => {

    const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)

    useEffect(() => {
        handleLesestatus()
    }, [nachrichten])

    async function handleLesestatus() {
        if (nachrichten.length == 0) return;
        const ids = nachrichten.reduce((prev, acc) => {
            prev.push(...acc.versionen.filter(o => o.lesestatus === undefined).map(o => o.nachrichtenversionId))
            return prev
        }, [] as number[]) 
        if (ids.length == 0) return;
        await updateLesestatus(ids)
    }

    return <List 
        header={<></>}
        {...rest}
        createButonLabel={"Nachricht erstellen"}
    
        setIsCreateDialogShown={id ? setIsCreateDialogShown : undefined}
        >
        { isCreateDialogShown && id && <NachrichtErstellenDialog 
            closeDialog={() => setIsCreateDialogShown(false)}
            typ={typ}
            id={id}
        />}
        {
            nachrichten.map(nachricht => {
                return <NachrichtenListItem key={nachricht.id} nachricht={nachricht} showId={id === undefined ? true : false}/>
            })
        }
    </List>   
}