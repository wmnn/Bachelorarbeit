import { SCHUELER_QUERY_KEY } from '@/reactQueryKeys';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getSchuelerComplete } from '@thesis/schueler';
import { MoveLeft } from 'lucide-react';

export const Route = createFileRoute('/(app)/schueler/$schuelerId')({
  component: RouteComponent,
})

function RouteComponent() {

    const router = useRouter()

    const { schuelerId } = Route.useParams();

    const { isPending, data: schueler } = useQuery({
        queryKey: [SCHUELER_QUERY_KEY, schuelerId],
        queryFn: ({ queryKey }) => {
        const [_key, schuelerId] = queryKey;
        return getSchuelerComplete(parseInt(schuelerId));
        },
        initialData: undefined,
    });

    if (isPending) {
        return <p>Loading...</p>
    }

    if (!schueler) {
        return;
    }
    
    return <div className='p-8 flex flex-col w-full'>

        <div className='flex gap-2 items-center'>
            <button onClick={() => router.history.back()}>
                <MoveLeft />
            </button>
            <h1>{schueler.vorname} {schueler.nachname}</h1>
        </div>

        {JSON.stringify(schueler)}
        
       
    </div>
}
