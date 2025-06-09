import { KlassenlehrerSelectCtrl } from "./KlassenlehrerSelectCtrl";
import { KlasseErstellenDialogKlasse } from "./KlasseFormKlassenversion";
import { useKlassenStore } from "./KlassenStore";
import type { Klasse, KlassenVersion } from "@thesis/schule";
import { ButtonLight } from "../ButtonLight";
import { useEffect } from "react";
import { useSchuljahrStore } from "../schuljahr/SchuljahrStore";

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
    const setKlassenlehrer = useKlassenStore(state => state.setKlassenlehrer)

    useEffect(() => {
        if (initialKlasse?.versionen) {
            setKlassen(() => [...initialKlasse?.versionen])
        } else {
            setKlassen(() => [])
        }

        if (initialKlasse?.klassenlehrer) {
            setKlassenlehrer(() => [...(initialKlasse?.klassenlehrer ?? [])])
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

    return <div className="h-[60vh]">
        <h1>{title ? title : 'Klasse hinzufügen'}</h1>

        <KlassenlehrerSelectCtrl />

        {
            klassen.map((klasse) => {
                return <KlasseErstellenDialogKlasse klasse={klasse} setKlasse={(updatedKlasse: KlassenVersion) => {
                    setKlassen((prev) => {
                        return prev.map(o => {
                            if (o !== klasse) {
                                return o;
                            }
                            return updatedKlasse
                        })
                    })
                }}/>
            })
        }

        <ButtonLight onClick={() => klasseHinzufügen()}>
            Unterklasse hinzufügen
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