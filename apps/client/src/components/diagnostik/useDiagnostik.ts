import { DIAGNOSTIKEN_QUERY_KEY } from "@/reactQueryKeys";
import { useQuery } from "@tanstack/react-query";
import { getDiagnostik } from "@thesis/diagnostik";

export const useDiagnostik = (diagnostikId: number) => {

    const query = useQuery({
        queryKey: [DIAGNOSTIKEN_QUERY_KEY, diagnostikId],
        queryFn: ({ queryKey }) => {
            const [_key, diagnostikId] = queryKey;
            return getDiagnostik(typeof diagnostikId === 'number' ? diagnostikId : parseInt(diagnostikId));
        },
        initialData: undefined,
    });

    return query;
};