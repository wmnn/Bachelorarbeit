import { ANWESENHEITEN_QUERY_KEY } from "@/reactQueryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnwesenheitTyp, getAnwesenheiten } from "@thesis/anwesenheiten";
import { getSchuljahr, type Schuljahr } from "@thesis/schule";

export const useAnwesenheiten = (schuelerId: number, typ: AnwesenheitTyp) => {

    const queryClient = useQueryClient()
    const queryKey = [ANWESENHEITEN_QUERY_KEY, schuelerId, getSchuljahr(new Date()), typ]

    const query = useQuery({
        queryKey,
        queryFn: ({ queryKey }) => {
        const [_key, schuelerId, schuljahr, typ] = queryKey as [string, string, Schuljahr, AnwesenheitTyp];
            return getAnwesenheiten(parseInt(schuelerId), schuljahr as Schuljahr, typ);
        },
        initialData: undefined,
        staleTime: 0
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey })
    }

    return {
        query,
        invalidate
    };
};