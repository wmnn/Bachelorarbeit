import { NachrichtenTyp, nachrichtenVorlagenSpeichern } from "@thesis/nachricht"
import { MultiInput } from "../MultiInput"
import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { DialogWithButtons } from "@/components/dialog/DialogWithButtons"
import { useNachrichtenVorlagen } from "./useNachrichtenVorlagen"

export const EditNachrichtenVorlagen = ({ closeDialog } : { closeDialog: () => void }) => {

    const [klassenVorlagen, setKlassenVorlagen] = useState([] as string[])
    const [schuelerVorlagen, setSchuelerVorlagen] = useState([] as string[])

    const klassenQuery = useNachrichtenVorlagen(NachrichtenTyp.KLASSE)
    const schuelerQuery = useNachrichtenVorlagen(NachrichtenTyp.SCHÜLER)

    useEffect(() => {
        setKlassenVorlagen(klassenQuery.query.data)
        setSchuelerVorlagen(schuelerQuery.query.data)
    }, [klassenQuery.query.data, schuelerQuery.query.data])

    async function handleSubmit() {
        const res = await nachrichtenVorlagenSpeichern(klassenVorlagen, schuelerVorlagen);
        alert(res.message)
        klassenQuery.invalidate()
        schuelerQuery.invalidate()
        closeDialog()
    }
    return <DialogWithButtons closeDialog={closeDialog} onSubmit={handleSubmit} submitButtonText="Speichern">
        {
            klassenQuery.query.isPending ? <p>...Loading</p> : <HandleTyp typ={NachrichtenTyp.KLASSE} values={klassenVorlagen} setValues={setKlassenVorlagen} />
        }
        {
            schuelerQuery.query.isPending ? <p>...Loading</p> : <HandleTyp typ={NachrichtenTyp.SCHÜLER} values={schuelerVorlagen} setValues={setSchuelerVorlagen} />
        }
    </DialogWithButtons>
}
const HandleTyp = ({ typ, values, setValues }: { typ: NachrichtenTyp, values: string[], setValues: Dispatch<SetStateAction<string[]>> }) => {

    

    return <div>
        <h2>{typ === NachrichtenTyp.KLASSE ? 'Klassenspezifische Nachrichten' : 'Schülerspezifische Nachrichten'}</h2>

        <MultiInput values={values} setValues={setValues} buttonLabel="Nachricht" label=""/>
    
    </div>
}