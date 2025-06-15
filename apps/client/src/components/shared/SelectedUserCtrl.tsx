import { DeleteIcon } from "../icons/DeleteIcon";
import { ButtonLight } from "../ButtonLight";
import { use, useEffect, useRef, useState } from "react";
import { userContext } from "@/context/UserContext";
import { useSelectedUserStore } from "./SelectedUserStore";
import { Input } from "../Input";
import { Berechtigung, type Berechtigungen } from "@thesis/rollen";
import { searchUser, type User } from "@thesis/auth";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from 'use-debounce';

interface SelectedUserCtrlProps <T extends Berechtigung>{
    berechtigung: T,
    berechtigungValue: Berechtigungen[T][],
    label: string,
    placeholder: string,
}

export function SelectedUserCtrl<T extends Berechtigung>(props: SelectedUserCtrlProps<T>) {
    
    const { label, ...rest } = props
    const setSelectedUser = useSelectedUserStore(store => store.setSelectedUser)
    const selectedUser = useSelectedUserStore(store => store.selectedUser)
    
    const { user } = use(userContext);
    if (user && selectedUser.length == 0) {
        setSelectedUser(() => [user])
    }

    function deleteLehrer(idx: number) {
        setSelectedUser(prev => {
            return prev.filter((_, i) => i !== idx)
        })
    }
        
    return <div>
        <label>{label}</label>
        
        <div className="flex flex-col gap-2">
            {
                selectedUser.map((_, idx) => {
                    return <div key={idx} className="flex gap-2">
                        <Autocomplete idx={idx} {...rest} />
                        <button onClick={() => deleteLehrer(idx)}>
                            <DeleteIcon />
                        </button>
                    </div>
                })
            }
        </div>
        
        <ButtonLight className="py-2 px-4 text-sm! mt-4 mb-8" onClick={() => {
            if (user) {
                setSelectedUser(prev => [...prev, user])
            }
        }}> 
            weiteren {label} hinzufügen
        </ButtonLight>
    </div>
}

type AutocompleteProps<T extends Berechtigung> = {
    idx: number
} & Omit<SelectedUserCtrlProps<T>, 'label'>

function Autocomplete<T extends Berechtigung>(props: AutocompleteProps<T>) {

    const { idx,  placeholder, ...rest } = props;
    const query = useSelectedUserStore(store => store.query)
    const setQuery = useSelectedUserStore(store => store.setQuery)
    const klassenlehrer = useSelectedUserStore(store => store.selectedUser.find((_, i) => i=== idx))
    const [isInputShown, setIsInputShown] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isInputShown) {
            inputRef.current?.focus();
        }
    }, [isInputShown]);


    return <div className="flex flex-col max-w-[360px] w-full relative">
        { 
            isInputShown ? 
                <Input 
                    ref={inputRef} 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    className="w-full! h-[40px]" 
                    placeholder={placeholder}
                    onClick={() => setIsInputShown(false)}
                />
                : <button 
                className="border-[1px] border-gray-100 h-[40px]"
                onClick={() => {
                    setIsInputShown(true)
                }}
            >{!klassenlehrer ? 'Keine Person ausgewählt' : `${klassenlehrer.vorname} ${klassenlehrer.nachname}`}</button>
        }
        
        {
            isInputShown && <UserSelectMenu idx={idx} setIsInputShown={setIsInputShown} {...rest} />
        }
    </div>
}

type UserSelectMenuProps<T extends Berechtigung> = {
    idx: number, setIsInputShown: (val: boolean) => void 
} & Omit<SelectedUserCtrlProps<T>, 'label' | 'placeholder'>

function UserSelectMenu<T extends Berechtigung>(props: UserSelectMenuProps<T>) {

    const { 
        idx, setIsInputShown, berechtigung, berechtigungValue
    } = props;
    const query = useSelectedUserStore(store => store.query)
    const setSelectedUser = useSelectedUserStore(store => store.setSelectedUser)
    const [debouncedQuery] = useDebounce(query, 400);

    const { isPending, data: response } = useQuery({
        queryKey: ['users', berechtigung, berechtigungValue, debouncedQuery],
        queryFn: ({ queryKey }) => {
        const [_key, berechtigung, berechtigungValue, query] = queryKey;
        const castedBerechtigung = berechtigung as Berechtigung
        return searchUser(query as string, castedBerechtigung, berechtigungValue as Berechtigungen[typeof castedBerechtigung][]);
        }
    });

    if (isPending) {
        return;
    }

    if (!response) {
        return <p>Ein Fehler beim Laden ist aufgetreten.</p>;
    }

    function handleClick(user: User) {
        setSelectedUser((prev) => {
            return prev.map((item, i) => {
                if (i !== idx) {
                    return item;
                }
                return user;
            })
        })
        setIsInputShown(false)
    }

    return <div className="w-full max-w-[360px] bg-white overflow-auto max-h-[480px] absolute top-[42px] left-0 border-[1px] rounded-lg border-gray-100 z-100">
        <ul>
            {
                response.users.map((user) => {
                    return <li key={user.id} onClick={() => handleClick(user)} className="py-2 px-4 hover:bg-gray-100 cursor-pointer">{user.vorname} {user.nachname}</li>
                })
            }
        </ul>
    </div>
}