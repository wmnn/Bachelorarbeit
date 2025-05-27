import { updateUser, type User } from "@thesis/auth";
import { useQueryClient } from "@tanstack/react-query";
import { RiskyActionDialog } from "../dialog/RiskyActionDialog";

interface LockUserDialogProps {
    user: User,
    closeDialog: () => void;
    setDeleteMsg: (val: string) => void,
    setIsLoading: (val: boolean) => void
}

export function LockUserDialog({ user, closeDialog, setDeleteMsg, setIsLoading }: LockUserDialogProps) {

    const queryClient = useQueryClient()
    
    async function handleLockUser() {
        setIsLoading(true);
        const res = await updateUser({
            id: user.id ?? -1,
            isLocked: !user.isLocked
        })
        setDeleteMsg(res.message)
        queryClient.invalidateQueries({ queryKey: ['users'] })
        setIsLoading(false);
        closeDialog()
    }
    return <RiskyActionDialog 
        message={user.isLocked ? 'Willst du den Nutzer wirklich entsperren?' : 'Willst du den Nutzer wirklich sperren?'} 
        closeDialog={() => closeDialog()}
        onSubmit={() => handleLockUser()}
    />
}