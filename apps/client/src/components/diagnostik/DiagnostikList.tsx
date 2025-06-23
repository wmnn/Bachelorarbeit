import { useState } from "react"
import { List } from "../List"
import { DiagnostikErstellenDialog } from "./DiagnostikErstellenDialog"
import { DiagnostikListItem } from "./DiagnostikListItem"
import { useDiagnostiken } from "../shared/useDiagnostiken"

export function DiagnostikList() {
    const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)

    const query = useDiagnostiken()

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
        <div className="overflow-y-scroll divide-y divide-gray-200">
            {
                diagnostiken?.map((diagnostik, idx) => <DiagnostikListItem key={idx} diagnostik={diagnostik} />)
            }
        </div>
    </List> 
}