import { ButtonLight } from '@/components/ButtonLight';
import { useErgebnisse } from '@/components/diagnostik/useErgebnisse';
import { Input } from '@/components/Input';
import { useSchuelerStore } from '@/components/schueler/SchuelerStore';
import { useAllSchueler } from '@/components/schueler/useSchueler';
import { DiagnostikNav } from '@/layout/DiagnostikNav';
import { createFileRoute } from '@tanstack/react-router'
import type { Ergebnis, Row } from '@thesis/diagnostik';

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

  return <div className='w-full'>
    <DiagnostikNav diagnostikId={diagnostikId} />
    <Table data={ergebnisse} />
  </div>
}

const Table = ({ data }: { data: Row[]}) => {

  const schueler = useSchuelerStore(store => store.schueler)
  useAllSchueler()
  const header = Array.from(data.reduce((prev, acc) => {
    for (const ergebnis of acc.ergebnisse) {
      let datum = ergebnis.datum ?? ''
      if (datum.includes('T')) {
        datum = datum.split('T')[0]
      }
      prev.add(datum)
    }
    return prev
  }, new Set(['']))) as string[]

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
    if (datum.includes('T')) {
      return header.findIndex(item => item === datum.split('T')[0])
    }
    return -1
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

    <div className='flex justify-end mb-8'>
      <div className='flex gap-2'>
        <ButtonLight>
          Sortieren
        </ButtonLight>

        <ButtonLight>
          Filtern
        </ButtonLight>

      </div>
    </div>

  
    <div className="overflow-x-scroll mb-8">
      <table className="min-w-full table-auto ">
        <tbody>
          <tr className='text-nowrap'>
            {header.map(item => <th key={item}>{item.includes('-') ? new Date(item).toLocaleDateString('de') : item}</th>)}
        
          </tr>

        
          {
            rows.map(row => <tr key={row.schuelerId}>
              { row.ergebnisse.map((ergebnis, idx) => {
                if (idx == 0) {
                  return <td key={idx}>{ergebnis.ergebnis}</td>
                }
                return <td key={idx} className=''><p className='w-[100px] text-center'>{ergebnis.ergebnis}</p></td>
                // return <td key={idx}><Input className='w-[100px]' value={ergebnis.ergebnis} /></td>
              }) }
            </tr>)
          } 
        </tbody>
      </table>
    </div>

    <ButtonLight onClick={handleDownload}>Export</ButtonLight>
  
  </div>
}
