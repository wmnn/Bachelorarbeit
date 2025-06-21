import { DialogWithButtons } from "../dialog/DialogWithButtons";
import { Input } from "../Input";
import { useSchuelerStore } from "../schueler/SchuelerStore";
import { useAllSchueler } from "../schueler/useSchueler";
import { useKlasse } from "../shared/useKlasse";

interface DiagnostikAddTestDialogProps {
  closeDialog: () => void,
  klasseId: number
}

export function DiagnostikAddTestDialog({ closeDialog, klasseId }: DiagnostikAddTestDialogProps) {

    const klasseQuery = useKlasse(klasseId)
    useAllSchueler()
    const schueler = useSchuelerStore(store => store.schueler)

    if (klasseQuery.isPending) {
        return <p>...Loading</p>
    }
    
    const klasse = klasseQuery.data
    const schuelerIds = klasse?.versionen.reduce((prev, acc) => {
        return [...prev, ...(acc.schueler ?? [])]
    }, [] as number[])

    if (!klasse) {
        return <p>Ein Fehler ist aufgetreten.</p>
    }

    console.log(JSON.stringify(klasse), klasseId)

    async function handleSubmit() {
       
    }

    return <DialogWithButtons className="overflow-auto! p-8" closeDialog={closeDialog} onSubmit={() => {}} submitButtonText="Ergebnisse hinzufügen">
        <ul>

        <div className="flex justify-between my-4">
            <label>
                Name
            </label>
            <label>
                Ergebnis
            </label>
        </div>
        
        {
            schuelerIds?.map(id => {
                const entry = schueler.find(schueler => schueler.id === id)
                return <li className="flex justify-between">
                    <p>{entry ? `${entry.vorname} ${entry.nachname}` : id}</p>
                    <Input />
                </li>
            })
        }
        </ul>

    </DialogWithButtons>
}