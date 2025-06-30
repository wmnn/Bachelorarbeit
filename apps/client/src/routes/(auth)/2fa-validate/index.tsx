import { ButtonLight } from '@/components/ButtonLight'
import { Description } from '@/components/Description'
import { Input } from '@/components/Input'
import { createFileRoute } from '@tanstack/react-router'
import { validate2FactorAuthentication } from '@thesis/auth'
import { useState } from 'react'

export const Route = createFileRoute('/(auth)/2fa-validate/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [code, setCode] = useState('')

  async function handleSubmit() {
    const res = await validate2FactorAuthentication(code)
    if (!res.success) {
      alert(res.message)
    }
  }
 
  return <div className='flex flex-col gap-4 px-2 xl:px-8'>
    <h2>2-Faktor Authentifizierungscode</h2>
    
    <Description>
      Gebe den 2-Faktor Authentifizierungscode unten ein.
    </Description>
    <Input type='number' placeholder='Code' value={code} onChange={(e) => setCode(e.target.value)}/>
    <ButtonLight onClick={handleSubmit}>
      Senden
    </ButtonLight>
  </div>
}
