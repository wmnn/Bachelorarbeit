import { Anwesenheiten, ANWESENHEITEN, AnwesenheitTyp, updateStatus } from '@thesis/anwesenheiten'
import { useEffect, useState } from "react";
import { useSchuelerStore } from "../schueler/SchuelerStore";
import type { Schueler } from "@thesis/schueler";
import { AnwesenheitsstatusSelect } from "./AnwesenheitsstatusSelect";
import { AnwesenheitsstatusDialog } from './AnwesenheitsstatusDialog';

interface AnwesenheitsstatusSchuelerListSelectProps { 
    schuelerId: number, 
    typ: AnwesenheitTyp 
}
export function AnwesenheitsstatusSchuelerListSelect ({ schuelerId, typ }: AnwesenheitsstatusSchuelerListSelectProps) {

    const [_, setIsLoading] = useState(false);
 
    const schueler = useSchuelerStore(store => store.getSchueler(schuelerId))
    const setSingleSchueler = useSchuelerStore(store => store.setSingleSchueler)
    const [selected, setSelected] = useState(getInitialAnwesenheit());
    const startDatum = new Date().toISOString().split('T')[0];
    
    const [isFehltEntschuldigtDialogShown, setIsFehltEntschuldigtDialogShown] = useState(false);

    function getInitialAnwesenheit() {
        if (typ === AnwesenheitTyp.GANZTAG) {
            return schueler?.heutigerGanztagAnwesenheitsstatus ?? ANWESENHEITEN[0]
        } else {
            return schueler?.heutigerSchultagAnwesenheitsstatus ?? ANWESENHEITEN[0]
        }   
    }

    async function onValueChange(status: Anwesenheiten) {
        setIsLoading(true)
        if (status == Anwesenheiten.FEHLT_ENTSCHULDIGT) {
            setIsFehltEntschuldigtDialogShown(true);
            return;
        }
        
        const res = await updateStatus(schuelerId, status, typ, startDatum, startDatum)

        if (res?.success) {
            setSelected(status)
            if (typ === AnwesenheitTyp.GANZTAG) {
                setSingleSchueler(schuelerId, {
                    ...schueler,
                    heutigerGanztagAnwesenheitsstatus: (status)
                } as Schueler)
            } else {
                setSingleSchueler(schuelerId, {
                    ...schueler,
                    heutigerSchultagAnwesenheitsstatus: (status)
                } as Schueler)
            }
        }
        
        setIsLoading(false)
    }

    useEffect(() => {
        setSelected(getInitialAnwesenheit())
    }, [schueler?.heutigerGanztagAnwesenheitsstatus, schueler?.heutigerSchultagAnwesenheitsstatus])
    

    return <>

        {
            isFehltEntschuldigtDialogShown && <AnwesenheitsstatusDialog 
                closeDialog={() => setIsFehltEntschuldigtDialogShown(false)}
                initial={Anwesenheiten.FEHLT_ENTSCHULDIGT}
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