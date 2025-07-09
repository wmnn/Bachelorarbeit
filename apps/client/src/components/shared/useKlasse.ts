import { KLASSEN_QUERY_KEY } from "@/reactQueryKeys";
import { useQuery } from "@tanstack/react-query";
import { useSchuljahrStore } from "../schuljahr/SchuljahrStore";
import { getKlasse, type Halbjahr, type Schuljahr } from "@thesis/schule";

export const useKlasse = (klasseId: number, redirect: boolean = true) => {

    const schuljahr = useSchuljahrStore(state => state.ausgewaeltesSchuljahr)
    const halbjahr = useSchuljahrStore(state => state.ausgewaeltesHalbjahr)

    const query = useQuery({
        queryKey: [KLASSEN_QUERY_KEY, schuljahr, halbjahr, klasseId],
        queryFn: ({ queryKey }) => {
            const [_key, schuljahr, halbjahr, klasseId] = queryKey;
            return getKlasse((schuljahr as Schuljahr), (halbjahr as Halbjahr), typeof klasseId === 'number' ? klasseId : parseInt(klasseId), redirect);
        },
        initialData: undefined,
    });

    return query;
};