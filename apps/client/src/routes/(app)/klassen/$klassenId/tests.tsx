import { DiagnostikList2 } from '@/components/diagnostik/DiagnostikList2';
import { DiagnostikListItem } from '@/components/diagnostik/DiagnostikListItem';
import { List } from '@/components/List';
import { useDiagnostiken } from '@/components/shared/useDiagnostiken';
import { KlasseNav } from '@/layout/KlasseNav'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/klassen/$klassenId/tests')({
  component: RouteComponent,
})

function RouteComponent() {
  const { klassenId } = Route.useParams();
  const query = useDiagnostiken()

  if (query.isPending) {
    return <p>...Loading</p>
  }

  if (!query.data) {
    return <p>Ein Fehler ist aufgetreten.</p>
  }

  const diagnostiken = query.data

  return <div className='w-full' >
    <KlasseNav klassenId={klassenId} />
    <div className='px-2 xl:px-8'>
      <DiagnostikList2 initialDiagnostiken={diagnostiken}>
        {({ diagnostiken}) => diagnostiken
          .filter(item => `${item.klasseId}` === `${klassenId}`)
          .map(diagnostik => <DiagnostikListItem diagnostik={diagnostik} />
        )}
      </DiagnostikList2>
    </div>
  </div>
}
