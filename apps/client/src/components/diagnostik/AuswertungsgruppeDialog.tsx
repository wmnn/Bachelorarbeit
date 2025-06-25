import { useState } from "react"
import { DialogWithButtons } from "../dialog/DialogWithButtons"
import { ButtonLight } from "../ButtonLight"
import { updateAuswertungsgrupen, type Auswertungsgruppe } from "@thesis/diagnostik"
import { Input } from "../Input"
import { Autocomplete } from "../shared/Autocomplete"
import { useSchuelerStore } from "../schueler/SchuelerStore"
import { useAllSchueler } from "../schueler/useSchueler"
import { Trash2 } from "lucide-react"

interface AuswertungsgruppeDialogProps { 
    closeDialog: () => void, 
    auswertungsgruppen?: Auswertungsgruppe[], 
    schuelerIds: number[],
    diagnostikId: string
}
export const AuswertungsgruppeDialog = (props: AuswertungsgruppeDialogProps) => {

    const { closeDialog, auswertungsgruppen: initialData = [], schuelerIds, diagnostikId } = props;
    const [auswertungsgruppen, setAuswertungsgruppen] = useState<Auswertungsgruppe[]>(initialData)
    const [query, setQuery] = useState('')
    const [queryResults, setQueryResults] = useState([] as number[])
    useAllSchueler()
    const schueler = useSchuelerStore(store => store.schueler)
    const schuelerData = schueler.filter(item => schuelerIds.includes(item.id ?? -1))

    function handleQueryChange(newVal: string) {
        
        const filtered = schuelerData
            .filter(schueler => `${schueler.vorname} ${schueler.nachname}`.includes(newVal))  

        setQueryResults(
            filtered.map(item => item.id ?? -1)
        )

        setQuery(newVal)
    }

    function handleSchuelerSelection(gruppeIdx: number, schuelerIdx: number, val: string) {
        const parsedId = parseInt(val)
        setAuswertungsgruppen(prev => {
            return prev.map((item, i) => {
                if (i !== gruppeIdx) {
                    return item;
                }
                return {
                    ...item,
                    schuelerIds: item.schuelerIds.map((id, i) => {
                        if (i !== schuelerIdx) {
                            return id
                        }
                        return parsedId
                    })
                }
            })
        })
    }

    function addSchueler(idx: number) {
        setAuswertungsgruppen(prev => {
            return prev.map((item, i) => {
                if (i !== idx) {
                    return item;
                }
                return {
                    ...item,
                    schuelerIds: [...item.schuelerIds, -1]
                }
            })
        })
    }

    function getLabel(val: any) {
        const found = schuelerData.find(item => item.id == val)
        if (val == -1) {
            return 'Kein Schüler wurde ausgewählt.'
        }
        if (!found) {
            return 'Ein Fehler ist aufgetreten.'
        }
        return `${found.vorname} ${found.nachname}`
    }

    async function handleSubmit() {
        const res = await updateAuswertungsgrupen(diagnostikId, auswertungsgruppen);
        alert(res.message)
        if (res.success) {
            closeDialog()
        }
    }

    return <DialogWithButtons closeDialog={closeDialog} onSubmit={handleSubmit} submitButtonText="Speichern">

        <h1>Auswertungsgruppen bearbeiten</h1>
        <label className="">
            Auswertungsgruppen
        </label>
        <div className="flex flex-col gap-8">
        {
            auswertungsgruppen.map((gruppe, idx) => {
                return <div className="flex flex-col xl:flex-row justify-between">
                    <div className="grow">
                        <label>
                            Name
                        </label>
                        <Input value={gruppe.name} onChange={(e) => {
                            setAuswertungsgruppen(prev => prev.map((item, i) => {
                                if (idx !== i) {
                                    return item;
                                }
                                return {
                                    ...item,
                                    name: e.target.value
                                }
                            }))
                        }}/>
                    </div>
                    
                    <div className="grow flex flex-col gap-2">
                        {
                            gruppe.schuelerIds.map((schuelerId, i) => {
                                return <Autocomplete 
                                    key={i}
                                    query={query}
                                    setQuery={handleQueryChange}
                                    selected={schuelerId}
                                    setSelected={(selected: any) => handleSchuelerSelection(idx, i, selected)}
                                    getLabel={getLabel}
                                    placeholder="Max Mustermann"
                                    queryResults={queryResults as any}
                                />
                            })
                        }
                        <ButtonLight onClick={() => addSchueler(idx)}>
                            Schüler hinzufügen
                        </ButtonLight>
                    </div>

                    <button className="p-2" onClick={() => {
                        const filtered = auswertungsgruppen.filter((_, i) => {
                            return i !== idx
                        })
                        setAuswertungsgruppen(filtered)
                    }}>
                        <Trash2/>
                    </button>
                </div>
            })
        }
        </div>

        <ButtonLight onClick={() => {
                setAuswertungsgruppen(prev => [...prev, { 
                    name: '',
                    schuelerIds: []
                }])
            }}
            className="my-8"
        >
            Auswertungsgruppe hinzufügen
        </ButtonLight>
        
        
    </DialogWithButtons>
}