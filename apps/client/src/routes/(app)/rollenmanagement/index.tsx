import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { getUsers, type User, type UsersResponseBody } from '@thesis/auth'
import { RollenListe } from '@/components/rollen/RollenListe'
import { UserTable } from '@/components/rollen/UserTable'

export const Route = createFileRoute('/(app)/rollenmanagement/')({
  component: RouteComponent,
})

function RouteComponent() {

  const { isPending, error, data } = useQuery<UsersResponseBody | undefined>({
    queryKey: ['users'],
    queryFn: getUsers,
    initialData: undefined,  
  })

  if (isPending) {
    return <p>Loading...</p>
  }

  if (!data) {
    return;
  }
  
  return <div className='min-h-full py-8 px-8 w-full'>
    <h1>Rollenmanagement</h1>

    <h2 className='mt-[24px]'>Rollen</h2>
    <RollenListe rollen={data.rollen}/>

    <UserTable users={data.users} rollen={data.rollen}/>
  </div>
}
