import { DiagnostikNav } from '@/layout/DiagnostikNav';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(app)/diagnostikverfahren/$diagnostikId/daten',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { diagnostikId } = Route.useParams();
  return <div className='w-full'>
    <DiagnostikNav diagnostikId={diagnostikId} />
    Hello "/(app)/diagnostikverfahren/$diagnostikId/daten"!
  </div>
}
