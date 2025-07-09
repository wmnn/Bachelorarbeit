import { ButtonLight } from '@/components/ButtonLight';
import { useErgebnisse } from '@/components/diagnostik/useErgebnisse';
import { useSchuelerStore } from '@/components/schueler/SchuelerStore';
import { useAllSchueler } from '@/components/schueler/useSchueler';
import { DiagnostikNav } from '@/layout/DiagnostikNav';
import { createFileRoute, Link } from '@tanstack/react-router'
import { getDates, type Ergebnis, type Row } from '@thesis/diagnostik';

export const Route = createFileRoute(
  '/(app)/diagnostikverfahren/$diagnostikId/daten',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { diagnostikId } = Route.useParams();

  const query = useErgebnisse(parseInt(diagnostikId))

  if (query.isPending) {
    return <p>...Loading</p>
  }

  const ergebnisse = query.data

  if (!ergebnisse) return;

  return <div className='w-full'>
    <DiagnostikNav diagnostikId={diagnostikId} />
    <Table data={ergebnisse} />
  </div>
}

const Table = ({ data }: { data: Row[]}) => {

  const schueler = useSchuelerStore(store => store.schueler)
  useAllSchueler(false)
  const header = ['', ...getDates(data)]

  const rows = data.reduce((prev, acc) => {
    const { schuelerId } = acc
    if (!prev.some(item => item.schuelerId === schuelerId)) {
      // pushing entry for schueler and filling with empty data for the columns
      const schuelerData = schueler.find(schueler => schueler.id === schuelerId)

      prev.push({
        schuelerId,
        ergebnisse: 
          header.map((item, idx) => ({
            schuelerId,
            datum: item,
            ergebnis: idx !== 0 ? '' : schuelerData ? `${schuelerData.vorname} ${schuelerData.nachname}` : ''
          })) satisfies Ergebnis[]
      })
    }
    prev.map(item => {
      if (item.schuelerId !== schuelerId) {
        return item;
      }
      let ergebnisse = item.ergebnisse
      for (const ergebnis of acc.ergebnisse) {
        const index = getIndex(ergebnis.datum ?? '')
        if (index !== -1) {
          ergebnisse[index] = ergebnis
        }
      }

      const newItem = {
        ...item,
        ergebnisse
      }

      return newItem
    })

    return prev
  }, [] as Row[])

  function getIndex(datum: string): number {
    return header.findIndex(item => item === datum)
  }

  const handleDownload = () => {

    const csvRows = rows.map(row => {
      return row.ergebnisse.map(e => e.ergebnis ?? '').join(',');
    });
    const csvContent = [header.join(','), ...csvRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `data.csv`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return <div className='mx-8 mt-8'>

    {/* <div className='flex justify-end mb-8'>
      <div className='flex gap-2'>
        <ButtonLight>
          Sortieren
        </ButtonLight>

        <ButtonLight>
          Filtern
        </ButtonLight>

      </div>
    </div> */}

  
    <div className="overflow-x-auto mb-8">
      <table className="min-w-full table-fixed border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            {header.map(item => (
              <th
                key={item}
                className="border border-gray-300 px-4 py-2 text-center font-medium"
              >
                {item}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.schuelerId} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.ergebnisse.map((ergebnis, idx) => (
                idx == 0 ? 
                  <td
                    key={idx}
                    className="border border-gray-300 px-4 py-2 text-center"
                  >
                    <Link to='/schueler/$schuelerId' params={{ schuelerId: `${ergebnis.schuelerId}` }}
                  className='border-none'
                >{ergebnis.ergebnis}</Link>
                    
                  </td>
                
                :
                <td
                  key={idx}
                  className="border border-gray-300 px-4 py-2 text-center"
                >
                  {ergebnis.ergebnis}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>


    <ButtonLight onClick={handleDownload}>Export</ButtonLight>
  
  </div>
}
