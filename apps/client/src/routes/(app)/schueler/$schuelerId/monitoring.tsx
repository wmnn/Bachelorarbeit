import { DateFilter } from '@/components/diagnostik/Diagramme/DateFilter';
import { SchuelerBalkenDiagramm } from '@/components/diagnostik/Diagramme/SchuelerBalkenDiagramm';
import { useDiagnostikSchuelerData } from '@/components/schueler/useDiagnostikSchuelerData';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SchuelerNav } from '@/layout/SchuelerNav';
import { createFileRoute } from '@tanstack/react-router'

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
        <SchuelerBalkenDiagramm data={diagnostiken as any} />
    </div>    
  </div>
}