import { NachrichtenList } from '@/components/shared/Nachricht/NachrichtenList';
import { useNachrichten } from '@/components/shared/Nachricht/useNachrichten';
import { KlasseNav } from '@/layout/KlasseNav';
import { createFileRoute } from '@tanstack/react-router'
import { NachrichtenTyp } from '@thesis/nachricht';

export const Route = createFileRoute('/(app)/klassen/$klassenId/brett')({
  component: RouteComponent,
})

function RouteComponent() {
  const { klassenId } = Route.useParams();
  const { query } = useNachrichten(NachrichtenTyp.KLASSE, parseInt(klassenId))

  return <div className='w-full flex flex-col gap-8'>
    <KlasseNav klassenId={klassenId} />
      <div className='p-2 xl:p-8'>
        <NachrichtenList nachrichten={query.data} typ={NachrichtenTyp.KLASSE} id={parseInt(klassenId)} />
      </div>
  </div>
}
