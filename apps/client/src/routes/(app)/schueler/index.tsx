import { SchuelerList } from '@/components/schueler/SchuelerList/SchuelerList'
import { useSchuelerStore } from '@/components/schueler/SchuelerStore'

import { useAllSchueler } from '@/components/schueler/useSchueler'
import { createFileRoute } from '@tanstack/react-router'
import { Anwesenheitstyp } from '@thesis/anwesenheiten'

export const Route = createFileRoute('/(app)/schueler/')({
  component: RouteComponent,
})

function RouteComponent() {

  const schueler = useSchuelerStore(store => store.schueler)
  const schuelerQuery = useAllSchueler()

  if (schuelerQuery.isPending) {
    return <p>Loading ...</p>
  }

  return <SchuelerList 
    schueler={schueler} 
    className='p-2 xl:p-8 mb-8' 
    typ={Anwesenheitstyp.UNTERRICHT}
    leftHeader={<h1>Schüler</h1>}
  />
}
