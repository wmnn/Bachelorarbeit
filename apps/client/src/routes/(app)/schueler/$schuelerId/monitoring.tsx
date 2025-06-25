import { useDiagnostikSchuelerData } from '@/components/schueler/useDiagnostikSchuelerData';
import { SchuelerNav } from '@/layout/SchuelerNav';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/schueler/$schuelerId/monitoring')({
  component: RouteComponent,
})

function RouteComponent() {
  const { schuelerId } = Route.useParams();

  const { query, invalidate } = useDiagnostikSchuelerData(schuelerId);

  if (query.isPending) {
    return;
  }

  console.log(query.data)
  
  return <div className='flex flex-col w-full'>
    <SchuelerNav schuelerId={schuelerId} />
  </div>
}