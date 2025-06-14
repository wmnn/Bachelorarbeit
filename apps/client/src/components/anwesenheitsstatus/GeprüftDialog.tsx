import { Anwesenheiten, updateStatusBatch, AnwesenheitTyp } from "@thesis/anwesenheiten"
import { RiskyActionDialog } from "../dialog/RiskyActionDialog"
import { useSchuelerStore } from "../schueler/SchuelerStore"

interface GeprüftDialogProps {
    closeDialog: () => void,
    schuelerIds: number[],
    typ: AnwesenheitTyp
}
export const GeprüftDialog = (props: GeprüftDialogProps) => {

    const { closeDialog, typ, schuelerIds } = props
    const heute = new Date().toISOString().split('T')[0];
    const setSchueler = useSchuelerStore(store => store.setSchueler)

    async function handleSubmit() {

        const res = await updateStatusBatch(schuelerIds, Anwesenheiten.ANWESEND, typ, heute, heute)
        if (res?.success) {
            setSchueler(schueler => {
                return schueler.map(schueler => {
                    if (!schuelerIds.includes(schueler.id ?? -1)) {
                        return schueler;
                    }
                    if (typ === AnwesenheitTyp.GANZTAG) {
                        return {
                            ...schueler,
                            heutigerGanztagAnwesenheitsstatus: Anwesenheiten.ANWESEND
                        }
                    }
                    return {
                            ...schueler,
                            heutigerSchultagAnwesenheitsstatus: Anwesenheiten.ANWESEND
                        }
                })
            })
            if (typ === AnwesenheitTyp.GANZTAG) {
                
                
            } else {
               
            }
        }
        closeDialog()
    }
    return <RiskyActionDialog 
        message="Möchtest du den heutigen Anwesenheitsstatus wirklich für alle Schüler auf ‚geprüft‘ setzen?"
        onSubmit={handleSubmit}
        closeDialog={closeDialog}
    />
}