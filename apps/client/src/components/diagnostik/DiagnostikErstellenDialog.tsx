import { Dialog } from "../dialog/Dialog";
import { DiagnostikForm } from "./DiagnostikForm";
import { createDiagnostik } from "@thesis/diagnostik";

interface DiagnostikErstellenDialogProps {
  closeDialog: () => void,
}

export function DiagnostikErstellenDialog({ closeDialog }: DiagnostikErstellenDialogProps) {

    async function handleSubmit(diagnostik: any) {
        const res = await createDiagnostik(diagnostik);
        alert(JSON.stringify(res))
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