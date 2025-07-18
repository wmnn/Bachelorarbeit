import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { getUsers, getUsersQueryKey, type UsersResponseBody } from '@thesis/auth'
import { RollenListe } from '@/components/auth/RollenListe'
import { UserTable } from '@/components/auth/UserTable'
import { useRollenStore } from '@/components/auth/RollenStore'

export const Route = createFileRoute('/(app)/rollenmanagement/')({
  component: RouteComponent,
})

function RouteComponent() {

  const { isPending, data } = useQuery<UsersResponseBody | undefined>({
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

  setRollen((_) => data.rollen)
  
  return <div className='min-h-full p-2 xl:p-8 w-full'>
    <h1>Rollenmanagement</h1>
    <RollenListe/>
    <div className='overflow-x-scroll'>
      <UserTable users={data.users} />
    </div>
  </div>
}
