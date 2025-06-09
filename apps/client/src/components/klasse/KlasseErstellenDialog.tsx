import { ButtonLight } from "../ButtonLight";
import { DialogWithButtons } from "../dialog/DialogWithButtons";
import { createKlasse, type KlassenVersion } from "@thesis/schule";
import { useKlassenStore } from "./KlassenStore";
import { KlasseErstellenDialogKlasse } from "./KlasseErstellenDialogKlasse";
import { useQueryClient } from "@tanstack/react-query";
import { KLASSEN_QUERY_KEY } from "@/reactQueryKeys";
import { useSchuljahrStore } from "../schuljahr/SchuljahrStore";
import { useEffect } from "react";
import { KlassenlehrerSelectCtrl } from "./KlassenlehrerSelectCtrl";

interface KlasseErstellenDialogProps {
  closeDialog: () => void,
  setResponseMessage: (val: string) => void
}
export function KlasseErstellenDialog({ closeDialog, setResponseMessage }: KlasseErstellenDialogProps) {

    const schuljahr = useSchuljahrStore(state => state.ausgewaeltesSchuljahr)
    const halbjahr = useSchuljahrStore(state => state.ausgewaeltesHalbjahr)
    const klassen = useKlassenStore(state => state.neueKlassen)
    const setKlassen = useKlassenStore(state => state.setNeueKlassen);
    
    const klassenlehrer = useKlassenStore(store => store.klassenlehrer)

    useEffect(() => {
        setKlassen((_) => [{
            schuljahr,
            halbjahr,
            klassenstufe: undefined,
            zusatz: undefined,
            schueler: []
        }])
    }, [schuljahr, halbjahr])

    function klasseHinzufügen() {
        setKlassen(prev => [...prev, {
            schuljahr,
            halbjahr,
            klassenstufe: undefined,
            zusatz: undefined,
            schueler: []
        }])
    }

    const queryClient = useQueryClient();

    async function handleSubmit() {
        const res = await createKlasse(klassen, klassenlehrer);
        setResponseMessage(res.message)
        queryClient.invalidateQueries({
            queryKey: [KLASSEN_QUERY_KEY]
        })
        // closeDialog();
    }
    return <DialogWithButtons onSubmit={() => handleSubmit()} closeDialog={() => closeDialog()} submitButtonText="Erstellen">
        <div className="h-[60vh]">
            <h1>Klasse hinzufügen</h1>

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
        </div>
        
        
    </DialogWithButtons>
}