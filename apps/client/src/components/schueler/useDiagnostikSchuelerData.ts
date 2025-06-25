import { DIAGNOSTIKEN_QUERY_KEY } from "@/reactQueryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDiagnostikSchuelerData, type GetSchuelerDataResponseBody } from "@thesis/diagnostik";

export const useDiagnostikSchuelerData = (schuelerId: string) => {
    const queryClient = useQueryClient()
    const queryKey = [DIAGNOSTIKEN_QUERY_KEY, schuelerId]
    const query = useQuery<GetSchuelerDataResponseBody>({
        queryKey,
        queryFn: () => getDiagnostikSchuelerData(schuelerId),
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey })
    }

    return { query, invalidate };
}