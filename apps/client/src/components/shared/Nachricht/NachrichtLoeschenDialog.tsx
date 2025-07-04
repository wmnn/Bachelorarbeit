import { RiskyActionDialog } from "@/components/dialog/RiskyActionDialog";
import { NACHRICHTEN_QUERY_KEY } from "@/reactQueryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { nachrichtLoeschen, type NachrichtenTyp } from "@thesis/nachricht";

interface NachrichtLoeschenDialogProps {
  closeDialog: () => void,
  typ: NachrichtenTyp,
  id: number,
  nachrichtId: number
}

export const NachrichtLoeschenDialog = (props: NachrichtLoeschenDialogProps) => {
    const { closeDialog } = props
    const queryClient = useQueryClient()
    async function handleSubmit() {
        const res = await nachrichtLoeschen(props.nachrichtId)
        alert(res.message)
        closeDialog()
        queryClient.invalidateQueries({
            queryKey: [NACHRICHTEN_QUERY_KEY, props.typ]
        })
        queryClient.invalidateQueries({
            queryKey: [NACHRICHTEN_QUERY_KEY, props.typ, props.id]
        })
    }
    return <RiskyActionDialog closeDialog={closeDialog} onSubmit={handleSubmit} message="Willst du die Nachricht wirklich löschen?" />
}