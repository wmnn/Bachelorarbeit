import { addErgebnisse, ergebnisDatumGleich, type Ergebnis } from "@thesis/diagnostik";
import { DialogWithButtons } from "../dialog/DialogWithButtons";
import { Input } from "../Input";
import { useSchuelerStore } from "../schueler/SchuelerStore";
import { useAllSchueler } from "../schueler/useSchueler";
import { useKlasse } from "../shared/useKlasse";
import { useEffect, useState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { DIAGNOSTIKEN_QUERY_KEY } from "@/reactQueryKeys";
import { useErgebnisse } from "./useErgebnisse";

interface DiagnostikAddTestDialogProps {
  closeDialog: () => void,
  klasseId: number
  diagnostikId: number
}

export function DiagnostikAddTestDialog({ closeDialog, klasseId, diagnostikId }: DiagnostikAddTestDialogProps) {

    const klasseQuery = useKlasse(klasseId)
    useAllSchueler()
    const schueler = useSchuelerStore(store => store.schueler)
    const [ergebnisse, setErgebnisse] = useState<Ergebnis[]>([])
    const [datum, setDatum] = useState<any>(new Date().toISOString().split('T')[0])
    const queryClient = useQueryClient();

    const klasse = klasseQuery.data
    const schuelerIds = klasse?.versionen.reduce((prev, acc) => {
        return [...prev, ...(acc.schueler ?? [])]
    }, [] as number[])

    const ergebnisseQuery = useErgebnisse(diagnostikId)
    const data = ergebnisseQuery.data

    useEffect(() => {
        const neueErgebnisse = schuelerIds?.map(schuelerId => {
            const found = data.find(o => o.schuelerId == schuelerId)
            const ergebnis = found?.ergebnisse.find(o => ergebnisDatumGleich(o, datum))
            if (!ergebnis) {
                return {
                    schuelerId,
                    ergebnis: ''
                }
            }
            return {
                schuelerId,
                ergebnis: ergebnis.ergebnis
            }
        });

        if (neueErgebnisse !== ergebnisse) {
            setErgebnisse(neueErgebnisse ?? []);
        }
    }, [klasse, data, datum])

    if (klasseQuery.isPending) {
        return <p>...Loading</p>
    }
    

    if (!klasse) {
        return <p>Ein Fehler ist aufgetreten.</p>
    }

    async function handleSubmit() {
        const res = await addErgebnisse(ergebnisse, `${diagnostikId}`, datum)
        alert(JSON.stringify(res.message))
        if (res.success) {
            queryClient.invalidateQueries({
                queryKey: [DIAGNOSTIKEN_QUERY_KEY + 'data', diagnostikId],
            });
        }
        closeDialog()
    }

    return <DialogWithButtons className="overflow-auto! p-8" 
        closeDialog={closeDialog} 
        onSubmit={handleSubmit} 
        submitButtonText="Ergebnisse hinzufügen"
    >
        <ul>

        <div className="flex gap-4 items-center">
            <label>
                Datum
            </label>
            <Input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />

        </div>
        
        <div className="flex justify-between my-4">
            <label>
                Name
            </label>
            <label>
                Ergebnis
            </label>
        </div>
        
        {
            ergebnisse?.map((ergebnis, idx) => {
                const entry = schueler.find(schueler => schueler.id === ergebnis.schuelerId)
                return <li className="flex justify-between">
                    <p>{entry ? `${entry.vorname} ${entry.nachname}` : ergebnis.schuelerId}</p>
                    <Input value={ergebnis.ergebnis} onChange={(e) => {
                        setErgebnisse(prev => prev.map((item, i) => {
                            if (i !== idx) {
                                return item
                            }
                            return {
                                ...item,
                                ergebnis: e.target.value
                            }
                        }))
                    }}/>
                </li>
            })
        }
        </ul>

    </DialogWithButtons>
}