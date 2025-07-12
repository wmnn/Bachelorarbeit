import { ANWESENHEITEN, type Anwesenheitsstatus, Anwesenheitstyp, updateStatus } from "@thesis/anwesenheiten"
import { DialogWithButtons } from "../dialog/DialogWithButtons"
import { Input } from "../Input"
import { AnwesenheitsstatusSelect } from "./AnwesenheitsstatusSelect"
import { useSchuelerStore } from "../schueler/SchuelerStore"
import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { SCHUELER_QUERY_KEY } from "@/reactQueryKeys"
import { useAnwesenheiten } from "./useUnterrichtAnwesenheiten"

export const AnwesenheitsstatusDialog = ({
    closeDialog,
    initial,
    typ,
    schuelerId
}: { 
    closeDialog: () => void 
    initial: Anwesenheitsstatus
    typ: Anwesenheitstyp
    schuelerId: number
}) => {

    const heute = new Date().toISOString().split('T')[0];
    const [selected, setSelected] = useState(ANWESENHEITEN[0]);
    const [startDatum, setStartDatum] = useState(heute);
    const [endDatum, setEndDatum] = useState(heute);
    const schueler = useSchuelerStore(store => store.getSchueler(schuelerId))
    const { invalidate } = useAnwesenheiten(schuelerId, typ)
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!schueler) {
            return;
        }
        setSelected(getInitialAnwesenheit())

    }, [schueler])

    function getInitialAnwesenheit() {
        if (initial) {
            return initial
        }
        if (typ === Anwesenheitstyp.GANZTAG) {
            return schueler?.heutigerGanztagAnwesenheitsstatus ?? ANWESENHEITEN[0]
        } else {
            return schueler?.heutigerSchultagAnwesenheitsstatus ?? ANWESENHEITEN[0]
        }   
    }

    async function handleSubmit() {
        const res = await updateStatus(schuelerId, selected, typ, startDatum, endDatum)
        const isTodayInDateRange = heute >= startDatum && heute <= endDatum;

        if (isTodayInDateRange) {
            queryClient.invalidateQueries({ queryKey: [SCHUELER_QUERY_KEY]})
        }
    
        if (res?.success) {
            invalidate()
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