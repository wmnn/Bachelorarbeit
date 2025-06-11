import { SchuelerList } from '@/components/schueler/SchuelerList/SchuelerList'
import { useSchuelerStore } from '@/components/schueler/SchuelerStore'
import { SCHUELER_QUERY_KEY } from '@/reactQueryKeys'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type Schueler } from '@thesis/schueler';
import { getSchueler } from '@thesis/schueler'
import { useEffect } from 'react'

export const Route = createFileRoute('/(app)/schueler/')({
  component: RouteComponent,
})

function RouteComponent() {

  const setSchueler = useSchuelerStore(store => store.setSchueler);
  const { isPending, data: schuelerArr } = useQuery<Schueler[]>({
    queryKey: [SCHUELER_QUERY_KEY],
    queryFn: getSchueler,
    initialData: [],  
  })
  if (isPending) {
    return <p>Loading ...</p>
  }

  useEffect(() => {
    if (schuelerArr) {
      setSchueler((_) => schuelerArr ?? [])
    }
  }, [schuelerArr])

  return <SchuelerList schueler={schuelerArr} className='p-8'/>
}
