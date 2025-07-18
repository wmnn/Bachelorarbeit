import { userHasPermission } from '@/components/auth/userHasPermission'
import { ErrorDialog } from '@/components/dialog/MessageDialog'
import { GanztagsangebotErstellenDialog } from '@/components/ganztagsangebot/GanztagsangebotErstellenDialog'
import { GanztagsangebotListItem } from '@/components/ganztagsangebot/GanztagsangebotListItem'
import { List } from '@/components/List'
import { HalbjahrSelect } from '@/components/schuljahr/HalbjahrSelect'
import { SchuljahrSelect } from '@/components/schuljahr/SchuljahrSelect'
import { useSchuljahrStore } from '@/components/schuljahr/SchuljahrStore'
import { userContext } from '@/context/UserContext'
import { GANZTAGSANGEBOT_QUERY_KEY } from '@/reactQueryKeys'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Berechtigung } from '@thesis/rollen'
import { getGanztagsangebote, type Halbjahr, type Schuljahr } from '@thesis/schule'
import { use, useState } from 'react'

export const Route = createFileRoute('/(app)/ganztagsangebote/')({
  component: RouteComponent,
})

function RouteComponent() {

  const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')
  const { user } = use(userContext)

  const schuljahr = useSchuljahrStore(state => state.ausgewaeltesSchuljahr)
  const halbjahr = useSchuljahrStore(state => state.ausgewaeltesHalbjahr)

   const { isPending, data: ganztagsangebote } = useQuery({
    queryKey: [GANZTAGSANGEBOT_QUERY_KEY, schuljahr, halbjahr],
    queryFn: ({ queryKey }) => {
      const [_key, schuljahr, halbjahr] = queryKey;
      return getGanztagsangebote((schuljahr as Schuljahr), (halbjahr as Halbjahr));
    },
    initialData: [],
    staleTime: 0
  });
  if (isPending) {
    return <p>...Loading</p>
  }

  const header = <div className='flex flex-col md:flex-row justify-between mb-8 md:mb-0'>
    <h1>
      Ganztagsangebote
    </h1>
    <div className='flex gap-2'>
        <SchuljahrSelect />
        <HalbjahrSelect />
      </div>
  </div>

  return <div className='w-full'>

    { isCreateDialogShown && <GanztagsangebotErstellenDialog closeDialog={() => setIsCreateDialogShown(false)} setResponseMessage={setResponseMessage} />}
    {(responseMessage !== '') && <ErrorDialog message={responseMessage} closeDialog={() => setResponseMessage('')}/>}

    <List 
      setIsCreateDialogShown={userHasPermission(user, Berechtigung.GanztagsangebotCreate, true) ? setIsCreateDialogShown : undefined} 
      createButonLabel='Ganztagsangebot erstellen'
      header={header}
      className='p-2 xl:p-8'
    >
      {
        ganztagsangebote.map((item) => {
          return <GanztagsangebotListItem key={item.id} ganztagsangebot={item} />
        })
      }

    </List>

  </div>
}
