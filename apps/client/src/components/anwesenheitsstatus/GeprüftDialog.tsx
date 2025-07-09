import { Anwesenheiten, updateStatusBatch, AnwesenheitTyp } from "@thesis/anwesenheiten"
import { RiskyActionDialog } from "../dialog/RiskyActionDialog"
import { useQueryClient } from "@tanstack/react-query"
import { SCHUELER_QUERY_KEY } from "@/reactQueryKeys"
import { useAllSchueler } from "../schueler/useSchueler"
import { useSchuelerStore } from "../schueler/SchuelerStore"

interface GeprüftDialogProps {
    closeDialog: () => void,
    schuelerIds: number[],
    typ: AnwesenheitTyp
}
export const GeprüftDialog = (props: GeprüftDialogProps) => {

    const { closeDialog, typ, schuelerIds } = props
    const heute = new Date().toISOString().split('T')[0];
    const queryClient = useQueryClient()
    useAllSchueler(false)
    const schueler = useSchuelerStore(store => store.schueler)

    async function handleSubmit() {

        let schuelerWithoutAnwesenheit = schuelerIds.filter(id => {
            const found = schueler.find(o => o.id == id)
            if (!found) return false;
            if (typ === AnwesenheitTyp.GANZTAG) {
                return found.heutigerGanztagAnwesenheitsstatus === undefined
            } 
            return found.heutigerSchultagAnwesenheitsstatus === undefined
        })

        const res = await updateStatusBatch(schuelerWithoutAnwesenheit, Anwesenheiten.ANWESEND, typ, heute, heute)
        if (res?.success) {
            queryClient.invalidateQueries({ queryKey: [SCHUELER_QUERY_KEY]}) // TODO
        }
        closeDialog()
    }
    return <RiskyActionDialog 
        message="Möchtest du den heutigen Anwesenheitsstatus wirklich für alle Schüler auf ‚geprüft‘ setzen?"
        onSubmit={handleSubmit}
        closeDialog={closeDialog}
    />
}