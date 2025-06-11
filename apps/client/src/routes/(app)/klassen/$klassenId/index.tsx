import { useSchuljahrStore } from '@/components/schuljahr/SchuljahrStore';
import { KLASSEN_QUERY_KEY } from '@/reactQueryKeys';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router'
import { getKlasse, type Halbjahr, type Klasse, type Schuljahr } from '@thesis/schule';
import { useRouter } from '@tanstack/react-router'
import { Edit, MoveLeft } from 'lucide-react';
import { KlasseNav } from '@/layout/KlasseNav';
import { getTitle } from '@thesis/schule'
import { SchuelerList } from '@/components/schueler/SchuelerList/SchuelerList';
import type { Schueler } from '@thesis/schueler';

export const Route = createFileRoute('/(app)/klassen/$klassenId/')({
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
    initialData: undefined,
  });
 

  if (isPending) {
    return <p>Loading...</p>
  }

  const BackButton = <button onClick={() => router.history.back()}>
    <MoveLeft />
  </button>

  if (!klasse.versionen) {
    return <p>{BackButton} Ein Fehler ist aufgetreten</p>
  }

  return <div className='w-full flex flex-col gap-8'>

    <div className='flex justify-between px-8 pt-8'>
      <div className='flex gap-2 items-center'>
        <button onClick={() => router.history.back()}>
          <MoveLeft />
        </button>
        <h1>{getTitle(klasse)}</h1>
      </div>

      <Link
        to='/klassen/$klassenId/edit'
        params={{
          klassenId
        }}
      >
        <Edit />
      </Link>
    </div>

    <KlasseNav klassenId={klassenId} />
    
    <div className='px-2 xl:px-8'>
      <div className='mb-8'>
        <h2>Klassenlehrer</h2>
        {
          (klasse as Klasse).klassenlehrer?.map((lehrer) => {
            return <p>{lehrer.vorname} {lehrer.nachname}</p>
          })
        }
      </div>

      <div className='flex flex-col gap-8'>
        { (klasse as Klasse).versionen?.map(version => {
          return <SchuelerList 
            leftHeader={<h2>{version.klassenstufe}{version.zusatz}</h2>}
            schueler={version.schueler ?? [] as Schueler[]}
            showDerzeitigeKlasse={false}
          />
        }) }   

      </div>
      

    </div>
    
  
  
  </div>
}
