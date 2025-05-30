import { AuthForm } from "@/components/auth/AuthForm";
import Button from "@/components/Button";
import { ButtonLight } from "@/components/ButtonLight";
import { Input } from "@/components/Input";
import { MainButton } from "@/components/MainButton";
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
    const [message, setMessage] = useState<string>("")
    const { setUser } = useContext(userContext)

    async function handleSubmit(e: React.SyntheticEvent<any>) {
        e.preventDefault()
        const res = await login(email, passwort)
        if (!res) {
            return;
        }
        if (!res.success) {
            setMessage(res.message ?? '')
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
    return <AuthForm>
            <label>Email</label>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"/>
            <label>Passwort</label>
            <Input type="password" value={passwort} onChange={e => setPasswort(e.target.value)} placeholder="Passwort"/>
            
            {
                message !== '' && <p className="text-red-500">{message}</p>
            }
            
            <div className="flex gap-2 mt-8">
                <ButtonLight>
                    <Link 
                        to='/register'
                    >
                        Zur Registrierung
                    </Link>
                </ButtonLight>

                <MainButton type="submit" onClick={(e) => handleSubmit(e)}>
                    Login
                </MainButton>
            </div>
            

            <Button className="mt-2">
                <Link 
                    to='/reset-password'
                >
                    Password vergessen?
                </Link>
            </Button>

        </AuthForm>
}