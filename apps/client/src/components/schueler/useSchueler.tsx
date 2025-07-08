import { useQuery } from '@tanstack/react-query';
import { SCHUELER_QUERY_KEY } from '@/reactQueryKeys';
import { getSchueler, type Schueler } from '@thesis/schueler';
import { useEffect } from 'react'; // Import useEffect
import { useSchuelerStore } from './SchuelerStore';

export const useAllSchueler = () => {
  const setSchueler = useSchuelerStore(store => store.setSchueler);
  const schuelerInStore = useSchuelerStore(store => store.schueler); 

  const queryResult = useQuery<Schueler[]>({
    queryKey: [SCHUELER_QUERY_KEY],
    queryFn: getSchueler,
    initialData: [],
  });

  useEffect(() => {
    if (queryResult.data && queryResult.data !== schuelerInStore) {
      if (Array.isArray(queryResult.data)) {
        setSchueler((_) => queryResult.data);
      }
    }
  }, [queryResult.data, setSchueler, schuelerInStore]);

  return queryResult;
};