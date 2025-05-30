import type { User } from '@thesis/auth';
import { createContext, useEffect, useState, type ReactNode } from 'react'

type UserContextType = {
    user: User | undefined;
    setUser: (user: User | undefined) => void;
};

export const userContext = createContext<UserContextType>({
    user: undefined,
    setUser: () => {}
});

type ContextProps = {
    children: ReactNode;
};

const userKey = 'user'
export default function UserContextProvider({ children }: ContextProps) {

    const [user, setUserState] = useState<User | undefined >(undefined);


    function setUser(user: User | undefined) {
        localStorage.setItem(userKey, JSON.stringify(user)) 
        setUserState(user)
    }

    useEffect(() => {
        const savedUser = localStorage.getItem(userKey);
        if (!savedUser) return;
        try {
            const parsedUser = JSON.parse(savedUser)
            console.log(parsedUser)
            setUser(parsedUser)
        } catch(e) { }
    }, [])
   
    return (
        <userContext.Provider value={{ user, setUser }}>{children}</userContext.Provider> //everytime the render something inside this context we have access to this value
    )
}