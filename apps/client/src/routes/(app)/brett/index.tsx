import { NachrichtenList } from '@/components/shared/Nachricht/NachrichtenList'
import { useAllNachrichten } from '@/components/shared/Nachricht/useAllNachrichten'
import { createFileRoute } from '@tanstack/react-router'
import { NachrichtenTyp } from '@thesis/nachricht'

export const Route = createFileRoute('/(app)/brett/')({
  component: RouteComponent,
})

function RouteComponent() {

    const classQuery = useAllNachrichten(NachrichtenTyp.KLASSE)
    const schuelerQuery = useAllNachrichten(NachrichtenTyp.SCHÜLER)

  return <div className='flex flex-col w-full p-2 xl:p-8'>
    <h1>Schwarzes Brett</h1>

    <div className='flex flex-col gap-4 xl:flex-row'>
        <NachrichtenList nachrichten={classQuery.query.data} typ={NachrichtenTyp.SCHÜLER} />
        <NachrichtenList nachrichten={schuelerQuery.query.data} typ={NachrichtenTyp.KLASSE} /> 
    </div>

    
  </div>
}
