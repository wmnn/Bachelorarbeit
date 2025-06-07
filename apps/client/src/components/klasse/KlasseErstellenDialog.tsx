import { ButtonLight } from "../ButtonLight";
import { DialogWithButtons } from "../dialog/DialogWithButtons";
import { createKlasse, type KlassenVersion } from "@thesis/schule";
import { useKlassenStore } from "./KlassenStore";
import { KlasseErstellenDialogKlasse } from "./KlasseErstellenDialogKlasse";

interface KlasseErstellenDialogProps {
  closeDialog: () => void,
}
export function KlasseErstellenDialog({ closeDialog }: KlasseErstellenDialogProps) {

    const schuljahr = useKlassenStore(state => state.ausgewaeltesSchuljahr)
    const halbjahr = useKlassenStore(state => state.ausgewaeltesHalbjahr)
    const klassen = useKlassenStore(state => state.neueKlassen)
    const setKlassen = useKlassenStore(state => state.setNeueKlassen)

    const NEW_CLASS = {
        schuljahr,
        halbjahr,
        klassenstufe: undefined,
        zusatz: undefined,
        schueler: []
    }

    if (klassen.length == 0) {
        klasseHinzufügen()
    }

    function klasseHinzufügen() {
        setKlassen(prev => [...prev, NEW_CLASS])
    }

    async function handleSubmit() {
        const res = await createKlasse(klassen);
        alert(res);
    }
    return <DialogWithButtons onSubmit={() => handleSubmit()} closeDialog={() => closeDialog()} submitButtonText="Erstellen">
        <h1>Klasse hinzufügen</h1>

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
        
    </DialogWithButtons>
}