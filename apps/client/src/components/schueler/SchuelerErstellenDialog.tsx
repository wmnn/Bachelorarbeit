import { createSchueler, type Schueler } from "@thesis/schueler";
import { useQueryClient } from "@tanstack/react-query";
import { SCHUELER_QUERY_KEY } from "@/reactQueryKeys";
import { SchuelerEditForm } from "./SchuelerForm";
import { Dialog } from "../dialog/Dialog";

interface SchuelerErstellenDialogProps {
  closeDialog: () => void,
}

export function SchuelerErstellenDialog({ closeDialog }: SchuelerErstellenDialogProps) {

    const queryClient = useQueryClient()

    async function handleSubmit(schueler: Schueler) {
        await createSchueler(schueler)
        closeDialog();
        queryClient.invalidateQueries({ queryKey: [SCHUELER_QUERY_KEY] })
    }

    return <Dialog className="overflow-auto! p-8">
        <SchuelerEditForm 
            onSubmit={(schueler) => handleSubmit(schueler)} 
            onAbort={() => closeDialog()} 
            submitButtonText="Erstellen"
            title="Schüler erstellen"
        />
    </Dialog>
}