import { useUserStore } from '@/components/auth/UserStore'
import { GanztagsangebotForm } from '@/components/ganztagsangebot/GanztagsangebotForm'
import { useAllSchueler } from '@/components/schueler/useSchueler'
import { useSchuljahrStore } from '@/components/schuljahr/SchuljahrStore'
import { useSelectedUserStore } from '@/components/shared/SelectedUserStore'
import { useAllUsers } from '@/components/shared/useAllUsers'
import { GANZTAGSANGEBOT_QUERY_KEY } from '@/reactQueryKeys'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { editGanztagsangebot, getGanztagsangebot, type Halbjahr, type Schuljahr } from '@thesis/schule'
import { useEffect, useState } from 'react'

export const Route = createFileRoute(
  '/(app)/ganztagsangebote/$ganztagsangebotId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const { ganztagsangebotId } = Route.useParams();
  const [selectedSchueler, setSelectedSchueler] = useState<number[]>([])
  const [name, setName] = useState('')
  const setSelectedUser = useSelectedUserStore(store => store.setSelectedUser)
  const selectedUser = useSelectedUserStore(store => store.selectedUser)
  const schuljahr = useSchuljahrStore(state => state.ausgewaeltesSchuljahr)
  const halbjahr = useSchuljahrStore(state => state.ausgewaeltesHalbjahr)
  const users = useUserStore(state => state.users)

  const { isPending, data: ganztagsangebot } = useQuery({
    queryKey: [GANZTAGSANGEBOT_QUERY_KEY, schuljahr, halbjahr, ganztagsangebotId],
    queryFn: ({ queryKey }) => {
      const [_key, schuljahr, halbjahr] = queryKey;
      return getGanztagsangebot((schuljahr as Schuljahr), (halbjahr as Halbjahr), parseInt(ganztagsangebotId));
    },
    initialData: undefined,
  });

  const usersQuery = useAllUsers()
  const schuelerQuery = useAllSchueler();

  async function onSubmit() {
    const res = await editGanztagsangebot({
      id: parseInt(ganztagsangebotId),
      name,
      schueler: selectedSchueler,
      betreuer: selectedUser.map(u => u.id ?? -1),
      schuljahr,
      halbjahr
    }, schuljahr, halbjahr);
    console.log(res)
  }

  useEffect(() => {
    if (!ganztagsangebot) return;

    // Update name only if it changed
    if (ganztagsangebot.name !== name) {
      setName(ganztagsangebot.name ?? '');
    }

    // Update selectedSchueler only if it changed
    const newSchueler = ganztagsangebot.schueler ?? [];
    if (JSON.stringify(newSchueler) !== JSON.stringify(selectedSchueler)) {
      setSelectedSchueler(newSchueler);
    }
   
    const newBetreuer =
      ganztagsangebot.betreuer?.map(userId =>
        users.find(user => user.id === userId) ?? { id: -1 }
      ) ?? [];

    // Update selectedUser only if it changed
    if (JSON.stringify(newBetreuer) !== JSON.stringify(selectedUser)) {
      setSelectedUser(() => newBetreuer);
    }

  }, [ganztagsangebot, users]);


  if (isPending || usersQuery.isPending || schuelerQuery.isPending) {
    return <p>Loading...</p>
  } 

  return <div className='p-8 w-full'>
      <GanztagsangebotForm 
        onSubmit={() => onSubmit()} 
        onAbort={() => router.history.back()} 
        submitButtonText={'Speichern'} 
        title='Ganztagsangebot bearbeiten'
        name={name}
        setName={setName}
        selectedSchueler={selectedSchueler}
        setSelectedSchueler={setSelectedSchueler}
      />
    </div>
}
