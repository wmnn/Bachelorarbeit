import { useDiagnostik } from '@/components/diagnostik/useDiagnostik';
import { DiagnostikNav } from '@/layout/DiagnostikNav';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(app)/diagnostikverfahren/$diagnostikId/info',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { diagnostikId } = Route.useParams();

  const query = useDiagnostik(parseInt(diagnostikId))
  if (query.isPending) {
      return <p>...Loading</p>
  }
  const diagnostik = query.data

  if (!diagnostik) {
    return <p>Ein Fehler ist aufgetreten, kontaktieren Sie den Admin.</p>
  }

  return <div className='w-full'>
    <DiagnostikNav diagnostikId={diagnostikId} />

  
    {JSON.stringify(diagnostik)}
  </div>
}
