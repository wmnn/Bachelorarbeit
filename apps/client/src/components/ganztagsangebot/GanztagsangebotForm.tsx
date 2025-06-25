import { useState, type Dispatch, type SetStateAction } from "react";
import { ButtonLight } from "../ButtonLight"
import { Input } from "../Input";
import { Berechtigung } from "@thesis/rollen";
import { SelectedUserCtrl } from "../shared/SelectedUserCtrl";
import { Autocomplete } from "../shared/Autocomplete";
import { Trash2 } from "lucide-react";
import { useSchuelerStore } from "../schueler/SchuelerStore";
import { useAllSchueler } from "../schueler/useSchueler";

interface GanztagsangebotFormProps {
  onAbort: () => void,
  onSubmit: () => void,
  submitButtonClassName?: string,
  cancelButtonClassName?: string,
  submitButtonText: string,
  init?: any,
  title?: string,
  selectedSchueler: number[],
  setSelectedSchueler: Dispatch<SetStateAction<number[]>>
  name: string,
  setName: Dispatch<SetStateAction<string>>
}

export const GanztagsangebotForm = (props: GanztagsangebotFormProps) => {
    const { setSelectedSchueler, selectedSchueler, title, submitButtonText, onAbort, onSubmit, cancelButtonClassName, submitButtonClassName } = props;

    const schuelerData = useSchuelerStore(store => store.schueler)
    const [queryResults, setQueryResults] = useState([] as number[])
    useAllSchueler()
    const [query, setQuery] = useState('')
    function handleQueryChange(newVal: string) {
        
        const filtered = schuelerData
            .filter(schueler => `${schueler.vorname} ${schueler.nachname}`.includes(newVal))  

        setQueryResults(
            filtered.map(item => item.id ?? -1)
        )

        setQuery(newVal)
    }
    function handleSchuelerSelection(idx: number, selected: number) {
        setSelectedSchueler(selectedSchueler.map((item, i) => {
            if (i !== idx) {
                return item
            }
            return selected
        }))
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
    function removeSchueler(idx: number) {
        setSelectedSchueler(prev => prev.filter((_, i) => {
                if (i !== idx) return true;
                return false;
            })
        )
    }
 
    return <div>
        <h1>{title ? title : 'Ganztagsangebot hinzufügen'}</h1>


        <div className="flex flex-col gap-2 my-4">
            <label>
                Name des Ganztagsangebot
            </label>
            <Input placeholder="" value={props.name} onChange={(e: any) => props.setName(e.target.value)}/>
        </div>

        <SelectedUserCtrl
            berechtigung={Berechtigung.GanztagsangebotRead as Berechtigung} 
            berechtigungValue={["alle", "eigene"]} 
            placeholder="Namen eingeben"
            label="Betreuer"
        />

        <label>
            Schüler
        </label>
        <div className="flex flex-col gap-2">

        
        {
            props.selectedSchueler.map((schueler, idx) => {
                return <div className="flex gap-2">
                    <Autocomplete 
                        key={idx}
                        query={query}
                        setQuery={handleQueryChange}
                        selected={schueler}
                        setSelected={(selected: any) => handleSchuelerSelection(idx, selected)}
                        getLabel={getLabel}
                        placeholder="Max Mustermann"
                        queryResults={queryResults}
                    />
                    <button onClick={() => removeSchueler(idx)}>
                        <Trash2 />
                    </button>
                </div>
            })
        }
        <ButtonLight onClick={() => {
            setSelectedSchueler([...selectedSchueler, -1])
        }}>
            Schüler hinzufügen
        </ButtonLight> 
        </div>       

         <div className="flex gap-2 py-8">
            <ButtonLight className={cancelButtonClassName} onClick={() => onAbort()}>
                Abbrechen
            </ButtonLight>
            <ButtonLight className={submitButtonClassName} onClick={() => onSubmit()}>
                {submitButtonText}
            </ButtonLight>
        </div>
    </div>
}