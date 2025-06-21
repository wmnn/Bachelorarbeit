import { DiagnostikNav } from '@/layout/DiagnostikNav';
import { DIAGNOSTIKEN_QUERY_KEY } from '@/reactQueryKeys'
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getDiagnostik } from '@thesis/diagnostik'
import { MoveLeft } from 'lucide-react';

export const Route = createFileRoute(
  '/(app)/diagnostikverfahren/$diagnostikId/',
)({
  component: RouteComponent,
})

function RouteComponent() {

  const router = useRouter()
  const { diagnostikId } = Route.useParams();

  const { isPending, data: diagnostik } = useQuery({
    queryKey: [DIAGNOSTIKEN_QUERY_KEY, diagnostikId],
    queryFn: ({ queryKey }) => {
      const [_key, diagnostikId] = queryKey;
      return getDiagnostik(parseInt(diagnostikId));
    },
    initialData: undefined,
  });

  if (isPending) {
      return <p>...Loading</p>
  }

  if (!diagnostik) {
    return <p>Ein Fehler ist aufgetreten, kontaktieren Sie den Admin.</p>
  }

  return <div>
    {/* TODO refactor */}
    <div className='flex justify-between px-8 pt-8'>
      <div className='flex gap-2 items-center'>
        <button onClick={() => router.history.back()}>
          <MoveLeft />
        </button>
        <h1>{diagnostik.name}</h1>
      </div>
    </div>
    <DiagnostikNav diagnostikId={diagnostikId} />
    {JSON.stringify(diagnostik)}
  
  </div>
}
