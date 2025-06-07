import { HalbjahrSelect } from '@/components/schuljahr/HalbjahrSelect'
import { KlasseErstellenDialog } from '@/components/klasse/KlasseErstellenDialog'
import { KlasseListItem } from '@/components/klasse/KlasseListItem'
import { SchuljahrSelect } from '@/components/schuljahr/SchuljahrSelect'
import { List } from '@/components/List'
import { useSchuelerStore } from '@/components/schueler/SchuelerStore'
import { KLASSEN_QUERY_KEY } from '@/reactQueryKeys'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { getSchueler, type SchuelerSimple } from '@thesis/schueler'
import { getKlassen, type Halbjahr, type Klasse, type Schuljahr } from '@thesis/schule' 
import { useEffect, useState } from 'react'
import { useSchuljahrStore } from '@/components/schuljahr/SchuljahrStore'

export const Route = createFileRoute('/(app)/klassen/')({
  component: RouteComponent,
})

function RouteComponent() {

  const setSchueler = useSchuelerStore(state => state.setSchueler)
  const schuljahr = useSchuljahrStore(state => state.ausgewaeltesSchuljahr)
  const halbjahr = useSchuljahrStore(state => state.ausgewaeltesHalbjahr)

  const { isPending: isPending2, data: schueler } = useQuery<SchuelerSimple[]>({
    queryKey: ['schueler'],
    queryFn: getSchueler,
  })

  const { isPending, data: klassen } = useQuery({
    queryKey: [KLASSEN_QUERY_KEY, schuljahr, halbjahr],
    queryFn: ({ queryKey }) => {
      const [_key, schuljahr, halbjahr] = queryKey;
      return getKlassen((schuljahr as Schuljahr), (halbjahr as Halbjahr));
    },
    initialData: [],
  });

  const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)
  

  useEffect(() => {
    if (schueler) {
      setSchueler((_) => schueler ?? [])
    }

  }, [schueler])

  if (isPending || isPending2) {
    return <p>Loading...</p>
  }

  const LeftHeader = <h1>
    Klassen
  </h1>

  const RightHeader = <div className='flex gap-2'>
    <SchuljahrSelect />
    <HalbjahrSelect />
  </div>

  return <div className='w-full'>

    { isCreateDialogShown && <KlasseErstellenDialog closeDialog={() => setIsCreateDialogShown(false)}/>}

    <List 
      setIsCreateDialogShown={setIsCreateDialogShown} 
      createButonLabel='Klasse erstellen'
      leftHeader={LeftHeader}
      rightHeader={RightHeader}
      className='p-8'
    >
      {
        klassen.map((item: Klasse) => {
          return <KlasseListItem klasse={item} key={item.id}/>
        })
      }

    </List>

  </div>
}