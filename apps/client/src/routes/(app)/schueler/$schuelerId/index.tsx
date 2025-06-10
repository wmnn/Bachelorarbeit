import { ErrorDialog } from '@/components/dialog/MessageDialog';
import { DeleteIcon } from '@/components/icons/DeleteIcon';
import { SchuelerEditForm } from '@/components/schueler/SchuelerForm';
import { SchuelerIcons } from '@/components/schueler/SchuelerIcons';
import { SchuelerLoeschenDialog } from '@/components/schueler/SchuelerLoeschenDialog';
import { SchuelerNav } from '@/layout/SchuelerNav';
import { SCHUELER_QUERY_KEY } from '@/reactQueryKeys';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { editSchueler, getSchuelerComplete, type Schueler } from '@thesis/schueler';
import { MoveLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    const [isDeleteDialogShown, setIsDeleteDialogShown] = useState(false)

    if (isPending) {
        return <p>Loading...</p>;
    }

    if (!schueler) {
        return <p>Kein Schüler gefunden.</p>;
    }

    async function handleSubmit(newSchueler: Schueler) {
        const res = await editSchueler(newSchueler, schuelerId)
        setResponseMessage(res?.message)
        queryClient.setQueryData([SCHUELER_QUERY_KEY, schuelerId], newSchueler);
    }
    
    return <div className='flex flex-col w-full'>

        {(responseMessage !== '') && <ErrorDialog message={responseMessage} closeDialog={() => setResponseMessage('')}/>}

            {
                isDeleteDialogShown && <SchuelerLoeschenDialog schuelerId={schueler.id ?? -1} closeDialog={() => setIsDeleteDialogShown(false)}/>
            }

        <div className='flex justify-between items-center px-8'>
            <div className='flex gap-4 items-center pt-8'>
                <button onClick={() => router.history.back()}>
                    <MoveLeft />
                </button>
                <h1>{schueler.vorname} {schueler.nachname}</h1>
                <div className='pt-2'>
                    <SchuelerIcons schueler={schueler} />
                </div>
            </div>

            <button onClick={() => setIsDeleteDialogShown(true)}>
                <DeleteIcon />
            </button>

        </div>

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
