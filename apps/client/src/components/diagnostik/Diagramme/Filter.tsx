import { ButtonLight } from "@/components/ButtonLight"
import { useSchuelerStore } from "@/components/schueler/SchuelerStore"
import { useAllSchueler } from "@/components/schueler/useSchueler"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Erhebungszeitraum, type Diagnostik, type Row } from "@thesis/diagnostik"
import { useEffect, useState, type Dispatch } from "react"
import { AuswertungsgruppeDialog } from "../AuswertungsgruppeDialog"
import { DateFilter } from "./DateFilter"
import { filterErgebnisse } from "./util"

export const Filter = ({ initialData, data, setData, diagnostik}: {
    initialData: Row[], 
    data: Row[], 
    setData: Dispatch<React.SetStateAction<Row[]>>,
    diagnostik: Diagnostik
}) => {
    
    useAllSchueler(false)
    const schueler = useSchuelerStore(store => store.schueler)
    const [isAuswertungsgruppeDialogShown, setIsAuswertungsgruppeDialogShown] = useState(false)
    const [shownSchueler, setShownSchueler] = useState<number[]>(initialData.map(row => row.schuelerId))
    const [minDate, setMinDate] = useState<string | undefined>(undefined)
    const [maxDate, setMaxDate] = useState<string | undefined>(undefined)

    useEffect(() => {
        setData(applyDateFilter(applySchuelerFilter(initialData)))
    }, [shownSchueler, minDate, maxDate])

    function handleAuswertungsgruppeClick(gruppenName: string) {
        const gruppe = diagnostik?.auswertungsgruppen?.find(o => o.name == gruppenName)
        if (!gruppe) {
            return;
        }
        setShownSchueler(gruppe.schuelerIds)
    }

    function handleClick(isInside: boolean, schuelerId: number) {
        if (isInside) {
            return setShownSchueler(prev => prev.filter(item => item != schuelerId))
        }
        setShownSchueler(prev => [...prev, schuelerId])
    }

    function applySchuelerFilter(rows: Row[]) {
        return rows.filter(item => shownSchueler.includes(item.schuelerId))
    }

    function applyDateFilter(rows: Row[]) {
        return filterErgebnisse(rows, diagnostik.erhebungszeitraum ?? Erhebungszeitraum.TAG, minDate, maxDate)
    }


    return <div>

        {
            isAuswertungsgruppeDialogShown && <AuswertungsgruppeDialog 
                closeDialog={() => setIsAuswertungsgruppeDialogShown(false)}
                schuelerIds={initialData.map(item => item.schuelerId)}
                diagnostikId={`${diagnostik.id ?? -1}`}
            />
        }

        <DropdownMenu>
                <DropdownMenuTrigger className="border-[1px] px-2 rounded-lg py-[6px] hover:bg-gray-200">Filtern</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <div className="flex flex-col gap-2">
                        
                        <DateFilter minDate={minDate} maxDate={maxDate} setMinDate={setMinDate} setMaxDate={setMaxDate} erhebungszeitraum={diagnostik.erhebungszeitraum}/>

                        <label>
                            Auswertungsgruppen
                        </label>
                        {
                            diagnostik.auswertungsgruppen?.map((gruppe) => <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => handleAuswertungsgruppeClick(gruppe.name)}
                            >
                                {gruppe.name}
                            </DropdownMenuItem>)
                        }
                        <ButtonLight className="text-sm" onClick={() => setIsAuswertungsgruppeDialogShown(true)}>
                            Auswertungsgruppen bearbeiten
                        </ButtonLight>
                    </div>
                    

                    <hr className="my-4"/>

                    {
                        shownSchueler.length === 0 ? <DropdownMenuItem className="cursor-pointer" onClick={() => setShownSchueler(initialData.map(row => row.schuelerId))}>
                            Alle auswählen
                        </DropdownMenuItem> : <DropdownMenuItem className="cursor-pointer" onClick={() => setShownSchueler([])}>
                            Alle abwählen
                        </DropdownMenuItem>
                    }
             
                    {
                        initialData?.map(schuelerRow => {
                            const schuelerData = schueler.find(item => item.id == schuelerRow.schuelerId)
                            const isInside = data.some(item => {
                                    return item.schuelerId == schuelerRow.schuelerId && item.ergebnisse.length > 0
                            })
                            return <DropdownMenuItem key={schuelerRow.schuelerId} className="cursor-pointer" onClick={() => handleClick(isInside, schuelerRow.schuelerId)}>
                                <input type="checkbox" checked={isInside} />
                                    {schuelerData?.vorname} {schuelerData?.nachname}
                            </DropdownMenuItem>
                        })
                    }
                </DropdownMenuContent>
        </DropdownMenu>


    </div>
}