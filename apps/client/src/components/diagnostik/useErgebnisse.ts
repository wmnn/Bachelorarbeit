import { DIAGNOSTIKEN_QUERY_KEY } from "@/reactQueryKeys";
import { useQuery } from "@tanstack/react-query";
import { getErgebnisse } from "@thesis/diagnostik";

export const useErgebnisse = (diagnostikId: number) => {

    const query = useQuery({
        queryKey: [DIAGNOSTIKEN_QUERY_KEY + 'data', diagnostikId],
        queryFn: ({ queryKey }) => {
            const [_key, diagnostikId] = queryKey;
            return getErgebnisse(`${diagnostikId}`);
        },
        initialData: [],
    });

    return query;
};