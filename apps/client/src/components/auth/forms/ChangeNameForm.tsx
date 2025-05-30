import { ButtonLight } from "@/components/ButtonLight";
import { Description } from "@/components/Description";
import { Input } from "@/components/Input";
import { userContext } from "@/context/UserContext";
import { updateUser } from "@thesis/auth";
import { use, useState } from "react";

export function ChangeNameForm() {

    const { user, setUser } = use(userContext);
    const [vorname, setVorname] = useState(user?.vorname ?? '');
    const [nachname, setNachname] = useState(user?.nachname ?? '');
    const [isSuccess, setIsSuccess] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');

    async function handleSubmit() {
        const res = await updateUser({
            id: user?.id ?? -1,
            vorname,
            nachname
        })
        if (res.success) {
            setUser({
                ...user,
                vorname,
                nachname
            })
        }
        setIsSuccess(res.success)
        setResponseMessage(res.message)
    }

    return <form className='flex flex-col gap-2 xl:max-w-[50%]'>
        <h2>Namen</h2>
        <Description>
            Andere Nutzer können deinen Namen sehen, wenn du Nachrichten verfasst.
        </Description>
        <label>Vorname</label>
        <Input value={vorname} onChange={(e) => setVorname(e.target.value)}/>
        <label>Nachname</label>
        <Input value={nachname} onChange={(e) => setNachname(e.target.value)}/>

        { responseMessage !== '' && <p className={isSuccess ? 'text-green-500' : 'text-red-500'}>{responseMessage}</p> }

        <ButtonLight className='mt-4' onClick={() => handleSubmit()}>
            Speichern
        </ButtonLight>
    </form>
}