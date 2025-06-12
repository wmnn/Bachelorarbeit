import type { Dispatch, SetStateAction } from "react";
import { ButtonLight } from "../ButtonLight"
import { Input } from "../Input";
import { SchuelerSelectionList } from "../schueler/SchuelerSelectionList";
import { Berechtigung } from "@thesis/rollen";
import { SelectedUserCtrl } from "../shared/SelectedUserCtrl";

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
    const { title, submitButtonText, onAbort, onSubmit, cancelButtonClassName, submitButtonClassName } = props;


    return <div className="h-[60vh]">
        <h1>{title ? title : 'Ganztagsangebot hinzufügen'}</h1>


        <div className="flex flex-col gap-2 my-4">
            <label>
                Name des Ganztagsangebot
            </label>
            <Input placeholder="" value={props.name} onChange={(e: any) => props.setName(e.target.value)}/>
        </div>

        <SelectedUserCtrl
            berechtigung={Berechtigung.GanztagsangebotCreate as Berechtigung} 
            berechtigungValue={["alle", "eigene"]} 
            placeholder="Namen eingeben"
            label="Betreuer"
        />

        <SchuelerSelectionList selectedIds={props.selectedSchueler}  handleSelection={(element) => {
            if (props.selectedSchueler.includes(element.id ?? -1)) {
                props.setSelectedSchueler(prev => {
                    return prev.filter(item => item !== element.id)
                }) 
            } else {
                props.setSelectedSchueler(prev => [...prev, element.id ?? -1]) 
            }
        }}/>
        


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