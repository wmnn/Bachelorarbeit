import { useQueryClient } from "@tanstack/react-query";
import { RiskyActionDialog } from "../dialog/RiskyActionDialog";
import { DIAGNOSTIKEN_QUERY_KEY } from "@/reactQueryKeys";
import { deleteDiagnostik } from "@thesis/diagnostik";

interface DeleteRoleDialogProps {
    diagnostikId: string,
    closeDialog: () => void;
    setResponseMsg: (val: string) => void,
}

export function DeleteDiagnostikDialog({ diagnostikId, closeDialog, setResponseMsg }: DeleteRoleDialogProps) {

    const queryClient = useQueryClient()
    
    async function handleDelete() {
        const res = await deleteDiagnostik(diagnostikId)
        setResponseMsg(res.message)
        if (res.success) {
            queryClient.invalidateQueries({ queryKey: [DIAGNOSTIKEN_QUERY_KEY] })
        }
        closeDialog()
    }

    return <RiskyActionDialog 
        message={'Willst du die Diagnostik wirklich löschen?'} 
        closeDialog={() => closeDialog()}
        onSubmit={() => handleDelete()}
    />
}