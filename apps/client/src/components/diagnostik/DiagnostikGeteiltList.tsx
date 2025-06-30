import { DiagnostikListItem } from "./DiagnostikListItem"
import { useDiagnostiken } from "../shared/useDiagnostiken"
import { DiagnostikTyp } from "@thesis/diagnostik"
import { DiagnostikList2 } from "./DiagnostikList2"

export function DiagnostikGeteiltList() {

    const query = useDiagnostiken(DiagnostikTyp.GETEILT)

    if (query.isPending) {
        return <p>...Loading</p>
    }

    const diagnostiken = query.data

    return <DiagnostikList2
        initialDiagnostiken={diagnostiken ?? []}
    >
        {
            ({ diagnostiken }) => diagnostiken?.map((diagnostik, idx) => <DiagnostikListItem key={idx} diagnostik={diagnostik} isShared />)
           
        }
    </DiagnostikList2>
}