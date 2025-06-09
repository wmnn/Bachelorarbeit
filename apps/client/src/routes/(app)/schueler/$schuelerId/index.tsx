import { SchuelerEditForm } from '@/components/schueler/SchuelerForm';
import { SchuelerIcons } from '@/components/schueler/SchuelerIcons';
import { SchuelerNav } from '@/layout/SchuelerNav';
import { SCHUELER_QUERY_KEY } from '@/reactQueryKeys';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getSchuelerComplete } from '@thesis/schueler';
import { MoveLeft } from 'lucide-react';

export const Route = createFileRoute('/(app)/schueler/$schuelerId/')({
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
    
    return <div className='flex flex-col w-full'>

        <div className='flex gap-4 items-center px-8 pt-8'>
            <button onClick={() => router.history.back()}>
                <MoveLeft />
            </button>
            <h1>{schueler.vorname} {schueler.nachname}</h1>
            <div className='pt-2'>
                <SchuelerIcons schueler={schueler} />
            </div>
        </div>

        <SchuelerNav schuelerId={schuelerId} />

        <div className='px-8 flex flex-col'>

            <SchuelerEditForm 
                onSubmit={(_) => {}} 
                onAbort={() => router.history.back()} 
                submitButtonText="Speichern"
                initialSchueler={schueler}
            />
        </div>
    </div>
}
