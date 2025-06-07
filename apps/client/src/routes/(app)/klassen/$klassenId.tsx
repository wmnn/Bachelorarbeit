import { getTitle } from '@/components/klasse/util';
import { List } from '@/components/List';
import { useSchuljahrStore } from '@/components/schuljahr/SchuljahrStore';
import { KLASSEN_QUERY_KEY } from '@/reactQueryKeys';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'
import { getKlasse, type Halbjahr, type Klasse, type Schuljahr } from '@thesis/schule';
import { useRouter, useCanGoBack } from '@tanstack/react-router'
import { SchuelerListItem } from '@/components/schueler/SchuelerListItem';
import { MoveLeft } from 'lucide-react';

export const Route = createFileRoute('/(app)/klassen/$klassenId')({
  component: RouteComponent,
})

function RouteComponent() {

  const router = useRouter()
  const { klassenId } = Route.useParams();
  
  const schuljahr = useSchuljahrStore(state => state.ausgewaeltesSchuljahr)
  const halbjahr = useSchuljahrStore(state => state.ausgewaeltesHalbjahr)

  const { isPending, data: klasse } = useQuery({
    queryKey: [KLASSEN_QUERY_KEY, schuljahr, halbjahr, klassenId],
    queryFn: ({ queryKey }) => {
      const [_key, schuljahr, halbjahr] = queryKey;
      return getKlasse((schuljahr as Schuljahr), (halbjahr as Halbjahr), parseInt(klassenId));
    },
    initialData: [],
  });
 

  if (isPending) {
    return <p>Loading...</p>
  }

  if (!klasse.versionen) {
    return <p>Ein Fehler ist aufgetreten</p>
  }

  return <div className='w-full p-8 flex flex-col gap-8'>

    <div className='flex gap-2 items-center'>
      <button onClick={() => router.history.back()}>
        <MoveLeft />
      </button>
      <h1>{getTitle(klasse)}</h1>
    </div>
    
    

    { (klasse as Klasse).versionen?.map(version => {
      return <List 
        setIsCreateDialogShown={() => {}} 
        createButonLabel='Schüler erstellen' 
        key={`${version.klassenstufe}${version.zusatz}`}
        leftHeader={<h2>{version.klassenstufe}{version.zusatz}</h2>}
      >
  
        <>
  
          {
            version.schueler?.map(schueler => {
              return <SchuelerListItem schueler={schueler} />
            
            })
          }
        </>
        
      </List>
    }) }   
  
  
  </div>
}
