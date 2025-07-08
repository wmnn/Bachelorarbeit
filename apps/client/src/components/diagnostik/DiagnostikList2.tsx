import { useEffect, useState } from "react"
import { List } from "../List"
import { DiagnostikErstellenDialog } from "./DiagnostikErstellenDialog"
import { type Diagnostik } from "@thesis/diagnostik"
import { SortOption, SortSelect } from "../shared/SortSelect"
import { Input } from "../Input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"

const DiagnostikSortLabels: Record<SortOption, string> = {
    [SortOption.AUFSTEIGEND]: 'Name aufsteigend',
    [SortOption.ABSTEIGEND]: 'Name absteigend'
}
function sort(sortOption: SortOption, data: Diagnostik[]) {
    if (sortOption === SortOption.AUFSTEIGEND) {
        return ([...data].sort((a, b) => {
            return b.name.localeCompare(a.name)
        }))
    } else {
        return ([...data].sort((a, b) => {
            return a.name.localeCompare(b.name)
        }))
    }
}

type DiagnostikList2Props = {
  initialDiagnostiken: Diagnostik[];
  children: (props: { diagnostiken: Diagnostik[] }) => React.ReactNode;
};
export function DiagnostikList2({ initialDiagnostiken, children }: DiagnostikList2Props) {
    const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)
    const [sortOption, setSortOption] = useState<SortOption>(SortOption.ABSTEIGEND)
    const [diagnostiken, setDiagnostiken] = useState<Diagnostik[]>([]);

    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        setDiagnostiken(sort(sortOption, initialDiagnostiken))
    }, [initialDiagnostiken])

    
    function handleSortChange(val: SortOption) {
        setSortOption(val)
        setDiagnostiken(sort(val, diagnostiken))
    }

    const header = <div>
        <div className='flex justify-end mb-8'>
            <div className='flex flex-col md:flex-row gap-2'>
                <Input value={searchQuery} placeholder="Suche" onChange={(e) => {
                    const val = e.target.value
                    setSearchQuery(val)
                    setDiagnostiken(_ => sort(sortOption, (initialDiagnostiken ?? []).filter(item => item.name.includes(val))))
                }}/>
                <SortSelect selectedSortItem={sortOption} handleSortChange={handleSortChange} labels={DiagnostikSortLabels}/>
        
                <DiagnostikFilterButton sortOption={sortOption} initialData={initialDiagnostiken} setDiagnostiken={setDiagnostiken} />
            </div>
        </div>
        
    </div>

    return <List 
        createButonLabel="Diagnostik erstellen"
        setIsCreateDialogShown={setIsCreateDialogShown}
        className="mt-8 divide-none"
        header={header}
    >
        { isCreateDialogShown && <DiagnostikErstellenDialog closeDialog={() => setIsCreateDialogShown(false)}/>}
        <div className="my-2 flex flex-col gap-2">
            {typeof children === 'function'
            ? children({ diagnostiken })
            : children}
        </div>
    </List> 
}

interface DiagnostikFilterButtonProps {
    initialData: Diagnostik[],
    setDiagnostiken: React.Dispatch<React.SetStateAction<Diagnostik[]>>,
    sortOption: SortOption
}
const DiagnostikFilterButton = ({ initialData, setDiagnostiken, sortOption }: DiagnostikFilterButtonProps) => {
    
    const [filteredKategorien, setFilteredKategorien] = useState<string[]>([])
    const [filteredKlassenstufen, setFilteredKlassenstufen] = useState<string[]>([])
    const kategorien = new Set(
        initialData.flatMap(item => item.kategorien ?? [])
    );

    const klassenStufen = new Set(
        initialData.flatMap(item => item.geeigneteKlassen ?? [])
    );

    function handleClickOnKlassenstufe(klassenstufe: string) {
        let filtered = []
        if (filteredKlassenstufen.includes(klassenstufe)) {
            /*  
                Versteckte wieder anzeigen durch initialData.
                Wenn eine Diagnostik keine gefilterte Klassenstufe enthält, wird sie angezeigt.
            */
            filtered = filteredKlassenstufen.filter(item => item !== klassenstufe)
        } else {
            /*  
                Aktuelle Diagnostiken werden gefiltert. Wenn eine Diagnostik nur die Klassenstufe enthält, die
                angeklickt wurde, dann wird sie versteckt.
            */
            filtered = filteredKlassenstufen.includes(klassenstufe) ? filteredKlassenstufen : [...filteredKlassenstufen, klassenstufe]
        }
        filtern(filtered, filteredKategorien)
        setFilteredKlassenstufen(filtered);
    }
    function filtern(filteredKlassenstufen: string[], filteredKategorien: string[]) {
        // Wenn eine Diagnostik eine von der restlichen Stufen hat, wird sie angezeigt.
        const shownKlassenstufen = Array.from(klassenStufen).filter(item => !filteredKlassenstufen.includes(item))
        const shownKategorien = Array.from(kategorien).filter(item => !filteredKategorien.includes(item))

        // Anwendung der Filterlogik
        const filteredTmp = initialData.filter(item => {
            const isSomeShownKlassenstufeInside = (item.geeigneteKlassen ?? []).some(stufe => shownKlassenstufen.includes(stufe));
            const isSomeShownKategorieInside = (item.kategorien ?? []).some(kat => shownKategorien.includes(kat));
            return isSomeShownKlassenstufeInside || isSomeShownKategorieInside;
        });

        setDiagnostiken(_ => sort(sortOption, filteredTmp));
    }
    function handleClickOnKategorie(kategorie: string) {
        let filtered = []
        if (filteredKategorien.includes(kategorie)) {
            filtered = filteredKategorien.filter(item => item !== kategorie)
        } else {
            filtered = filteredKategorien.includes(kategorie) ? filteredKategorien : [...filteredKategorien, kategorie]
        }
        filtern(filteredKlassenstufen, filtered)
        setFilteredKategorien(filtered);
    }
    return <DropdownMenu>
        <DropdownMenuTrigger className="border-[1px] px-2 rounded-lg py-[6px] hover:bg-gray-200">Filtern</DropdownMenuTrigger>
        <DropdownMenuContent>
            <label>
                Klassenstufen
            </label>
            
            {
                Array.from(klassenStufen).map((klassenStufe, idx) => <DropdownMenuItem 
                    key={idx} 
                    className="cursor-pointer" 
                    onClick={() => handleClickOnKlassenstufe(klassenStufe)}
                >
                    <input type="checkbox" checked={!filteredKlassenstufen.includes(klassenStufe)} /> {klassenStufe}
                </DropdownMenuItem>)
            }
            {
                filteredKlassenstufen.length !== klassenStufen.size ? <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => {
                        const newVal = Array.from(klassenStufen)
                        setFilteredKlassenstufen(newVal)
                        filtern(newVal, filteredKategorien)
                    }}
                >
                    Alle entfernen
                </DropdownMenuItem> : <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => {
                        setFilteredKlassenstufen([])
                        filtern([], filteredKategorien)
                    }}
                >
                    Alle anzeigen
                </DropdownMenuItem>
            }

            <hr className="my-2" />
            <label>
                Kategorien
            </label>
            {
                Array.from(kategorien).map((kategorie, idx) => <DropdownMenuItem 
                    key={idx} 
                    className="cursor-pointer"
                    onClick={() => handleClickOnKategorie(kategorie)}
                >
                    <input type="checkbox" checked={!filteredKategorien.includes(kategorie)} onChange={() => {}}/> {kategorie}
                </DropdownMenuItem>)
            }
            {
                filteredKategorien.length !== kategorien.size ? <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => {
                        const newVal = Array.from(kategorien)
                        setFilteredKategorien(newVal)
                        filtern(filteredKlassenstufen, newVal)
                    }}
                >
                    Alle entfernen
                </DropdownMenuItem> : <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => {
                        setFilteredKategorien([])
                        filtern(filteredKlassenstufen, [])
                    }}
                >
                    Alle anzeigen
                </DropdownMenuItem>
            }
        </DropdownMenuContent>
    </DropdownMenu>
}