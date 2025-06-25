import { useEffect, useState } from "react"
import { List } from "../List"
import { DiagnostikErstellenDialog } from "./DiagnostikErstellenDialog"
import { DiagnostikListItem } from "./DiagnostikListItem"
import { useDiagnostiken } from "../shared/useDiagnostiken"
import { type Diagnostik, DiagnostikTyp } from "@thesis/diagnostik"
import { ButtonLight } from "../ButtonLight"
import { SortOption, SortSelect } from "../shared/SortSelect"
import { Input } from "../Input"

const DiagnostikSortLabels: Record<SortOption, string> = {
    [SortOption.AUFSTEIGEND]: 'Name aufsteigend',
    [SortOption.ABSTEIGEND]: 'Name absteigend'
}
export function DiagnostikVorlagenList() {
    const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)
    const [sortOption, setSortOption] = useState<SortOption>(SortOption.ABSTEIGEND)

    const query = useDiagnostiken(DiagnostikTyp.VORLAGE)
    const [diagnostiken, setDiagnostiken] = useState<Diagnostik[]>([]);

    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (Array.isArray(query.data)) {
            setDiagnostiken(sort(sortOption, query.data))
        }
    }, [query.data])

    if (query.isPending) {
        return <p>...Loading</p>
    }

    if (!Array.isArray(query.data)) {
        return;
    }

    function sort(sortOption: SortOption, data: Diagnostik[]) {
        if (sortOption === SortOption.AUFSTEIGEND) {
            return ([...data].sort((a, b) => {
                return b.name.localeCompare(a.name)
            }))
        } else {
            return ([...data].sort((a, b) => {
                return a.name.localeCompare(b.name)
            }))
        }
    }

    function handleSortChange(val: SortOption) {
        setSortOption(val)
        setDiagnostiken(sort(val, diagnostiken))
    }

    const header = <div>
        <div className='flex justify-end mb-8'>
            <div className='flex gap-2'>

            <Input value={searchQuery} placeholder="Suche" onChange={(e) => {
                const val = e.target.value
                setSearchQuery(val)
                setDiagnostiken(_ => sort(sortOption, (query.data ?? []).filter(item => item.name.includes(val))))
            }}/>
            <SortSelect selectedSortItem={sortOption} handleSortChange={handleSortChange} labels={DiagnostikSortLabels}/>
    
            <ButtonLight>
                Filtern
            </ButtonLight>
    
            </div>
        </div>
        
    </div>

    return <List 
        createButonLabel="Diagnostik erstellen"
        setIsCreateDialogShown={setIsCreateDialogShown}
        className="mt-8"
        header={header}
    >
        { isCreateDialogShown && <DiagnostikErstellenDialog closeDialog={() => setIsCreateDialogShown(false)}/>}
        {
            diagnostiken?.map((diagnostik, idx) => <DiagnostikListItem key={idx} diagnostik={diagnostik} />)
        }
    </List> 
}