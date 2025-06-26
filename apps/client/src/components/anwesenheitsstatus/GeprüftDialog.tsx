import { Anwesenheiten, updateStatusBatch, AnwesenheitTyp } from "@thesis/anwesenheiten"
import { RiskyActionDialog } from "../dialog/RiskyActionDialog"
import { useQueryClient } from "@tanstack/react-query"
import { SCHUELER_QUERY_KEY } from "@/reactQueryKeys"

interface GeprüftDialogProps {
    closeDialog: () => void,
    schuelerIds: number[],
    typ: AnwesenheitTyp
}
export const GeprüftDialog = (props: GeprüftDialogProps) => {

    const { closeDialog, typ, schuelerIds } = props
    const heute = new Date().toISOString().split('T')[0];
    const queryClient = useQueryClient()

    async function handleSubmit() {

        const res = await updateStatusBatch(schuelerIds, Anwesenheiten.ANWESEND, typ, heute, heute)
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