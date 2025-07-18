import { KlasseForm } from '@/components/klasse/KlasseForm';
import { useKlassenStore } from '@/components/klasse/KlassenStore';
import { useSchuljahrStore } from '@/components/schuljahr/SchuljahrStore';
import { useSelectedUserStore } from '@/components/shared/SelectedUserStore';
import { KLASSEN_QUERY_KEY } from '@/reactQueryKeys';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { editKlasse, getKlasse, type Halbjahr, type Schuljahr } from '@thesis/schule';

export const Route = createFileRoute('/(app)/klassen/$klassenId/edit')({
  component: RouteComponent,
})

function RouteComponent() {

  const router = useRouter()
  const { klassenId } = Route.useParams();

  const schuljahr = useSchuljahrStore(state => state.ausgewaeltesSchuljahr)
  const halbjahr = useSchuljahrStore(state => state.ausgewaeltesHalbjahr)
  const klassen = useKlassenStore(state => state.neueKlassen)
  const klassenlehrer = useSelectedUserStore(store => store.selectedUser)

  const { isPending, data: klasse } = useQuery({
    queryKey: [KLASSEN_QUERY_KEY, schuljahr, halbjahr, klassenId],
    queryFn: ({ queryKey }) => {
      const [_key, schuljahr, halbjahr] = queryKey;
      return getKlasse((schuljahr as Schuljahr), (halbjahr as Halbjahr), parseInt(klassenId));
    },
    initialData: undefined,
  });

  if (isPending) {
    return <p>Loading...</p>
  }
 
  async function onSubmit() {
    const res = await editKlasse(klassen, klassenlehrer, klassenId, schuljahr, halbjahr);
    alert(res.message)
  }
  return <div className='p-2 xl:pt-8 xl:px-8 w-full'>
    <KlasseForm 
      initialKlasse={klasse}
      onSubmit={() => onSubmit()} 
      onAbort={() => router.history.back()} 
      submitButtonText={'Speichern'} 
      title='Klasse bearbeiten'
    />
  </div>
}
