import { useState } from "react"
import { List } from "../List"
import { DiagnostikErstellenDialog } from "./DiagnostikErstellenDialog"
import { useQuery } from "@tanstack/react-query"
import { getDiagnostiken, type Diagnostik } from "@thesis/diagnostik"
import { DIAGNOSTIKEN_QUERY_KEY } from "@/reactQueryKeys"
import { DiagnostikListItem } from "./DiagnostikListItem"

interface DiagnostikListProps {

}
export function DiagnostikList(props: DiagnostikListProps) {
    const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)

    const { isPending, data: diagnostiken } = useQuery<Diagnostik[]>({
        queryKey: [DIAGNOSTIKEN_QUERY_KEY],
        queryFn: getDiagnostiken,
    })

    if (isPending) {
        return <p>...Loading</p>
    }

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