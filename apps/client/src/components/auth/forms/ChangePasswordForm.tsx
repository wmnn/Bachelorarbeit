import { ButtonLight } from "@/components/ButtonLight";
import { useState } from "react";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { Description } from "@/components/Description";

export function ChangePasswordForm() {

    const [isDialogShown, setIsDialogShown] = useState(false);

    return <form className='flex flex-col gap-2'>

        { 
            isDialogShown && <ChangePasswordDialog 
                closeDialog={() => setIsDialogShown(false)}
            />
        }

        <h2>Passwort</h2>
        <Description>
            Hier kannst du dein Passwort ändern. Nach Eingabe deines jetzigen Passworts kannst du ein neues Passwort festlegen.
        </Description>
        <ButtonLight onClick={() => setIsDialogShown(true)}>
            Passwort ändern
        </ButtonLight>
    </form>
}