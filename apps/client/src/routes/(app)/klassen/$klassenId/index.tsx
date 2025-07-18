import { createFileRoute } from '@tanstack/react-router'
import { type Klasse } from '@thesis/schule';
import { useRouter } from '@tanstack/react-router'
import { MoveLeft } from 'lucide-react';
import { KlasseNav } from '@/layout/KlasseNav';
import { SchuelerList } from '@/components/schueler/SchuelerList/SchuelerList';
import { useSchuelerStore } from '@/components/schueler/SchuelerStore';
import { Anwesenheitstyp } from '@thesis/anwesenheiten';
import { useKlasse } from '@/components/shared/useKlasse';
import { useAllSchueler } from '@/components/schueler/useSchueler';
import { useMemo } from 'react';

export const Route = createFileRoute('/(app)/klassen/$klassenId/')({
  component: RouteComponent,
})

function RouteComponent() {

  const router = useRouter()
  const { klassenId } = Route.useParams();
  const schueler = useSchuelerStore(store => store.schueler)
  
  const klasseQuery = useKlasse(parseInt(klassenId))
  const schuelerQuery = useAllSchueler()

  const klasse = useMemo(() => klasseQuery.data, [klasseQuery.data])
  console.log(klasse)

  if (klasseQuery.isPending || schuelerQuery.isPending) {
    return <p>Loading...</p>
  }

  const BackButton = <button onClick={() => router.history.back()}>
    <MoveLeft />
  </button>

  if (!klasse?.versionen) {
    return <p>{BackButton} Ein Fehler ist aufgetreten</p>
  }

  return <div className='w-full flex flex-col gap-8'>
    <KlasseNav klassenId={klassenId} />
    <div className='px-2 xl:px-8'>
      <div className='mb-8'>
        <h2>Klassenlehrer</h2>
        {
          (klasse as Klasse).klassenlehrer?.map((lehrer) => {
            return <p key={lehrer.id}>{lehrer.vorname} {lehrer.nachname}</p>
          })
        }
      </div>

      <div className='flex flex-col gap-8'>
        { (klasse as Klasse).versionen?.map(version => {
          return <SchuelerList 
            key={version.klassenstufe}
            typ={Anwesenheitstyp.UNTERRICHT}
            leftHeader={<h2>{version.klassenstufe}{version.zusatz}</h2>}
            schueler={schueler.filter((item) => version.schueler?.includes(item.id ?? -1))}
            showDerzeitigeKlasse={false}
          />
        }) }   

      </div>
      

    </div>
    
  
  
  </div>
}
