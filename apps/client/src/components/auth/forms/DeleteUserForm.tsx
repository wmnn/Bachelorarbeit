import { use, useState } from "react";
import { ButtonLight } from "../../ButtonLight";
import { userContext } from "@/context/UserContext";
import { DeleteUserDialog } from "../DeleteUserDialog";
import { deleteUser } from "@thesis/auth";
import { ErrorDialog } from "../../dialog/MessageDialog";
import { Description } from "@/components/Description";

export function DeleteUserForm() {

    const { user, setUser } = use(userContext);
    const [isDeleteDialogShown, setIsDeleteDialogShown] = useState(false);
    const [_, setIsLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState('')

    function closeDeleteDialog() {
        setIsDeleteDialogShown(false);
    }

    return <form className='flex flex-col gap-2'>

        {(responseMessage !== '') && <ErrorDialog message={responseMessage} closeDialog={() => setResponseMessage('')}/>}
        {(isDeleteDialogShown) && <DeleteUserDialog 
            userId={user?.id ?? -1} 
            closeDialog={closeDeleteDialog} 
            setIsLoading={setIsLoading}
            onSubmit={async () => {
                setIsLoading(true)
                const res = await deleteUser(user?.id ?? -1)
                if (res.success) {
                setUser(undefined)
                return;
                }
                setResponseMessage(res.message);
                setIsLoading(false);
                closeDeleteDialog()
            }}
        />}

        <h2>Konto löschen</h2>
        <Description>
            Die Löschung deines Kontos ist endgültig und kann nicht rückgängig gemacht werden.
        </Description>
        <ButtonLight className='text-red-500!' onClick={() => setIsDeleteDialogShown(true)}>
            Konto löschen
        </ButtonLight>
    </form>
}