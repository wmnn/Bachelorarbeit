import { deleteUser } from "@thesis/auth";
import { useQueryClient } from "@tanstack/react-query";
import { RiskyActionDialog } from "../dialog/RiskyActionDialog";

interface DeleteUserDialogProps {
    userId: number,
    closeDialog: () => void;
    setDeleteMsg?: (val: string) => void,
    setIsLoading: (val: boolean) => void,
    onSubmit?: () => void
}

export function DeleteUserDialog({ userId, closeDialog, setDeleteMsg, setIsLoading, onSubmit }: DeleteUserDialogProps) {

    const queryClient = useQueryClient()
    
    async function handleDelete() {
        setIsLoading(true);
        const res = await deleteUser(userId ?? -1)
        if (setDeleteMsg) {
            setDeleteMsg(res.message)
        }
        queryClient.invalidateQueries({ queryKey: ['users'] })
        setIsLoading(false);
        closeDialog()
    }
    return <RiskyActionDialog 
        message={'Willst du den Nutzer wirklich löschen?'} 
        closeDialog={() => closeDialog()}
        onSubmit={() => {
            if (onSubmit) {
                onSubmit()
            } else {
                handleDelete()
            }
        }}
    />
}