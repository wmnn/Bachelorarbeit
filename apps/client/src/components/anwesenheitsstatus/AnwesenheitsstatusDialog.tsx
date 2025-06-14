import { ANWESENHEITEN, type Anwesenheiten, AnwesenheitTyp, updateStatus } from "@thesis/anwesenheiten"
import { DialogWithButtons } from "../dialog/DialogWithButtons"
import { Input } from "../Input"
import { AnwesenheitsstatusSelect } from "./AnwesenheitsstatusSelect"
import { useSchuelerStore } from "../schueler/SchuelerStore"
import { useState } from "react"
import type { Schueler } from "@thesis/schueler"

export const AnwesenheitsstatusDialog = ({
    closeDialog,
    initial,
    typ,
    schuelerId
}: { 
    closeDialog: () => void 
    initial: Anwesenheiten
    typ: AnwesenheitTyp
    schuelerId: number
}) => {

    const heute = new Date().toISOString().split('T')[0];
    const [selected, setSelected] = useState(getInitialAnwesenheit());
    const [startDatum, setStartDatum] = useState(heute);
    const [endDatum, setEndDatum] = useState(heute);
    const setSingleSchueler = useSchuelerStore(store => store.setSingleSchueler)
    const schueler = useSchuelerStore(store => store.getSchueler(schuelerId))

    // useEffect(() => {
    //         setSelected(getInitialAnwesenheit())
    //     }, [schueler?.heutigerGanztagAnwesenheitsstatus, schueler?.heutigerSchultagAnwesenheitsstatus])

    function getInitialAnwesenheit() {
        if (initial) {
            return initial
        }
        if (typ === AnwesenheitTyp.GANZTAG) {
            return schueler?.heutigerGanztagAnwesenheitsstatus ?? ANWESENHEITEN[0]
        } else {
            return schueler?.heutigerSchultagAnwesenheitsstatus ?? ANWESENHEITEN[0]
        }   
    }

    async function handleSubmit() {
        const res = await updateStatus(schuelerId, selected, typ, startDatum, endDatum)
        const isTodayInDateRange = heute >= startDatum && heute <= endDatum;
        if (res?.success && isTodayInDateRange) {
            if (typ === AnwesenheitTyp.GANZTAG) {
                setSingleSchueler(schuelerId, {
                    ...schueler as Schueler,
                    heutigerGanztagAnwesenheitsstatus: (selected)
                })
            } else {
                setSingleSchueler(schuelerId, {
                    ...schueler as Schueler,
                    heutigerSchultagAnwesenheitsstatus: (selected)
                })
            }
        }
        closeDialog()
    }

    return <DialogWithButtons 
        submitButtonText="Speichern"
        onSubmit={handleSubmit}
        closeDialog={closeDialog}
    >

        <div className="flex flex-col gap-8 w-full min-h-[240px] pt-2">

            <AnwesenheitsstatusSelect
                onValueChange={setSelected}
                selected={selected}
            />  

            <div className="flex flex-col">
                <label>
                    Startdatum
                </label>
                <Input type="date" value={startDatum} onChange={(e) => setStartDatum(e.target.value)}/>
            </div>
            

            <div className="flex flex-col">
                <label>
                    Enddatum
                </label>
                <Input type="date" value={endDatum} onChange={(e) => setEndDatum(e.target.value)}/>
            </div>
            
        </div>
        
    
    </DialogWithButtons>
}