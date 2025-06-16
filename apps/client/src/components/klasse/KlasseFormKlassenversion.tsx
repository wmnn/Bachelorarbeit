import type { KlassenVersion } from "@thesis/schule";
import { Input } from "../Input";
import type { Schueler } from "@thesis/schueler";
import { Autocomplete } from "../shared/Autocomplete";
import { useState } from "react";
import { ButtonLight } from "../ButtonLight";
import { useSchuelerStore } from "../schueler/SchuelerStore";

export function KlasseErstellenDialogKlasse({ klasse, setKlasse }: { 
    klasse: KlassenVersion, 
    setKlasse: (updatedKlasse: KlassenVersion) => void
}) {

    const [query, setQuery] = useState('')
    const [queryResults, setQueryResults] = useState<Schueler[]>([])
    const schueler = useSchuelerStore(store => store.schueler)

    function setZusatz(val: string) {
        setKlasse({
            ...klasse,
            zusatz: val
        })
    }
    function setKlassenStufe(val: string) {
        setKlasse({
            ...klasse,
            klassenstufe: val
        })
    }

    function handleSchuelerSelection(idx: number, schuelerId: number) {

        setKlasse({
            ...klasse,
            schueler: klasse?.schueler?.map((item, i) => {
                if (i !== idx) {
                    return item
                }
                return schuelerId
            }) ?? []
        })

    }

    function addSchueler() {
        setKlasse({
            ...klasse,
            schueler: [...klasse.schueler ?? [], -1]
        })
    }

    function getLabel(idx: number): string {
        if (idx === -1) {
            return 'Kein Schüler ausgewählt'
        }
        const found = schueler.find((item) => item.id == idx)
        if (found) {
            return `${found.vorname} ${found.nachname}`
        }
        return 'Ein Fehler ist aufgetreten'
    }

    function handleQueryChange(newVal: string) {
        const filteredUsers = schueler
            .filter((item) => {
            console.log(item, newVal, `${item.vorname} ${item.nachname}`.includes(newVal))
            return `${item.vorname} ${item.nachname}`.includes(newVal)
        })

        setQueryResults(
            filteredUsers.map(schueler => schueler?.id) as any ?? []
        )
        setQuery(newVal)
    }

    return <>
        <div className="flex gap-2">
            <div className="flex flex-col">
                <label>Klassenstufe</label>
                <Input value={klasse.klassenstufe ?? ''} onChange={(e) => setKlassenStufe(e.target.value)}/>
            </div>
            <div className="flex flex-col">
                <label>Zusatz</label>
                <Input value={klasse.zusatz ?? ''} onChange={(e) => {
                    setZusatz(e.target.value)
                }}/>
            </div>
        </div>

        <div className="my-8 gap-2 flex flex-col">
            <label>
                Schüler
            </label>
            {
                klasse.schueler?.map((schueler, idx) => {
                    return <Autocomplete 
                        key={idx}
                        query={query}
                        setQuery={handleQueryChange}
                        selected={schueler}
                        setSelected={(selected: any) => handleSchuelerSelection(idx, selected)}
                        getLabel={getLabel}
                        placeholder="Max Mustermann"
                        queryResults={queryResults as any}
                    />
                })
            }
            <ButtonLight onClick={() => addSchueler()}>
                Schüler hinzufügen
            </ButtonLight>

        </div>
        

        {/* <SchuelerSelectionList handleSelection={handleSchuelerSelection} selectedIds={klasse.schueler ?? []}/>      */}
    </>
}