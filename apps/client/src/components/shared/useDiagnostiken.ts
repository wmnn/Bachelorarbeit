import { DIAGNOSTIKEN_QUERY_KEY } from "@/reactQueryKeys";
import { useQuery } from "@tanstack/react-query";
import { getDiagnostiken, type Diagnostik } from "@thesis/diagnostik";

export const useDiagnostiken = () => {

    const query = useQuery<Diagnostik[]>({
        queryKey: [DIAGNOSTIKEN_QUERY_KEY],
        queryFn: getDiagnostiken,
    })

    return query;
};