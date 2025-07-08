import { Erhebungszeitraum, getMindeststandard, type DiagnostikenSchuelerData } from "@thesis/diagnostik";
import { useEffect, useState } from "react";
import { SchuelerResultBalkenDiagramm } from "./SchuelerResultBalkenDiagramm";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DateFilter } from "./DateFilter";
import { filterErgebnisse } from "./util";

export interface SchuelerBalkenDiagrammProps {
    data: DiagnostikenSchuelerData[]
}
export const SchuelerBalkenDiagramm = ({ data: diagnostiken }: SchuelerBalkenDiagrammProps) => {

    return <ul className='flex flex-col gap-8 w-full'>
        {
            diagnostiken.map(diagnostik => <DiagnostikListItem diagnostik={diagnostik} />)
        }
    </ul>
}

const DiagnostikListItem = ({ diagnostik: initialData }: {diagnostik : DiagnostikenSchuelerData}) => {

    const [diagnostik, setDiagnostiken] = useState(initialData)
    const [minDate, setMinDate] = useState(undefined)
    const [maxDate, setMaxDate] = useState(undefined)

    useEffect(() => {
        setDiagnostiken(applyDateFilter(initialData))
    }, [initialData, minDate, maxDate])

    function applyDateFilter(diagnostik: DiagnostikenSchuelerData) {
        return ({
            ...diagnostik,
            ergebnisse: filterErgebnisse(diagnostik.ergebnisse ?? [], diagnostik.erhebungszeitraum ?? Erhebungszeitraum.TAG, maxDate, minDate)
        })
    }

    if ((diagnostik.ergebnisse ?? []).length == 0) {
        return;
    }
    return <li className='border-black border-[1px] rounded-xl p-4 flex flex-col gap-4'>

        <div className="flex justify-between items-center">
            <h2>Diagnostik: {diagnostik.name}</h2>
            <DropdownMenu>
                <DropdownMenuTrigger className="border-[1px] px-2 rounded-lg py-[6px] hover:bg-gray-200">Filtern</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <div className="flex flex-col gap-2">
                        <DateFilter minDate={minDate} maxDate={maxDate} setMinDate={setMinDate} setMaxDate={setMaxDate} erhebungszeitraum={diagnostik.erhebungszeitraum}/>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className='flex gap-2'>
            {
                diagnostik.ergebnisse && diagnostik.ergebnisse.map(row => {
                return <>
                    {
                    row.ergebnisse.map(ergebnis => {
                        return <SchuelerResultBalkenDiagramm  
                            obereGrenze={parseInt(`${diagnostik.obereGrenze ?? -1}`)}
                            untereGrenze={parseInt(`${diagnostik.untereGrenze ?? -1}`)}
                            mindeststandard={Number(getMindeststandard(diagnostik) ?? -1)}  
                            ergebnis={parseInt(ergebnis.ergebnis)}
                            label={ergebnis.datum}   
                        />
                    })
                    }
                </>
                }) 
            }
        </div>
    </li>
}