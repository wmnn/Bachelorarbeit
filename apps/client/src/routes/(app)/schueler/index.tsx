import { List } from '@/components/List'
import { SchuelerErstellenDialog } from '@/components/schueler/SchuelerErstellenDialog'
import { SchuelerListItem } from '@/components/schueler/SchuelerListItem'
import { SCHUELER_QUERY_KEY } from '@/reactQueryKeys'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type SchuelerSimple } from '@thesis/schueler';
import { getSchueler } from '@thesis/schueler'
import { useState } from 'react'

export const Route = createFileRoute('/(app)/schueler/')({
  component: RouteComponent,
})

function RouteComponent() {

  const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)

  const { isPending, data: schuelerArr } = useQuery<SchuelerSimple[]>({
    queryKey: [SCHUELER_QUERY_KEY],
    queryFn: getSchueler,
    initialData: [],  
  })
  if (isPending) {
    return <p>Loading ...</p>
  }

  return <List 
    setIsCreateDialogShown={setIsCreateDialogShown} 
    createButonLabel='Schüler erstellen'
    leftHeader={<h1>Schüler</h1>}
    className='p-8'
    
  >
    { isCreateDialogShown && <SchuelerErstellenDialog closeDialog={() => setIsCreateDialogShown(false)}/>}
    {
      schuelerArr.map(schueler => {
        return <SchuelerListItem schueler={schueler}/>
      })
    }
  </List>
}
