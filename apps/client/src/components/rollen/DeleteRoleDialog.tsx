import { deleteRole } from "@thesis/auth";
import { useQueryClient } from "@tanstack/react-query";
import { RiskyActionDialog } from "../dialog/RiskyActionDialog";

interface DeleteRoleDialogProps {
    rolle: string,
    closeDialog: () => void;
    setResponseMsg: (val: string) => void,
    setIsLoading: (val: boolean) => void
}

export function DeleteRoleDialog({ rolle, closeDialog, setResponseMsg, setIsLoading }: DeleteRoleDialogProps) {

    const queryClient = useQueryClient()
    
    async function handleDeleteRole() {
        setIsLoading(true);
        const res = await deleteRole(rolle)
        setResponseMsg(res.message)
        if (res.success) {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        }
        setIsLoading(false);
        closeDialog()
    }

    return <RiskyActionDialog 
        message={'Willst du die Rolle wirklich löschen?'} 
        closeDialog={() => closeDialog()}
        onSubmit={() => handleDeleteRole()}
    />
}