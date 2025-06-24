import { useState } from "react"
import { List } from "../List"
import { DiagnostikErstellenDialog } from "./DiagnostikErstellenDialog"
import { DiagnostikListItem } from "./DiagnostikListItem"
import { useDiagnostiken } from "../shared/useDiagnostiken"
import { DiagnostikTyp } from "@thesis/diagnostik"

export function DiagnostikGeteiltList() {
    const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)

    const query = useDiagnostiken(DiagnostikTyp.GETEILT)

    if (query.isPending) {
        return <p>...Loading</p>
    }

    const diagnostiken = query.data

    return <List 
        createButonLabel="Diagnostik erstellen"
        setIsCreateDialogShown={setIsCreateDialogShown}
        className="mt-8"
    >
        { isCreateDialogShown && <DiagnostikErstellenDialog closeDialog={() => setIsCreateDialogShown(false)}/>}
        {
            diagnostiken?.map((diagnostik, idx) => <DiagnostikListItem key={idx} diagnostik={diagnostik} />)
        }
    </List> 
}