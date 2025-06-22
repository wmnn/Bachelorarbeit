import { DIAGNOSTIKEN_QUERY_KEY } from "@/reactQueryKeys";
import { useQuery } from "@tanstack/react-query";
import { DiagnostikTyp, getDiagnostiken, type Diagnostik } from "@thesis/diagnostik";

export const useDiagnostiken = (speicherTyp: DiagnostikTyp | undefined = DiagnostikTyp.LAUFENDES_VERFAHREN) => {
    const query = useQuery<Diagnostik[]>({
        queryKey: [DIAGNOSTIKEN_QUERY_KEY, speicherTyp],
        queryFn: () => getDiagnostiken(speicherTyp),
    });

    return query;
};