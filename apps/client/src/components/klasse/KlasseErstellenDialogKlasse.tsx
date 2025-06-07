import type { KlassenVersion } from "@thesis/schule";
import { Input } from "../Input";
import type { SchuelerSimple } from "@thesis/schueler";
import { useSchuelerStore } from "../schueler/SchuelerStore";

export function KlasseErstellenDialogKlasse({ klasse, setKlasse }: { 
    klasse: KlassenVersion, 
    setKlasse: (updatedKlasse: KlassenVersion) => void
}) {

    const schueler = useSchuelerStore((state) => state.schueler)

    function setZusatz(val: string) {
        setKlasse({
            ...klasse,
            zusatz: val
        })
    }
    function setKlassenStufe(val: number) {
        setKlasse({
            ...klasse,
            klassenstufe: val
        })
    }

    function handleSchuelerSelection(element: SchuelerSimple) {
        const newId = element.id ?? -1
        if (!klasse.schueler?.find(id => id === (newId ?? -1))) {
            setKlasse({
                ...klasse,
                schueler: [...klasse.schueler ?? [], element.id ?? -1]
            })
        } else {
            const filtered = klasse.schueler?.filter(id => id !== element.id)
            setKlasse({
                ...klasse,
                schueler: filtered
            })
        }
    }

    return <>
        <div className="flex gap-2">
            <div className="flex flex-col">
                <label>Klassenstufe</label>
                <Input value={klasse.klassenstufe} onChange={(e) => {
                    const parsed = parseInt(e.target.value)
                    setKlassenStufe(parsed)
                }}/>
            </div>
            <div className="flex flex-col">
                <label>Zusatz</label>
                <Input value={klasse.zusatz} onChange={(e) => {
                    setZusatz(e.target.value)
                }}/>
            </div>
        </div>
    
    
        <label>Schüler</label>
        <ul className="flex flex-col">
            {
                schueler.map((element) => <>
                
                <li>
                    <input
                        type="checkbox"
                        checked={klasse.schueler?.find(id => id === (element.id ?? -1)) ? true : false}
                    />

                    <button onClick={() => handleSchuelerSelection(element)}>
                        {JSON.stringify(element)}
                    </button>

                </li>
                </>
                
                )
            }
        </ul>       
    </>
}