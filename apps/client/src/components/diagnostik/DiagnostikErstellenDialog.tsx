import { useQueryClient } from "@tanstack/react-query";
import { Dialog } from "../dialog/Dialog";
import { DiagnostikForm } from "./DiagnostikForm";
import { createDiagnostik } from "@thesis/diagnostik";
import { DIAGNOSTIKEN_QUERY_KEY } from "@/reactQueryKeys";

interface DiagnostikErstellenDialogProps {
  closeDialog: () => void,
}

export function DiagnostikErstellenDialog({ closeDialog }: DiagnostikErstellenDialogProps) {

    const queryClient = useQueryClient()
    async function handleSubmit(diagnostik: any) {
        const res = await createDiagnostik(diagnostik);
        alert(JSON.stringify(res))
        queryClient.invalidateQueries({ queryKey: [DIAGNOSTIKEN_QUERY_KEY]})
        if (res.success) {
            closeDialog()
        }
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