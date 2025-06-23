import { KuchenDiagramm } from '@/components/diagnostik/Diagramme/KuchenDiagramm';
import { useDiagnostik } from '@/components/diagnostik/useDiagnostik';
import { useErgebnisse } from '@/components/diagnostik/useErgebnisse';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

    <div>
      <Select 
          value={`${diagrammTyp}`}
          onValueChange={async (val) => {
              const typ = parseInt(val) as DiagrammTyp
              setDiagrammTyp(typ)
          }}
      >
          <SelectTrigger className="xl:w-[200px] w-min">
              <SelectValue placeholder="Keine Rolle"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={`${DiagrammTyp.BOX}`}>
              Box-Plot
            </SelectItem>    
            <SelectItem value={`${DiagrammTyp.KUCHEN}`}>
              Kuchen-Diagramm
            </SelectItem>   
            <SelectItem value={`${DiagrammTyp.LINIEN}`}>
              Linien-Diagramm
            </SelectItem>    
            <SelectItem value={`${DiagrammTyp.BALKEN}`}>
                Balken-Diagramm
            </SelectItem>                 
          </SelectContent>
      </Select>    
    </div>

    {
      diagrammTyp == DiagrammTyp.KUCHEN && <KuchenDiagramm data={ergebnisse} diagnostik={diagnostik} />
    }
  
  </div>
}
