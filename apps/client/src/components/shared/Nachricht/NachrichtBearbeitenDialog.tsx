import { useQueryClient } from "@tanstack/react-query"
import { nachrichtBearbeiten, type Nachricht } from "@thesis/nachricht"
import { NachrichtForm } from "./NachrichtForm"
import { Dialog } from "@/components/dialog/Dialog"
import { NACHRICHTEN_QUERY_KEY } from "@/reactQueryKeys"

interface NachrichtErstellenDialogProps {
  closeDialog: () => void,
  nachricht: Nachricht,
  title?: string
}

export function NachrichtBearbeitenDialog({ closeDialog, nachricht, title = 'Nachricht erstellen' }: NachrichtErstellenDialogProps) {

    const queryClient = useQueryClient()

    async function handleSubmit(inhalt: string) {
        const res = await nachrichtBearbeiten(inhalt, nachricht.nachrichtId)
        alert(res.message)
        closeDialog()
        queryClient.invalidateQueries({ queryKey: [NACHRICHTEN_QUERY_KEY, nachricht.typ] })
        queryClient.invalidateQueries({ queryKey: [NACHRICHTEN_QUERY_KEY, nachricht.typ, nachricht.id] })
    }

    const initial = nachricht.versionen[0]?.inhalt ?? ''

    return <Dialog className="overflow-auto! p-8">
        <h2>{title}</h2>
        <NachrichtForm 
            onSubmit={handleSubmit} 
            onAbort={closeDialog} 
            typ={nachricht.typ}
            submitButtonText="Speichern"
            title="Nachricht bearbeiten"
            initial={initial}
        />
    </Dialog>
}