import Button from "@/components/Button";
import { userContext } from "@/context/UserContext";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { login } from "@thesis/auth"
import { useContext, useState } from "react";

export const Route = createFileRoute('/(auth)/login/')({
  component: Login,
})

export default function Login () {

    const navigate = useNavigate();
    const [email, setEmail] = useState<string>("")
    const [passwort, setPasswort] = useState<string>("")
    const { setUser } = useContext(userContext)

    async function handleSubmit(e: React.SyntheticEvent<any>) {
        e.preventDefault()
        const res = await login(email, passwort)
        if (!res) {
            return;
        }
        const user = res.user
        if (!user) {
            return;
        }
  
        if (user.rolle && typeof user.rolle === "string") {
            return;
        }
        setUser(user);

        navigate({
            to: "/dashboard"
        })
    }
    return <form>

        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"/>
        <input type="password" value={passwort} onChange={e => setPasswort(e.target.value)} placeholder="Passwort"/>
        <Button type="submit" onClick={(e) => handleSubmit(e)}>
            Login
        </Button>

        <Button>
            <Link 
                to='/register'
            >
                Registrierung
            </Link>
        </Button>

        <Button>
            <Link 
                to='/reset-password'
            >
                Password vergessen?
            </Link>
        </Button>
    </form>
}