import { useQueryClient } from "@tanstack/react-query";
import { DIAGNOSTIKEN_QUERY_KEY } from "@/reactQueryKeys";
import { editDiagnostik, type Diagnostik } from "@thesis/diagnostik";
import { DiagnostikForm } from "./DiagnostikForm";
import { Dialog } from "../dialog/Dialog";

interface DiagnostikEditDialogProps {
    diagnostik: Diagnostik,
    closeDialog: () => void;
    setResponseMsg: (val: string) => void,
}

export function DiagnostikEditDialog({ diagnostik, closeDialog, setResponseMsg }: DiagnostikEditDialogProps) {

    const queryClient = useQueryClient()
    
    async function handleEdit(diagnostik: Diagnostik, files: File[]) {
        const res = await editDiagnostik(diagnostik, files)
        setResponseMsg(res.message)
        if (res.success) {
            queryClient.invalidateQueries({ queryKey: [DIAGNOSTIKEN_QUERY_KEY] })
            closeDialog()
        }
    }

    return <Dialog className="p-8">
        <DiagnostikForm 
            onAbort={closeDialog}
            onSubmit={handleEdit}
            submitButtonText="Speichern"
            initialDiagnostik={diagnostik}
        />
    </Dialog>
}