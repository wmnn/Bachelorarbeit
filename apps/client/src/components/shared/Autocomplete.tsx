import { useEffect, useRef, useState } from "react";
import { Input } from "../Input";

type AutocompleteProps<T> = {
    query: string,
    setQuery: (val : string) => void,
    placeholder: string,
    getLabel: (val: any) => string,
    selected: T,
    setSelected: any,
    queryResults: T[]
}

export function Autocomplete<T>(props: AutocompleteProps<T>) {

    const { query, setQuery, getLabel, placeholder, selected, setSelected, ...rest } = props;

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
                    onChange={(e: any) => setQuery(e.target.value)} 
                    className="w-full! h-[40px]" 
                    placeholder={placeholder}
                    onClick={() => setIsInputShown(false)}
                />
                : <button 
                className="border-[1px] border-gray-100 h-[40px]"
                onClick={() => {
                    setIsInputShown(true)
                    setQuery('')
                }}
            >{getLabel(selected)}</button>
        }
        
        {
            isInputShown && <UserSelectMenu 
                placeholder={""} 
                selected={undefined}
                setIsInputShown={setIsInputShown}
                getLabel={getLabel}
                setSelected={setSelected}
                {...rest}            
            />
        }
    </div>
}

type UserSelectMenuProps<T> = {
    setIsInputShown: (val: boolean) => void,
    setSelected: any,
} & Omit<AutocompleteProps<T>, 'query' | 'setQuery'>

function UserSelectMenu<T>(props: UserSelectMenuProps<T>) {

    const { 
        setIsInputShown, setSelected, queryResults, getLabel
    } = props;
   

    function handleClick(val : T) {
        setSelected(val)
        setIsInputShown(false)
    }

    return <div className="w-full max-w-[360px] bg-white overflow-auto max-h-[480px] absolute top-[42px] left-0 border-[1px] rounded-lg border-gray-100 z-100">
        <ul>
            {
                queryResults.map((res, idx) => {
                    return <li key={idx} onClick={() => handleClick(res)} className="py-2 px-4 hover:bg-gray-100 cursor-pointer">{getLabel(res)}</li>
                })
            }
        </ul>
    </div>
}