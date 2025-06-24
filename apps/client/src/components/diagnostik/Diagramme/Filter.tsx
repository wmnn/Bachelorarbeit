import { ButtonLight } from "@/components/ButtonLight"
import { useSchuelerStore } from "@/components/schueler/SchuelerStore"
import { useAllSchueler } from "@/components/schueler/useSchueler"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Row } from "@thesis/diagnostik"
import type { Dispatch } from "react"

export const Filter = ({ initialData, data, setData}: {initialData: Row[], data: Row[], setData: Dispatch<React.SetStateAction<Row[]>>}) => {
    
    useAllSchueler()
    const schueler = useSchuelerStore(store => store.schueler)
    
    return <div>

        <DropdownMenu>
                <DropdownMenuTrigger className="border-[1px] px-2 rounded-lg py-[6px] hover:bg-gray-200">Filtern</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <label>
                        Auswertungsgruppen
                    </label>
                    <ButtonLight className="text-sm">
                        Auswertungsgruppen bearbeiten
                    </ButtonLight>
                    <hr className="my-4"/>

                    {
                        initialData?.map(schuelerRow => {
                            const schuelerData = schueler.find(item => item.id == schuelerRow.schuelerId)
                            const isInside = data.some(item => {
                                    return item.schuelerId == schuelerRow.schuelerId && item.ergebnisse.length > 0
                            })
                            return <DropdownMenuItem key={schuelerRow.schuelerId} className="cursor-pointer" onClick={() => {
                                if (isInside) {
                                    setData(data.filter(item => item.schuelerId !== schuelerRow.schuelerId))
                                    return;
                                }
                                const insertedData = initialData.find(item => item.schuelerId == schuelerRow.schuelerId)
                                if (insertedData && insertedData.ergebnisse.length > 0) {
                                    setData([...data, insertedData])
                                }
                            }}>
                                <input type="checkbox" checked={isInside} />
                                    {schuelerData?.vorname} {schuelerData?.nachname}
                            </DropdownMenuItem>
                        })
                    }
                    {/* { props.schueler.map(schueler => {
                        return <DropdownMenuItem key={schueler.id} className="cursor-pointer" onClick={() => {
            
                        let newValue = !filteredShown[schueler.id ?? -1]     
                        setFilteredShown(prev => ({
                            ...prev,
                            [schueler.id ?? -1]: newValue
                        }))
            
                        if (newValue) {
                            setSchueler(prev => sort(selectedSortItem, [...prev, schueler]))
                        } else {
                            setSchueler(prev => sort(selectedSortItem, prev.filter(item => item.id !== schueler.id)))
                        }
                        }}>
                        <input type="checkbox" checked={filteredShown[schueler.id ?? -1] === true} />
                        {schueler.vorname} {schueler.nachname}
                        </DropdownMenuItem>
                    }) } */}
                </DropdownMenuContent>
              </DropdownMenu>


    </div>
}