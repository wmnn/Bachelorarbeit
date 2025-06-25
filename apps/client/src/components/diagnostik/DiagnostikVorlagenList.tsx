import { useEffect, useState } from "react"
import { DiagnostikListItem } from "./DiagnostikListItem"
import { useDiagnostiken } from "../shared/useDiagnostiken"
import { type Diagnostik, DiagnostikTyp } from "@thesis/diagnostik"
import { DiagnostikList2 } from "./DiagnostikList2"

export function DiagnostikVorlagenList() {

    const query = useDiagnostiken(DiagnostikTyp.VORLAGE)
    const [diagnostiken, setDiagnostiken] = useState<Diagnostik[]>([]);

    useEffect(() => {
        if (Array.isArray(query.data)) {
            setDiagnostiken(query.data)
        }
    }, [query.data])

    if (query.isPending) {
        return <p>...Loading</p>
    }

    if (!Array.isArray(query.data)) {
        return;
    }

    return <DiagnostikList2 
        initialDiagnostiken={diagnostiken}
    >
        {
            ({ diagnostiken }) => diagnostiken?.map((diagnostik: Diagnostik, idx: number) => <DiagnostikListItem key={idx} diagnostik={diagnostik} />)
        }
    </DiagnostikList2>
}