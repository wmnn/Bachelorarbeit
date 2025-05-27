import { deleteUser } from "@thesis/auth";
import { Dialog } from "../dialog/Dialog";
import { MainButton } from "../MainButton";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteUserDialogProps {
    userId: number,
    closeDialog: () => void;
    setDeleteMsg: (val: string) => void,
    setIsLoading: (val: boolean) => void
}
export function DeleteUserDialog({ userId, closeDialog, setDeleteMsg, setIsLoading }: DeleteUserDialogProps) {

    const queryClient = useQueryClient()
    
    async function handleDelete() {
        setIsLoading(true);
        const res = await deleteUser(userId ?? -1)
        setDeleteMsg(res.message)
        queryClient.invalidateQueries({ queryKey: ['users'] })
        setIsLoading(false);
        closeDialog()
    }
    return <Dialog className="p-8 flex flex-col justify-between">
        
        <div />
        <h2 className="text-center">Willst du den Nutzer wirklich löschen?</h2>
        <div className="flex gap-2">
            <MainButton className="bg-white hover:text-white! text-black! border-[1px] border-gray-200!" onClick={() => closeDialog()}>
                Nein
            </MainButton>
            <MainButton className="bg-red-500" onClick={() => handleDelete()}>
                Ja
            </MainButton>
        </div>
        
    </Dialog>
}