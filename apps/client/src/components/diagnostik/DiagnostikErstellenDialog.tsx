import { useQueryClient } from "@tanstack/react-query";
import { Dialog } from "../dialog/Dialog";
import { DiagnostikForm } from "./DiagnostikForm";
import { createDiagnostik, type Diagnostik } from "@thesis/diagnostik";
import { DIAGNOSTIKEN_QUERY_KEY } from "@/reactQueryKeys";

interface DiagnostikErstellenDialogProps {
  closeDialog: () => void,
}

export function DiagnostikErstellenDialog({ closeDialog }: DiagnostikErstellenDialogProps) {

    const queryClient = useQueryClient()
    async function handleSubmit(diagnostik: Diagnostik, files: File[]) {
        const res = await createDiagnostik(diagnostik, files);
        alert(res.message)
        queryClient.invalidateQueries({ queryKey: [DIAGNOSTIKEN_QUERY_KEY]})
    }

    return <Dialog className="overflow-auto! p-8">
        <DiagnostikForm 
            onSubmit={handleSubmit} 
            onAbort={() => closeDialog()} 
            submitButtonText="Erstellen"
            title="Diagnostik erstellen"
        />
    </Dialog>
}