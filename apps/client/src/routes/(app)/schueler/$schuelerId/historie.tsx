import { List } from '@/components/List';
import { useDiagnostikSchuelerData } from '@/components/schueler/useDiagnostikSchuelerData';
import { SchuelerNav } from '@/layout/SchuelerNav';
import { createFileRoute, Link } from '@tanstack/react-router'
import { sortErgebnisse, type DiagnostikenSchuelerData, type Ergebnis } from '@thesis/diagnostik';

export const Route = createFileRoute('/(app)/schueler/$schuelerId/historie')({
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
      <NoResultsList diagnostiken={diagnostiken} />
      <div className='my-4' />
      <HistorieList diagnostiken={diagnostiken} />
    </div>
    
  </div>
}

const NoResultsList = ({ diagnostiken }: { diagnostiken: DiagnostikenSchuelerData[]}) => {
  return <div>
    <h2>
      Diagnostiken mit keinen Ergebnissen
    </h2>
   
    <List>
      {
        (diagnostiken.filter(diagnostik => (diagnostik.ergebnisse ?? []).length > 0) ?? []).map(diagnostik => {
          return <li>
              <Link 
                className="flex items-center justify-between p-2"
                to='/diagnostikverfahren/$diagnostikId'
                params={{
                  diagnostikId: `${diagnostik.id ?? -1}`
                }}
              >
                <p>{diagnostik.name}</p>
                <p>Erstellungsdatum: {new Date(diagnostik.erstellungsDatum ?? '').toLocaleDateString('de')}</p>
              </Link>
          </li>
        })
      }
    </List>
  </div>
}

const HistorieList = ({ diagnostiken }: { diagnostiken: DiagnostikenSchuelerData[]}) => {

  type ExtendedErgebnis = {
    name: string,
    diagnostikId: number
  } & Ergebnis
  const ergebnisse: ExtendedErgebnis[] = diagnostiken.reduce((prev, acc) => {
    
    if (!acc.ergebnisse) {
      return prev;
    }

    const currentErgebnisse = acc.ergebnisse.reduce((prev, acc2) => {

      let ergebnisArray = acc2.ergebnisse.map(ergebnis => {
        return {
          ...ergebnis,
          name: acc.name,
          diagnostikId: acc.id ?? -1,
          schuelerId: acc2.schuelerId
        }
      })
      
      return [...prev, ...ergebnisArray]
    }, [] as any[])

    return [...prev, ...currentErgebnisse];
  }, [] as any[])

  return <div>
    <h2>Historie</h2>

    <List>
      {
        ((sortErgebnisse(ergebnisse) as ExtendedErgebnis[]).map(entry => {
          return <li>
              <Link 
                className="flex items-center justify-between p-2"
                to='/diagnostikverfahren/$diagnostikId'
                params={{
                  diagnostikId: `${entry.diagnostikId ?? -1}`
                }}
              >
                <p>{entry.name ?? 'Undefiniert'}</p>
                <p>{new Date(entry.datum ?? '').toLocaleDateString('de')}</p>
                <div className='flex items-center gap-2'>
                  <label>
                    Ergebnis:
                  </label>
                  <p>{entry.ergebnis}</p>
                </div>
                
              </Link>
          </li>
        
        }))
      }
    </List>

  </div>
}