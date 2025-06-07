import { HalbjahrSelect } from '@/components/klasse/HalbjahrSelect'
import { KlasseErstellenDialog } from '@/components/klasse/KlasseErstellenDialog'
import { KlasseListItem } from '@/components/klasse/KlasseListItem'
import { SchuljahrSelect } from '@/components/klasse/SchuljahrSelect'
import { List } from '@/components/List'
import { useSchuelerStore } from '@/components/schueler/schuelerStore'
import { KLASSEN_QUERY_KEY } from '@/reactQueryKeys'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { getSchueler, type SchuelerSimple } from '@thesis/schueler'
import { getKlassen } from '@thesis/schule' 
import { useState } from 'react'

export const Route = createFileRoute('/(app)/klassen/')({
  component: RouteComponent,
})

function RouteComponent() {

  const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)

  const { isPending: isPending2, data: schueler } = useQuery<SchuelerSimple[]>({
    queryKey: ['schueler'],
    queryFn: getSchueler,
  })
  if (isPending2) {
    return <p>Loading...</p>
  }

  const setSchueler = useSchuelerStore(state => state.setSchueler)
  setSchueler((_) => schueler ?? [])


  // const { isPending, data: klassen } = useQuery<any[]>({
  //   queryKey: [KLASSEN_QUERY_KEY],
  //   queryFn: getKlassen,
  //   initialData: [],  
  // })

  // if (isPending) {
  //   return <p>Loading ...</p>
  // }


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
    >
      <p></p>
      {/* {
        klassen.map((item) => {
          return <KlasseListItem schueler={item}/>
        })
      } */}

    </List>

  </div>
}