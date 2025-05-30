import { use, useState } from "react";
import { DialogWithButtons } from "../../dialog/DialogWithButtons"
import { Input } from "../../Input";
import { updatePassword } from "@thesis/auth";
import { userContext } from "@/context/UserContext";

interface ChangePasswordDialogProps {
    closeDialog: () => void
}
export function ChangePasswordDialog({ closeDialog }: ChangePasswordDialogProps) {

    const [passwort, setPasswort] = useState('');
    const [neuesPasswort, setNeuesPasswort] = useState('');
    const [neuesPasswortWiederholen, setNeuesPasswortWiederholen] = useState('');
    const [responseMessage, setResponseMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const { user } = use(userContext);

    async function onSubmit() {
        const res = await updatePassword(user?.id ?? -1, passwort, neuesPasswort)
        setIsSuccess(res.success)
        setResponseMessage(res.success ? 'Das Passwort wurde erfolgreich aktualisiert.' : 'Das Passwort konnte nicht aktualisiert werden.');

    }

    return <DialogWithButtons closeDialog={() => closeDialog()} onSubmit={() => onSubmit()} submitButtonText={"Hinzufügen"}>
        <h1 className="mb-8">Passwort ändern</h1>

        <div className="flex flex-col gap-2">
            <label>Passwort</label>
            <Input value={passwort} onChange={(e) => setPasswort(e.target.value)} />

            <label>Neues Passwort</label>
            <Input value={neuesPasswort} onChange={(e) => setNeuesPasswort(e.target.value)} />

            <label>Neues Passwort bestätigen</label>
            <Input value={neuesPasswortWiederholen} onChange={(e) => setNeuesPasswortWiederholen(e.target.value)} />           
        </div>

        { 
            responseMessage !== '' && <p className={`${isSuccess ? 'text-green-500' : 'text-red-500'} mb-[-15px] mt-8`}>{responseMessage}</p>
        }

    </DialogWithButtons>
}