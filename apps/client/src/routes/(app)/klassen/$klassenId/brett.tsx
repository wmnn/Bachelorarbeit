import { KlasseNav } from '@/layout/KlasseNav';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/klassen/$klassenId/brett')({
  component: RouteComponent,
})

function RouteComponent() {
  const { klassenId } = Route.useParams();
  return <div className='w-full flex flex-col gap-8'>
    <KlasseNav klassenId={klassenId} />
  </div>
}
