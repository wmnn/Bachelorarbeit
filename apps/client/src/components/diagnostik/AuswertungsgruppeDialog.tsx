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
            window.location.reload()
            closeDialog()
        }
    }

    return <DialogWithButtons closeDialog={closeDialog} onSubmit={handleSubmit} submitButtonText="Speichern">

        <h1>Auswertungsgruppen bearbeiten</h1>
    
        <div className="flex flex-col w-full">
        {
            auswertungsgruppen.map((gruppe, idx) => {
                return <div className="flex flex-col justify-between w-full">
                    <div className="grow flex items-center gap-4 w-full">
                        <label>
                            Name
                        </label>
                        <Input 
                            value={gruppe.name} 
                            className="grow"
                            onChange={(e) => {
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

                        <button className="p-2" onClick={() => {
                            const filtered = auswertungsgruppen.filter((_, i) => {
                                return i !== idx
                            })
                            setAuswertungsgruppen(filtered)
                        }}>
                            <Trash2/>
                        </button>
                    </div>
                    
                    <div className="grow flex flex-col gap-2 mt-2">
                        <label>Schüler</label>
                        
                        {
                            gruppe.schuelerIds.map((schuelerId, i) => {
                                return <div className="flex gap-2 items-center">

                                <Autocomplete 
                                    key={i}
                                    query={query}
                                    setQuery={handleQueryChange}
                                    selected={schuelerId}
                                    setSelected={(selected: any) => handleSchuelerSelection(idx, i, selected)}
                                    getLabel={getLabel}
                                    placeholder="Max Mustermann"
                                    className="grow max-w-full"
                                    queryResults={queryResults as any}
                                />

                                <button className="p-2" onClick={() => {
                                            setAuswertungsgruppen(prev => {
                                        return prev.map((item, i) => {
                                            if (i !== idx) {
                                                return item;
                                            }
                                            return {
                                                ...item,
                                                schuelerIds: item.schuelerIds.filter((_, i) => i !== idx)
                                            }
                                        })
                                    })
                                }}>
                                    <Trash2/>
                                </button>

                                </div>
                            })
                        }
                        <ButtonLight onClick={() => addSchueler(idx)}>
                            Schüler hinzufügen
                        </ButtonLight>
                    </div>

                    {
                        idx !== auswertungsgruppen.length - 1 && <hr className="h-[1px] bg-gray-300 my-8"/>
                    }

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