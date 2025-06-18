import { useQuery } from '@tanstack/react-query';
import { useSchuljahrStore } from '../schuljahr/SchuljahrStore';
import { KLASSEN_QUERY_KEY } from '@/reactQueryKeys';
import { getKlassen, type Halbjahr, type Schuljahr } from '@thesis/schule';

export const useKlassen = () => {

    const schuljahr = useSchuljahrStore(state => state.ausgewaeltesSchuljahr)
    const halbjahr = useSchuljahrStore(state => state.ausgewaeltesHalbjahr)

    const queryResult = useQuery({
        queryKey: [KLASSEN_QUERY_KEY, schuljahr, halbjahr],
        queryFn: ({ queryKey }) => {
            const [_key, schuljahr, halbjahr] = queryKey;
            return getKlassen((schuljahr as Schuljahr), (halbjahr as Halbjahr));
        },
        initialData: [],
    });

    return queryResult;
};