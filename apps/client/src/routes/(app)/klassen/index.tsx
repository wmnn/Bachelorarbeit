import { HalbjahrSelect } from '@/components/schuljahr/HalbjahrSelect'
import { KlasseErstellenDialog } from '@/components/klasse/KlasseErstellenDialog'
import { KlasseListItem } from '@/components/klasse/KlasseListItem'
import { SchuljahrSelect } from '@/components/schuljahr/SchuljahrSelect'
import { List } from '@/components/List'
import { useSchuelerStore } from '@/components/schueler/SchuelerStore'
import { SCHUELER_QUERY_KEY } from '@/reactQueryKeys'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { getSchueler, type SchuelerSimple } from '@thesis/schueler'
import { type Klasse} from '@thesis/schule' 
import { use, useEffect, useState } from 'react'
import { ErrorDialog } from '@/components/dialog/MessageDialog'
import { ButtonLight } from '@/components/ButtonLight'
import { KlasseImportDialog } from '@/components/klasse/KlasseImportDialog'
import { useKlassen } from '@/components/shared/useKlassen'
import { userContext } from '@/context/UserContext'
import { Berechtigung } from '@thesis/rollen'
import { userHasPermission } from '@/components/auth/userHasPermission'

export const Route = createFileRoute('/(app)/klassen/')({
  component: RouteComponent,
})

function RouteComponent() {

  const setSchueler = useSchuelerStore(state => state.setSchueler)
  const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)
  const [isImportDialogShown, setIsImportDialogShown] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')
  const { user } = use(userContext)

  const { isPending: isPending2, data: schueler } = useQuery<SchuelerSimple[]>({
    queryKey: [SCHUELER_QUERY_KEY],
    queryFn: getSchueler,
  })

  const klassenQuery = useKlassen()

  useEffect(() => {
    if (schueler) {
      setSchueler((_) => (schueler ?? []) as any[])
    }

  }, [schueler])

  if (klassenQuery.isPending || isPending2) {
    return <p>Loading...</p>
  }
  const klassen = klassenQuery.data

  const RightHeader = <div className='flex gap-2'>
    <SchuljahrSelect />
    <HalbjahrSelect />
  </div>

  const header = <div className='flex justify-between mb-8'>
        <h1>Klassen</h1>

        <div>
          {RightHeader}
        </div>
  </div>

  return <div className='w-full'>

    { isImportDialogShown && <KlasseImportDialog closeDialog={() => setIsImportDialogShown(false)} setResponseMessage={setResponseMessage}/>}
    { isCreateDialogShown && <KlasseErstellenDialog closeDialog={() => setIsCreateDialogShown(false)} setResponseMessage={setResponseMessage} />}
    {(responseMessage !== '') && <ErrorDialog message={responseMessage} closeDialog={() => setResponseMessage('')}/>}

    <List 
      setIsCreateDialogShown={userHasPermission(user, Berechtigung.KlasseCreate, true) ? setIsCreateDialogShown : undefined} 
      createButonLabel='Klasse erstellen'
      header={header}
      className='p-2 xl:p-8 mb-8'
    >
      {
        klassen.map((item: Klasse) => {
          return <KlasseListItem klasse={item} key={item.id}/>
        })
      }
      {
        klassen.length === 0 && <ButtonLight onClick={() => setIsImportDialogShown(true)}>
          Aus letztem Halbjahr importieren
        </ButtonLight>
      }

    </List>

  </div>
}