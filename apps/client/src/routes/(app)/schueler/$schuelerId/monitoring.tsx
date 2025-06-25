import { SchuelerResultBalkenDiagramm } from '@/components/diagnostik/Diagramme/SchuelerResultBalkenDiagramm';
import { useDiagnostikSchuelerData } from '@/components/schueler/useDiagnostikSchuelerData';
import { SchuelerNav } from '@/layout/SchuelerNav';
import { createFileRoute } from '@tanstack/react-router'
import { getMindeststandard } from '@thesis/diagnostik';

export const Route = createFileRoute('/(app)/schueler/$schuelerId/monitoring')({
  component: RouteComponent,
})

function RouteComponent() {
  const { schuelerId } = Route.useParams();
  
  const { query } = useDiagnostikSchuelerData(schuelerId);

  if (query.isPending) {
    return;
  }

  if (!query.data || !query.data.data) {
    return;
  }
  const diagnostiken = query.data.data
  
  return <div className='flex flex-col w-full'>
    <SchuelerNav schuelerId={schuelerId} />

    <div className='p-2 xl:p-8'>
        <ul className='flex flex-col gap-8 w-full'>
          {
            diagnostiken.map(diagnostik => {

              if ((diagnostik.ergebnisse ?? []).length == 0) {
                return;
              }
              return <li className='border-black border-[1px] rounded-xl p-4 flex flex-col gap-4'>

                  <h2>Diagnostik: {diagnostik.name}</h2>

                  <div className='flex gap-2'>
                    {
                      diagnostik.ergebnisse && diagnostik.ergebnisse.map(row => {
                        return <>
                          {
                            row.ergebnisse.map(ergebnis => {
                              return <SchuelerResultBalkenDiagramm  
                                obereGrenze={parseInt(`${diagnostik.obereGrenze ?? -1}`)}
                                untereGrenze={parseInt(`${diagnostik.untereGrenze ?? -1}`)}
                                mindeststandard={getMindeststandard(diagnostik) ?? -1}  
                                ergebnis={parseInt(ergebnis.ergebnis)}
                                label={new Date(ergebnis.datum ?? '').toLocaleDateString('de')}   
                              />
                            })
                          }
                        </>
                      }) 
                    }
                  </div>
              </li>
            })
          }
        </ul>
    </div>

    
  </div>
}