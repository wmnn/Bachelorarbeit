import { ButtonLight } from '@/components/ButtonLight'
import { Description } from '@/components/Description'
import { Input } from '@/components/Input'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { setup2FactorAuthentication, verify2FactorAuthentication } from '@thesis/auth'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { handleRedirection } from '../../../../../../libs/config/config'

export const Route = createFileRoute('/(auth)/2fa-setup/')({
  component: RouteComponent,
})

function RouteComponent() {

  const query = useQuery({
    queryKey: ['sandjasnkjasfnkjas'],
    queryFn: setup2FactorAuthentication,
    initialData: undefined,
  })

  const [url, setUrl] = useState('')
  const [code, setCode] = useState('')

  useEffect(() => {
    setupUrl()
  }, [query.data])

  if (query.isPending) {
    return <p>...Loading</p>
  }

  if (query.data?.redirect) {
    handleRedirection(query.data.redirect)
  }

  if (query.data !== undefined && !query.data.success) {
    return alert(query.data.message)
  }

  if (!query.data || !query.data.data) {
    return <p>Ein Fehler ist aufgetreten.</p>
  }

  async function setupUrl() {
    QRCode.toDataURL(query.data?.data.otpauth_url, function(_, data_url) {
      setUrl(data_url)
    }); 
  }

  async function handleSubmit() {
    const res = await verify2FactorAuthentication(code)
    if (res.redirect) {
      handleRedirection(res.redirect)
    }
    if (!res.success) {
      alert(res.message)
    }
    
  }
 
  return <div className='flex flex-col gap-4 px-2 xl:px-8'>
    <h2>Einrichtung 2-Faktor Authentifizierung</h2>
    <div className='w-full max-w-[500px]'>
      <img src={url}/>
    </div>
    
    <Description>
      Scan den QR-Code mit einer Authenticator App und gebe den Code unten ein.
    </Description>
    <Input type='number' placeholder='Code' value={code} onChange={(e) => setCode(e.target.value)}/>
    <ButtonLight onClick={handleSubmit}>
      Senden
    </ButtonLight>
  </div>
}
