import { Anwesenheitsstatus, ANWESENHEITEN, Anwesenheitstyp, updateStatus } from '@thesis/anwesenheiten'
import { useEffect, useState } from "react";
import { useSchuelerStore } from "../schueler/SchuelerStore";
import { AnwesenheitsstatusSelect } from "./AnwesenheitsstatusSelect";
import { AnwesenheitsstatusDialog } from './AnwesenheitsstatusDialog';
import { useQueryClient } from '@tanstack/react-query';
import { SCHUELER_QUERY_KEY } from '@/reactQueryKeys';

interface AnwesenheitsstatusSchuelerListSelectProps { 
    schuelerId: number, 
    typ: Anwesenheitstyp 
}
export function AnwesenheitsstatusSchuelerListSelect ({ schuelerId, typ }: AnwesenheitsstatusSchuelerListSelectProps) {

    const [_, setIsLoading] = useState(false);
 
    const schueler = useSchuelerStore(store => store.getSchueler(schuelerId))
    const [selected, setSelected] = useState(getInitialAnwesenheit());
    const startDatum = new Date().toISOString().split('T')[0];
    const queryClient = useQueryClient()
    
    const [isFehltEntschuldigtDialogShown, setIsFehltEntschuldigtDialogShown] = useState(false);

    function getInitialAnwesenheit() {
        if (typ === Anwesenheitstyp.GANZTAG) {
            return schueler?.heutigerGanztagAnwesenheitsstatus ?? ANWESENHEITEN[0]
        } else {
            return schueler?.heutigerSchultagAnwesenheitsstatus ?? ANWESENHEITEN[0]
        }   
    }

    async function onValueChange(status: Anwesenheitsstatus) {
        setIsLoading(true)
        if (status == Anwesenheitsstatus.FEHLT_ENTSCHULDIGT) {
            setIsFehltEntschuldigtDialogShown(true);
            return;
        }
        
        const res = await updateStatus(schuelerId, status, typ, startDatum, startDatum)

        if (res?.success) {
            setSelected(status)
            queryClient.invalidateQueries({ queryKey: [SCHUELER_QUERY_KEY]})
        }
        
        setIsLoading(false)
    }

    useEffect(() => {
        setSelected(getInitialAnwesenheit())
    }, [schueler?.heutigerGanztagAnwesenheitsstatus, schueler?.heutigerSchultagAnwesenheitsstatus, schueler])
    

    return <>

        {
            isFehltEntschuldigtDialogShown && <AnwesenheitsstatusDialog 
                closeDialog={() => setIsFehltEntschuldigtDialogShown(false)}
                initial={Anwesenheitsstatus.FEHLT_ENTSCHULDIGT}
                typ={typ}
                schuelerId={schuelerId}
            />
        }
        <AnwesenheitsstatusSelect 
            selected={selected}
            onValueChange={onValueChange}        
        />
    </>
    
}