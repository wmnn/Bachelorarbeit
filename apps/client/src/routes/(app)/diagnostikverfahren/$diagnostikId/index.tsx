import { BoxPlot } from '@/components/diagnostik/Diagramme/BoxPlot';
import { KlassenBalkenDiagramm } from '@/components/diagnostik/Diagramme/KlassenBalkenDiagramm';
import { KuchenDiagramm } from '@/components/diagnostik/Diagramme/KuchenDiagramm';
import { Liniendiagramm } from '@/components/diagnostik/Diagramme/LinienDiagramm';
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

    <div className='p-2 xl:p-8'>
      <label>
        Diagramm:
      </label>
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

      <div className='mb-8' />

      {
        diagrammTyp == DiagrammTyp.KUCHEN && <KuchenDiagramm data={ergebnisse} diagnostik={diagnostik} />
      }

      {
        diagrammTyp == DiagrammTyp.LINIEN && <Liniendiagramm data={ergebnisse} diagnostik={diagnostik} />
      }

      {
        diagrammTyp == DiagrammTyp.BALKEN && <KlassenBalkenDiagramm data={ergebnisse} diagnostik={diagnostik} />
      }
      
      {
        diagrammTyp == DiagrammTyp.BOX && <BoxPlot data={ergebnisse} diagnostik={diagnostik} />
      }
    </div>
  
  </div>
}
