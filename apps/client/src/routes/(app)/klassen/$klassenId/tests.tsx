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

    <List className='px-8 mt-8'>
      
        { 
          diagnostiken.filter(item => `${item.klasseId}` === `${klassenId}`).map(diagnostik => <DiagnostikListItem diagnostik={diagnostik} />)
        }
    
    </List>
  </div>
}
