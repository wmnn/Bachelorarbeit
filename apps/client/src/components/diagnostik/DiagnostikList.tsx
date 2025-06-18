import { useState } from "react"
import { List } from "../List"
import { DiagnostikErstellenDialog } from "./DiagnostikErstellenDialog"

interface DiagnostikListProps {

}
export function DiagnostikList(props: DiagnostikListProps) {
    const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)

    return <List 
        createButonLabel="Diagnostik erstellen"
        setIsCreateDialogShown={setIsCreateDialogShown}
    >
        { isCreateDialogShown && <DiagnostikErstellenDialog closeDialog={() => setIsCreateDialogShown(false)}/>}
    </List> 
}