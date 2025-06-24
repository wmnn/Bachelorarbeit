import { List } from "../List"
import { DiagnostikListItem } from "./DiagnostikListItem"
import { useDiagnostiken } from "../shared/useDiagnostiken"
import { DiagnostikTyp } from "@thesis/diagnostik"

export function DiagnostikGeteiltList() {

    const query = useDiagnostiken(DiagnostikTyp.GETEILT)

    if (query.isPending) {
        return <p>...Loading</p>
    }

    const diagnostiken = query.data

    return <List 
        createButonLabel="Diagnostik erstellen"
        className="mt-8"
    >
        {
            diagnostiken != undefined && diagnostiken?.length == 0 && <h2 className="p-2">Es wurde keine Diagnostik mit dir geteilt.</h2>
        }
        {
            diagnostiken?.map((diagnostik, idx) => <DiagnostikListItem key={idx} diagnostik={diagnostik} isShared />)
        }
    </List> 
}