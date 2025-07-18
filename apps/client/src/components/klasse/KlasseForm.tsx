import { KlasseErstellenDialogKlasse } from "./KlasseFormKlassenversion";
import { useKlassenStore } from "./KlassenStore";
import type { Klasse, KlassenVersion } from "@thesis/schule";
import { ButtonLight } from "../ButtonLight";
import { useEffect } from "react";
import { useSchuljahrStore } from "../schuljahr/SchuljahrStore";
import { SelectedUserCtrl } from "../shared/SelectedUserCtrl";
import { Berechtigung } from "@thesis/rollen";
import { useSelectedUserStore } from "../shared/SelectedUserStore";

interface KlasseFormProps {
  onAbort: () => void,
  onSubmit: () => void,
  submitButtonClassName?: string,
  cancelButtonClassName?: string,
  submitButtonText: string,
  initialKlasse?: Klasse,
  title?: string
}

export const KlasseForm = (props: KlasseFormProps) => {

    const { 
        onAbort, 
        onSubmit, 
        submitButtonText, 
        submitButtonClassName, 
        cancelButtonClassName, 
        title,
        initialKlasse
    } = props;

    const klassen = useKlassenStore(state => state.neueKlassen)
    const setKlassen = useKlassenStore(state => state.setNeueKlassen);    
    const schuljahr = useSchuljahrStore(state => state.ausgewaeltesSchuljahr)
    const halbjahr = useSchuljahrStore(state => state.ausgewaeltesHalbjahr)
    const setSelectedUser = useSelectedUserStore(state => state.setSelectedUser)

    useEffect(() => {
        if (initialKlasse?.versionen) {
            setKlassen(() => [...initialKlasse?.versionen])
        } else {
            setKlassen(() => [ {
                schuljahr,
                halbjahr,
                klassenstufe: undefined,
                zusatz: undefined,
                schueler: []
            }])
        }


        if (initialKlasse?.klassenlehrer) {
            setSelectedUser(() => [...(initialKlasse?.klassenlehrer ?? [])])
        }
    }, [])

    function klasseHinzufügen() {
        setKlassen(prev => [...prev, {
            schuljahr,
            halbjahr,
            klassenstufe: undefined,
            zusatz: undefined,
            schueler: []
        }])
    }

    return <div>
        <h1>{title ? title : 'Klasse hinzufügen'}</h1>

        <SelectedUserCtrl 
            berechtigung={Berechtigung.KlasseCreate as Berechtigung} 
            berechtigungValue={[true]} 
            placeholder="Lehrernamen eingeben"
            label="Klassenlehrer"
        />

        <hr className="mb-8" />

        <h2>Klassen</h2>

        {
            klassen.map((klasse) => {
                return <><KlasseErstellenDialogKlasse klasse={klasse} setKlasse={(updatedKlasse: KlassenVersion) => {
                    setKlassen((prev) => {
                        return prev.map(o => {
                            if (o !== klasse) {
                                return o;
                            }
                            return updatedKlasse
                        })
                    })
                }}/>
                <hr className="my-8" />
                </>
            })
        }

        <ButtonLight onClick={() => klasseHinzufügen()}>
            Zugehörige Klasse hinzufügen
        </ButtonLight>

    

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