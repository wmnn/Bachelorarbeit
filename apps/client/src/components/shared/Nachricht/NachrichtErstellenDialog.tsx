import { Dialog } from "../../dialog/Dialog";
import { useQueryClient } from "@tanstack/react-query";
import { type NachrichtenTyp, nachrichtErstellen } from "@thesis/nachricht";
import { NachrichtForm } from "./NachrichtForm";
import { NACHRICHTEN_QUERY_KEY } from "@/reactQueryKeys";

interface NachrichtErstellenDialogProps {
  closeDialog: () => void,
  typ: NachrichtenTyp,
  id: number
}

export function NachrichtErstellenDialog({ closeDialog, typ, id }: NachrichtErstellenDialogProps) {

    const queryClient = useQueryClient()

    async function handleSubmit(inhalt: string) {
        const res = await nachrichtErstellen(inhalt, id, typ)
        alert(res.message)
        closeDialog()
        queryClient.invalidateQueries({ queryKey: [NACHRICHTEN_QUERY_KEY, typ, id] })
    }

    return <Dialog className="overflow-auto! p-8">
        <h2>Nachricht erstellen</h2>
        <NachrichtForm 
            onSubmit={handleSubmit} 
            onAbort={closeDialog} 
            submitButtonText="Erstellen"
            title="Schüler erstellen"
            
        />
    </Dialog>
}