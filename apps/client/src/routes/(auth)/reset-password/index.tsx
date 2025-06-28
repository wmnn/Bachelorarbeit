import { ButtonLight } from '@/components/ButtonLight'
import { Description } from '@/components/Description'
import { Input } from '@/components/Input'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import { getResetPasswordEmail, resetPassword } from '@thesis/auth'
import { useState } from 'react'

export const Route = createFileRoute('/(auth)/reset-password/')({
  component: RouteComponent,
  validateSearch: (search) => {
    return {
      token: search.token as string | undefined,
    };
  },
})

function RouteComponent() {

  const search = useSearch({ from: Route.id });
  const [email, setEmail] = useState('')
  const [neuesPasswort, setNeuesPasswort] = useState('')
  const [neuesPasswortWiederholt, setNeuesPasswortWiederholt] = useState('')

  async function handleSendEmail() {
    const res = await getResetPasswordEmail(email)
    alert(res.message)
  }

  async function handleResetPasswort() {
    const res = await resetPassword(neuesPasswort, neuesPasswortWiederholt, search.token ?? '')
    alert(res.message)
  }

  if (search.token) {
    return <form className='flex flex-col p-2 xl:p-8 gap-4'>
      <h2>Passwort zurücksetzen</h2>
      <label>
        Neues Passwort:
      </label>
      <Input type='password' value={neuesPasswort} onChange={(e) => setNeuesPasswort(e.target.value)} />

      <label>
        Neues Passwort wiederholen:
      </label>
      <Input type='password' value={neuesPasswortWiederholt} onChange={(e) => setNeuesPasswortWiederholt(e.target.value)} />

      <ButtonLight onClick={handleResetPasswort}>
        Passwort zurücksetzen
      </ButtonLight>
    </form>
  }
  return <form className='flex flex-col p-2 xl:p-8 gap-4'>
    <h2>Passwort zurücksetzen</h2>
    <label>
      Email:
    </label>
    <Description>
      Du erhälst eine Email, mit der du dein Passwort zurücksetzen kannst.
    </Description>
    <Input placeholder='max-mustermann@email.de' value={email} onChange={(e) => setEmail(e.target.value)} />

    <ButtonLight onClick={handleSendEmail}>
      Email erhalten
    </ButtonLight>
  </form>
}
