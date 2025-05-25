import Button from "@/components/Button";
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

    async function handleSubmit(e: React.SyntheticEvent<any>) {
        e.preventDefault()
        const res = await register(vorname, nachname, email, password)
        console.log(res)
    }
    return <form>

        <input value={vorname} onChange={e => setVorname(e.target.value)} placeholder="Vorname"/>
        <input value={nachname} onChange={e => setNachname(e.target.value)} placeholder="Nachname"/>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"/>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Passwort"/>
        <Button type="submit" onClick={(e) => handleSubmit(e)}>
            Registrieren
        </Button>

        <Button>
            <Link 
                to='/login'
            >
                Anmelden
            </Link>
        </Button>
    </form>
}