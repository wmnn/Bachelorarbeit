import { useState } from "react"
import { List } from "../List"
import { DiagnostikErstellenDialog } from "./DiagnostikErstellenDialog"
import { DiagnostikListItem } from "./DiagnostikListItem"
import { useDiagnostiken } from "../shared/useDiagnostiken"

interface DiagnostikListProps {

}
export function DiagnostikList(props: DiagnostikListProps) {
    const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)

    const query = useDiagnostiken()

    if (query.isPending) {
        return <p>...Loading</p>
    }

    const diagnostiken = query.data

    const Header = <div className="mt-8">
        <h1>
            Diagnostikverfahren
        </h1>
    </div>

    return <List 
        createButonLabel="Diagnostik erstellen"
        setIsCreateDialogShown={setIsCreateDialogShown}
        header={Header}
        className=""
    >
        { isCreateDialogShown && <DiagnostikErstellenDialog closeDialog={() => setIsCreateDialogShown(false)}/>}
        {
            diagnostiken?.map((diagnostik, idx) => <DiagnostikListItem key={idx} diagnostik={diagnostik} />)
        }
    </List> 
}