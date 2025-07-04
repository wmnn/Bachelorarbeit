import { NACHRICHTEN_QUERY_KEY } from "@/reactQueryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllNachrichten, type Nachricht, type NachrichtenTyp } from "@thesis/nachricht";

export const useAllNachrichten = (typ: NachrichtenTyp) => {
    const queryClient = useQueryClient()
    const queryKey = [NACHRICHTEN_QUERY_KEY, typ]
    const query = useQuery<Nachricht[]>({
        queryKey,
        queryFn: () => getAllNachrichten(typ),
        initialData: []
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey })
    }

    return { query, invalidate };
}