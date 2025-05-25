import type { User } from "@thesis/auth";
import { Dialog } from "../Dialog";
import { MainButton } from "../MainButton";

interface DeleteUserDialogProps {
    user: User,
    closeDialog: () => void;
}
export function DeleteUserDialog({ user, closeDialog }: DeleteUserDialogProps) {

    async function handleDelete() {
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