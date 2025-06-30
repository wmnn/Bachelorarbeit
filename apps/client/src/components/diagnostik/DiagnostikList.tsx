import { DiagnostikListItem } from "./DiagnostikListItem"
import { useDiagnostiken } from "../shared/useDiagnostiken"
import { DiagnostikList2 } from "./DiagnostikList2"

export function DiagnostikList() {
    const query = useDiagnostiken()

    if (query.isPending) {
        return <p>...Loading</p>
    }

    const diagnostiken = query.data

    return <DiagnostikList2 
        initialDiagnostiken={diagnostiken ?? []}
    >
        {
            ({ diagnostiken }) => diagnostiken?.map((diagnostik, idx) => <DiagnostikListItem key={idx} diagnostik={diagnostik} />)
           
        }
    </DiagnostikList2>
}