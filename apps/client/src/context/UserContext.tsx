import type { User } from '@thesis/auth';
import { createContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'

type UserContextType = {
    user: User | undefined;
    setUser: Dispatch<SetStateAction<User | undefined>>;
};

export const userContext = createContext<UserContextType>({
    user: undefined,
    setUser: () => {}
});

type ContextProps = {
    children: ReactNode;
};

export default function UserContextProvider({ children }: ContextProps) {

    const [user, setUser] = useState<User | undefined >(undefined);
   
    return (
        <userContext.Provider value={{ user, setUser }}>{children}</userContext.Provider> //everytime the render something inside this context we have access to this value
    )
}