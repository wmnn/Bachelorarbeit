import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Anwesenheiten, ANWESENHEITEN, AnwesenheitenLabels, AnwesenheitTyp, updateStatus } from '@thesis/anwesenheiten'
import { useEffect, useState } from "react";
import { useSchuelerStore } from "../schueler/SchuelerStore";
import type { Schueler } from "@thesis/schueler";

export function AnwesenheitsstatusSelect ({ schuelerId, typ }: { schuelerId: number, typ: AnwesenheitTyp }) {

    const [_, setIsLoading] = useState(false);
 
    const schueler = useSchuelerStore(store => store.getSchueler(schuelerId))
    const setSingleSchueler = useSchuelerStore(store => store.setSingleSchueler)
    const [selected, setSelected] = useState(getInitialAnwesenheit());

    function getInitialAnwesenheit() {
        if (typ === AnwesenheitTyp.GANZTAG) {
            return schueler?.heutigerGanztagAnwesenheitsstatus ?? ANWESENHEITEN[0]
        } else {
            return schueler?.heutigerSchultagAnwesenheitsstatus ?? ANWESENHEITEN[0]
        }   
    }

    useEffect(() => {
        setSelected(getInitialAnwesenheit())
    }, [schueler?.heutigerGanztagAnwesenheitsstatus, schueler?.heutigerSchultagAnwesenheitsstatus])
    
    return <Select 
            value={`${selected}`}
            onValueChange={async (val) => {
               
                setSelected(parseInt(val))
                const datum = new Date().toISOString().split('T')[0]
                setIsLoading(true)
                const res = await updateStatus(schuelerId, parseInt(val) as Anwesenheiten, typ, datum)

                if (res?.success) {
                    if (typ === AnwesenheitTyp.GANZTAG) {
                        setSingleSchueler(schuelerId, {
                            ...schueler,
                            heutigerGanztagAnwesenheitsstatus: (parseInt(val) as Anwesenheiten)
                        } as Schueler)
                    } else {
                        setSingleSchueler(schuelerId, {
                            ...schueler,
                            heutigerSchultagAnwesenheitsstatus: (parseInt(val) as Anwesenheiten)
                        } as Schueler)
                    }
                }
                
                setIsLoading(false)
            }}
        >
            <SelectTrigger className="xl:w-[180px] w-min">
                <SelectValue placeholder="Keine Rolle"/>
            </SelectTrigger>
            <SelectContent>
                {
                    ANWESENHEITEN.map((val) => {
                        return <SelectItem key={val} value={`${val}`}>
                            {AnwesenheitenLabels[val]}
                        </SelectItem>                 
                    })
                }
            </SelectContent>
        </Select>    
    
}