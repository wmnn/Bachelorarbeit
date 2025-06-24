import { ButtonLight } from "@/components/ButtonLight"
import { useSchuelerStore } from "@/components/schueler/SchuelerStore"
import { useAllSchueler } from "@/components/schueler/useSchueler"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Diagnostik, Row } from "@thesis/diagnostik"
import { useState, type Dispatch } from "react"
import { AuswertungsgruppeDialog } from "../AuswertungsgruppeDialog"

export const Filter = ({ initialData, data, setData, diagnostik}: {
    initialData: Row[], 
    data: Row[], 
    setData: Dispatch<React.SetStateAction<Row[]>>,
    diagnostik: Diagnostik
}) => {
    
    useAllSchueler()
    const schueler = useSchuelerStore(store => store.schueler)
    const [isAuswertungsgruppeDialogShown, setIsAuswertungsgruppeDialogShown] = useState(false)
    
    function handleAuswertungsgruppeClick(gruppenName: string) {
        const gruppe = diagnostik?.auswertungsgruppen?.find(o => o.name == gruppenName)
        if (!gruppe) {
            return;
        }
        setData(initialData.filter(item => gruppe.schuelerIds.includes(item.schuelerId)))
    }

    function handleClick(isInside: boolean, schuelerId: number) {
        if (isInside) {
            setData(data.filter(item => item.schuelerId !== schuelerId))
            return;
        }
        const insertedData = initialData.find(item => item.schuelerId == schuelerId)
        if (insertedData && insertedData.ergebnisse.length > 0) {
            setData([...data, insertedData])
        }
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