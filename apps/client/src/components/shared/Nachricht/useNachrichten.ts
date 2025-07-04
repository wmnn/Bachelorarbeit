import { NACHRICHTEN_QUERY_KEY } from "@/reactQueryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNachrichten, type Nachricht, type NachrichtenTyp } from "@thesis/nachricht";

export const useNachrichten = (typ: NachrichtenTyp, id: number) => {
    const queryClient = useQueryClient()
    const queryKey = [NACHRICHTEN_QUERY_KEY, typ, id]
    const query = useQuery<Nachricht[]>({
        queryKey,
        queryFn: () => getNachrichten(id, typ),
        initialData: []
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey })
    }

    return { query, invalidate };
}