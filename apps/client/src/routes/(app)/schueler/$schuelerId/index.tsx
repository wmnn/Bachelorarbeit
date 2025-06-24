import { ErrorDialog } from '@/components/dialog/MessageDialog';
import { SchuelerEditForm } from '@/components/schueler/SchuelerForm';
import { SchuelerNav } from '@/layout/SchuelerNav';
import { SCHUELER_QUERY_KEY } from '@/reactQueryKeys';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { editSchueler, getSchuelerComplete, type Schueler } from '@thesis/schueler';
import { useState } from 'react';

export const Route = createFileRoute('/(app)/schueler/$schuelerId/')({
  component: RouteComponent,
})

function RouteComponent() {

    const router = useRouter()
    const queryClient = useQueryClient();
    const { schuelerId } = Route.useParams();

    const { isPending, data: schueler } = useQuery({
        queryKey: [SCHUELER_QUERY_KEY, schuelerId],
        queryFn: ({ queryKey }) => {
        const [_key, schuelerId] = queryKey;
            return getSchuelerComplete(parseInt(schuelerId));
        },
        initialData: undefined,
        staleTime: 0
    });

    const [responseMessage, setResponseMessage] = useState('')

    if (isPending) {
        return <p>Loading...</p>;
    }

    if (!schueler) {
        return <p>Kein Schüler gefunden.</p>;
    }

    async function handleSubmit(newSchueler: Schueler) {
        const res = await editSchueler(newSchueler, schuelerId)
        setResponseMessage(res?.message)
        if (res.success) {
            queryClient.setQueryData([SCHUELER_QUERY_KEY, schuelerId], newSchueler);
            queryClient.invalidateQueries({ queryKey: [SCHUELER_QUERY_KEY]})
        }
    }
    
    return <div className='flex flex-col w-full'>

        {(responseMessage !== '') && <ErrorDialog message={responseMessage} closeDialog={() => setResponseMessage('')}/>}

        <SchuelerNav schuelerId={schuelerId} />

        <div className='px-8 flex flex-col'>

            <SchuelerEditForm 
                onSubmit={handleSubmit} 
                onAbort={() => router.history.back()} 
                submitButtonText="Speichern"
                initialSchueler={schueler}
            />
        </div>
    </div>
}
