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
    
    function styleAnwesenheit(val: Anwesenheiten) {
        let color = ''
        if (val === Anwesenheiten.ANWESEND) {
            color = "bg-green-600"
        } else if (val === Anwesenheiten.FEHLT_ENTSCHULDIGT) {
            color = "bg-yellow-300"
        } else if (val === Anwesenheiten.FEHLT_UNENTSCHULDIGT) {
            color = "bg-red-600"
        } else {
            color = "bg-orange-400"
        }

        return <div className="flex justify-between w-full gap-8 items-center">
            <div className={`h-[8px] w-[8px] rounded-4xl ${color}`}/> 
            <div>
                {AnwesenheitenLabels[val]}
            </div>
        </div>
    }
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
                            {styleAnwesenheit(val)}
            
                            
                        </SelectItem>                 
                    })
                }
            </SelectContent>
        </Select>    
    
}