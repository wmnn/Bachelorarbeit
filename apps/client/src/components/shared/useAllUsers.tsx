import { useQuery } from '@tanstack/react-query';
import { getUsers, getUsersQueryKey, type UsersResponseBody } from '@thesis/auth';
import { useUserStore } from '@/components/auth/UserStore';
import { useEffect } from 'react'; 

export const useAllUsers = () => {
  const setUsers = useUserStore(state => state.setUsers);
  const usersInStore = useUserStore(state => state.users);

  const queryResult = useQuery<UsersResponseBody | undefined>({
    queryKey: [getUsersQueryKey],
    queryFn: getUsers,
    initialData: undefined,
  });

  useEffect(() => {
    if (queryResult.data?.users && queryResult.data.users !== usersInStore) {
        setUsers((_) => queryResult.data!.users);
    }
  }, [queryResult.data, setUsers, usersInStore]); 

  return queryResult;
};