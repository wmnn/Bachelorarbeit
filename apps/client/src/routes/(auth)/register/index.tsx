import { AuthForm } from "@/components/auth/forms/AuthForm";
import { ButtonLight } from "@/components/ButtonLight";
import { ErrorDialog } from "@/components/dialog/MessageDialog";
import { Input } from "@/components/Input";
import { MainButton } from "@/components/MainButton";
import { createFileRoute, Link } from "@tanstack/react-router";
import { register } from "@thesis/auth"
import { useState } from "react";

export const Route = createFileRoute('/(auth)/register/')({
  component: Register,
})

export default function Register () {

    const [vorname, setVorname] = useState<string>("")
    const [nachname, setNachname] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isErrorDialogShown, setIsErrorDialogShown] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    async function handleSubmit(e: React.SyntheticEvent<any>) {
        e.preventDefault()
        const res = await register(vorname, nachname, email, password)

        setIsErrorDialogShown(true);
        if (!res?.success) { 
            setErrorMessage(res?.message ?? 'Es konnte kein Account erstellt werden.')
            return;
        }
        setErrorMessage(res?.message ?? 'Um dein Account zu aktivieren, schau in dein Email Postfach.')
    }
    return <AuthForm>

        {
            isErrorDialogShown && <ErrorDialog message={errorMessage} closeDialog={() => setIsErrorDialogShown(false)}/>
        }

        <label>Vorname</label>
        <Input value={vorname} onChange={e => setVorname(e.target.value)} placeholder="Vorname"/>
        <label>Nachname</label>
        <Input value={nachname} onChange={e => setNachname(e.target.value)} placeholder="Nachname"/>
        <label>Email</label>
        <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"/>
        <label>Passwort</label>
        <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Passwort"/>
        
        <div className="flex gap-2 mt-8">
            <ButtonLight>
                <Link 
                    to='/login'
                >
                    Zur Anmeldung
                </Link>
            </ButtonLight>

            <MainButton type="submit" onClick={(e) => handleSubmit(e)}>
                Registrieren
            </MainButton>
        </div>
        
    </AuthForm>
}