import { NACHRICHTEN_QUERY_KEY } from "@/reactQueryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNachrichtenVorlagen, type NachrichtenTyp } from "@thesis/nachricht";

export const useNachrichtenVorlagen = (typ: NachrichtenTyp) => {
    const queryClient = useQueryClient()
    const queryKey = [NACHRICHTEN_QUERY_KEY + 'vorlagen', typ]
    const query = useQuery<string[]>({
        queryKey,
        queryFn: () => getNachrichtenVorlagen(typ),
        initialData: []
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey })
    }

    return { query, invalidate };
}