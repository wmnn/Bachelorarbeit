import { KuchenDiagramm } from '@/components/diagnostik/Diagramme/KuchenDiagramm';
import { useDiagnostik } from '@/components/diagnostik/useDiagnostik';
import { useErgebnisse } from '@/components/diagnostik/useErgebnisse';
import { DiagnostikNav } from '@/layout/DiagnostikNav';
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';

export const Route = createFileRoute(
  '/(app)/diagnostikverfahren/$diagnostikId/',
)({
  component: RouteComponent,
})

enum DiagrammTyp {
  BOX,
  LINIEN,
  KUCHEN,
  BALKEN
}

function RouteComponent() {

  const { diagnostikId } = Route.useParams();
  const diagnostikQuery = useDiagnostik(parseInt(diagnostikId))
  const [diagrammTyp, setDiagrammTyp] = useState(DiagrammTyp.KUCHEN) 

  const query = useErgebnisse(parseInt(diagnostikId))
  
    if (query.isPending) {
      return <p>...Loading</p>
    }
  
    const ergebnisse = query.data


  if (diagnostikQuery.isPending ||  query.isPending) {
      return <p>...Loading</p>
  }

  const diagnostik = diagnostikQuery.data

  if (!diagnostik) {
    return <p>Ein Fehler ist aufgetreten, kontaktieren Sie den Admin.</p>
  }

  return <div className='w-full'>
    <DiagnostikNav diagnostikId={diagnostikId} />

    <KuchenDiagramm data={ergebnisse} diagnostik={diagnostik} />
    {JSON.stringify(diagnostik)}


  
  </div>
}
