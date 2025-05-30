import { use, useState } from "react";
import { ButtonLight } from "../../ButtonLight";
import { userContext } from "@/context/UserContext";
import { updateUser } from "@thesis/auth";
import { Input } from "../../Input";
import { Description } from "@/components/Description";

export function UpdateEmailForm() {

    const { user, setUser } = use(userContext);
    const [updateEmailMessage, setUpdateEmailMessage] = useState('')
    const [isEmailUpdated, setIsEmailUpdated] = useState(false)
    const [email, setEmail] = useState(user?.email ?? '');
    const [isLoading, setIsLoading] = useState(false);

    async function onChangeEmail() {
        setIsLoading(true);
        const res = await updateUser({
          id: user?.id ?? -1,
          email,
        })
        setIsLoading(false);
    
        if (res.message && res.success) {
          setUser({
            ...user,
            email
          })
          setIsEmailUpdated(true);
          setUpdateEmailMessage('Die Email wurde erfolgreich geändert.')
        } else {
          setEmail(user?.email ?? '')
          setIsEmailUpdated(false);
          setUpdateEmailMessage('Die Email konnte nicht aktualisiert werden.')
        }
      }

    return <div className='flex flex-col gap-2'>
        <h2>Email ändern</h2>
        <Description>
          Hier kannst du deine Email ändern.
        </Description>
        <label>Email</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)}/>
        {
        updateEmailMessage !== '' && <p className={isEmailUpdated ? 'text-green-500' : 'text-red-500'}>{updateEmailMessage}</p>
        }
        <ButtonLight onClick={() => onChangeEmail()}>
            Speichern
        </ButtonLight>
    </div>
}