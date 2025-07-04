import { NachrichtenList } from '@/components/shared/Nachricht/NachrichtenList';
import { useNachrichten } from '@/components/shared/Nachricht/useNachrichten';
import { SchuelerNav } from '@/layout/SchuelerNav'
import { createFileRoute } from '@tanstack/react-router'
import { NachrichtenTyp } from '@thesis/nachricht';

export const Route = createFileRoute('/(app)/schueler/$schuelerId/brett')({
  component: RouteComponent,
})

function RouteComponent() {

  const { schuelerId } = Route.useParams();

  const { query } = useNachrichten(NachrichtenTyp.SCHÜLER, parseInt(schuelerId))

  return <div className='w-full flex flex-col'>
    <SchuelerNav schuelerId={schuelerId} />

    <div className='p-2 xl:p-8'>
      <NachrichtenList nachrichten={query.data} typ={NachrichtenTyp.SCHÜLER} id={parseInt(schuelerId)} />
    </div>
  </div>
}
