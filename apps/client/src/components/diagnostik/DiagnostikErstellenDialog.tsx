import { createSchueler, type Schueler } from "@thesis/schueler";
import { useQueryClient } from "@tanstack/react-query";
import { SCHUELER_QUERY_KEY } from "@/reactQueryKeys";
import { Dialog } from "../dialog/Dialog";
import { DiagnostikForm } from "./DiagnostikForm";
import { createDiagnostik } from "@thesis/diagnostik";

interface DiagnostikErstellenDialogProps {
  closeDialog: () => void,
}

export function DiagnostikErstellenDialog({ closeDialog }: DiagnostikErstellenDialogProps) {

    const queryClient = useQueryClient()

    async function handleSubmit(diagnostik: any) {
       const res = await createDiagnostik(diagnostik);
       alert(JSON.stringify(res))
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