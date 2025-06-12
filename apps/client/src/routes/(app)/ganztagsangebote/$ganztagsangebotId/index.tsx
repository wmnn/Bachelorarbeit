import { useRollenStore } from '@/components/auth/RollenStore'
import { useUserStore } from '@/components/auth/UserStore'
import { SchuelerList } from '@/components/schueler/SchuelerList/SchuelerList'
import { useSchuelerStore } from '@/components/schueler/SchuelerStore'
import { useSchuljahrStore } from '@/components/schuljahr/SchuljahrStore'
import { GANZTAGSANGEBOT_QUERY_KEY } from '@/reactQueryKeys'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getUsers, getUsersQueryKey, type UsersResponseBody } from '@thesis/auth'
import { getGanztagsangebot, getGanztagsangebote, type Halbjahr, type Schuljahr } from '@thesis/schule'
import { MoveLeft } from 'lucide-react'

export const Route = createFileRoute(
  '/(app)/ganztagsangebote/$ganztagsangebotId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const { ganztagsangebotId } = Route.useParams();
  
  const schuljahr = useSchuljahrStore(state => state.ausgewaeltesSchuljahr)
  const schueler = useSchuelerStore(state => state.schueler)
  const users = useUserStore(state => state.users)
  const setUsers = useUserStore(state => state.setUsers)
  const halbjahr = useSchuljahrStore(state => state.ausgewaeltesHalbjahr)

  const { isPending, data: ganztagsangebot } = useQuery({
    queryKey: [GANZTAGSANGEBOT_QUERY_KEY, schuljahr, halbjahr, ganztagsangebotId],
    queryFn: ({ queryKey }) => {
      const [_key, schuljahr, halbjahr] = queryKey;
      return getGanztagsangebot((schuljahr as Schuljahr), (halbjahr as Halbjahr), parseInt(ganztagsangebotId));
    },
    initialData: undefined,
  });

  const { isPending: isPending2, data } = useQuery<UsersResponseBody | undefined>({
    queryKey: [getUsersQueryKey],
    queryFn: getUsers,
    initialData: undefined,  
  })

  const setRollen = useRollenStore((state) => state.setRollen);

  if (isPending) {
    return <p>Loading...</p>
  }

  if (!data) {
    return;
  }
 
  if (isPending || isPending2) {
    return <p>Loading...</p>
  }

  setRollen((_) => data.rollen)
  setUsers((_) => data.users)
  
  return <div className='w-full'>

    <div className='flex justify-start items-center px-8'>
            <div className='flex gap-4 items-center pt-8'>
                <button onClick={() => router.history.back()}>
                    <MoveLeft />
                </button>
                <h1>{ganztagsangebot?.name}</h1>
              
            </div>
    </div>

    <div className='px-2 xl:px-8'>
          <div className='mb-8'>
            <h2>Betreuer</h2>
            {
              ganztagsangebot?.betreuer?.map((betreuerId) => {
                const user = users.find(user => user?.id === betreuerId)
                return <p>{user?.vorname} {user?.nachname}</p>
              })
            }
          </div>
    
          <div className='flex flex-col gap-8'>
           
            <SchuelerList 
              schueler={schueler.filter((item) => ganztagsangebot?.schueler?.includes(item.id ?? -1))}
            />
          
    
          </div>
          
    
        </div>
  </div>
}
