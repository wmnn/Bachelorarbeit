import { DeleteIcon } from "../icons/DeleteIcon";
import { ButtonLight } from "../ButtonLight";
import { use, useEffect, useRef, useState } from "react";
import { userContext } from "@/context/UserContext";
import { useKlassenStore } from "./KlassenStore";
import { Input } from "../Input";
import { Berechtigung, type Berechtigungen } from "@thesis/rollen";
import { searchUser, type User } from "@thesis/auth";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from 'use-debounce';

export function KlassenlehrerSelectCtrl() {
    
    const setKlassenlehrer = useKlassenStore(store => store.setKlassenlehrer)
    const klassenlehrer = useKlassenStore(store => store.klassenlehrer)
    
    const { user } = use(userContext);
    if (user && klassenlehrer.length == 0) {
        setKlassenlehrer(() => [user])
    }

    function deleteLehrer(idx: number) {
        setKlassenlehrer(prev => {
            return prev.filter((_, i) => i !== idx)
        })
    }
        
    return <div>
        <label>Klassenlehrer</label>
        
        <div className="flex flex-col gap-2">
            {
                klassenlehrer.map((_, idx) => {
                    return <div className="flex gap-2">
                        <KlassenlehrerAutocomplete idx={idx}
                        />
                        <button onClick={() => deleteLehrer(idx)}>
                            <DeleteIcon />
                        </button>
                    </div>
                })
            }
        </div>
        
        

        <ButtonLight className="py-2 px-4 text-sm! mt-4 mb-8" onClick={() => {
            if (user) {
                setKlassenlehrer(prev => [...prev, user])
            }
        }}> 
            weiteren Lehrer hinzufügen
        </ButtonLight>
    </div>
}
function KlassenlehrerAutocomplete({ idx }: { idx: number }) {

    const query = useKlassenStore(store => store.klassenlehrerSelectInput)
    const setQuery = useKlassenStore(store => store.setKlassenlehrerSelectInput)
    const klassenlehrer = useKlassenStore(store => store.klassenlehrer.find((_, i) => i=== idx))
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
                        placeholder="Lehrernamen eingeben"
                        onClick={() => setIsInputShown(false)}
                    />
                    : <button 
                    className="border-[1px] border-gray-100 h-[40px]"
                    onClick={() => {
                        setIsInputShown(true)
                    }}
                >{!klassenlehrer ? 'Kein Lehrer ausgewählt' : `${klassenlehrer.vorname} ${klassenlehrer.nachname}`}</button>
            }
        
        
        {
            isInputShown && <KlassenlehrerSelectMenu idx={idx} setIsInputShown={setIsInputShown} />
        }
    </div>
}
function KlassenlehrerSelectMenu({ idx, setIsInputShown }: { idx: number, setIsInputShown: (val: boolean) => void } ) {

    const query = useKlassenStore(store => store.klassenlehrerSelectInput)
    const setKlassenlehrer = useKlassenStore(store => store.setKlassenlehrer)
    const [debouncedQuery] = useDebounce(query, 400);

    const berechtigung = Berechtigung.KlasseRead as Berechtigung;
    const berechtigungValue: Berechtigungen[typeof berechtigung][] = ["alle", "eigene"]
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
        return <p>Ein Fehler beim Laden der Lehrer ist aufgetreten.</p>;
    }

    function handleClick(user: User) {
        setKlassenlehrer((prev) => {
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
                    return <li onClick={() => handleClick(user)} className="py-2 px-4 hover:bg-gray-100 cursor-pointer">{user.vorname} {user.nachname}</li>
                })
            }
        </ul>
    </div>
}