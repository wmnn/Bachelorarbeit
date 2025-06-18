import { useEffect, useRef, useState } from "react";
import { ButtonLight } from "../ButtonLight"
import { Input } from "../Input";
import { DiagnostikNumberFormat, DiagnostikTyp, sortFarbbereiche, type Diagnostik, type Farbbereich } from '@thesis/diagnostik'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useKlassen } from "../shared/useKlassen";
import { getTitle, type Klasse } from "@thesis/schule";
import { MultiInput } from "../shared/MultiInput";

interface DiagnostikFormProps {
  onAbort: () => void,
  onSubmit: (diagnostik: any) => void,
  submitButtonClassName?: string,
  cancelButtonClassName?: string,
  submitButtonText: string,
  initialDiagnostik?: any,
  title?: string
}

export const DiagnostikForm = (props: DiagnostikFormProps) => {
    const { submitButtonText, submitButtonClassName, cancelButtonClassName, onAbort, onSubmit } = props;
    const [diagnostik, setDiagnostik] = useState<Diagnostik>({
        name: '',
        beschreibung: '',
        erstellungsTyp: 'Vorlage',
        format: DiagnostikNumberFormat.NUMMER,
        klasseId: -1,
        vorlageId: -1,
        farbbereiche: [{
            hexFarbe: '#129600'
        }],
        speicherTyp: DiagnostikTyp.LAUFENDES_VERFAHREN
    })

    const klassenQuery = useKlassen()

    if (klassenQuery.isPending) {
        return <p>...Loading</p>
    }
    const klassen = (klassenQuery.data ?? []) as Klasse[]

    function setFarbbereiche(values: Farbbereich[]) {
        setDiagnostik(prev => ({
            ...prev,
            farbbereiche: values
        }))          
    }

    function handleVorlageButton() {
        const newDiagnostik: Diagnostik = {
            ...diagnostik,
            speicherTyp: DiagnostikTyp.VORLAGE
        }
        setDiagnostik(newDiagnostik)
        props.onSubmit(newDiagnostik)
    }
    
    return <form className="flex flex-col gap-2">
        <div className="flex justify-end">
            
            <button type="button" className="border-[1px] border-gray-200 px-2 py-2 rounded-lg hover:bg-black hover:text-white transition-all" onClick={() => handleVorlageButton()}>
                Als Vorlage speichern
            </button>
        </div>
        <div className="flex flex-col">
            <label>Name</label>
            <Input 
                value={diagnostik.name} 
                placeholder=""
                onChange={(e) => {
                    setDiagnostik(prev => ({
                        ...prev,
                        name: e.target.value
                    }))
                }}
            />
        </div>
        

        <label>Klasse (aktuelles Halbjahr)</label>
        <Select 
            value={`${diagnostik.klasseId}`}
            onValueChange={async (val: string) => {
                setDiagnostik(prev => ({
                    ...prev,
                    klasseId: parseInt(val)
                }))
            }}
        >
            <SelectTrigger className="xl:w-[200px] w-min">
                <SelectValue placeholder="Keine Klasse ausgewählt"/>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={`-1`}>
                    Keine Klasse
                </SelectItem>  
                {
                    klassen.map((klasse) => {
                        return <SelectItem key={klasse.id} value={`${klasse.id}`}>
                            {getTitle(klasse)}
                        </SelectItem>  
                    })
                }
            </SelectContent>
        </Select>  

        <label>Erstellungstyp</label>
        <Select 
            value={`${diagnostik.erstellungsTyp}`}
            onValueChange={async (val: Diagnostik['erstellungsTyp']) => {
                setDiagnostik(prev => ({
                    ...prev,
                    erstellungsTyp: val
                }))
            }}
        >
            <SelectTrigger className="xl:w-[200px] w-min">
                <SelectValue placeholder="Keine Rolle"/>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={`${'Vorlage' satisfies Diagnostik['erstellungsTyp']}`}>
                    Vorlage
                </SelectItem>     
                <SelectItem value={`${'benutzerdefiniert' satisfies Diagnostik['erstellungsTyp']}`}>
                    benutzerdefiniert
                </SelectItem>    
            </SelectContent>
        </Select>  

        {
            diagnostik.erstellungsTyp === 'Vorlage' && <div className="flex flex-col">
                <label>Vorlage</label>
                <Select 
                    value={diagnostik.vorlageId === -1 ? undefined : `${diagnostik.vorlageId}`}
                    onValueChange={async (val: Diagnostik['erstellungsTyp']) => {
                        setDiagnostik(prev => ({
                            ...prev,
                            erstellungsTyp: val
                        }))
                    }}
                >
                    <SelectTrigger className="xl:w-[200px] w-min">
                        <SelectValue placeholder="Keine Vorlage ausgewählt"/>
                    </SelectTrigger>
                    <SelectContent>
                         
                    </SelectContent>
                </Select> 
            </div>
        }

        {
            diagnostik.erstellungsTyp === 'benutzerdefiniert' && <div className="flex flex-col">
                <label>Beschreibung</label>
                <textarea className="border-[1px] border-gray-200 p-2" value={diagnostik.beschreibung} onChange={(e) => {
                    setDiagnostik(prev => ({
                        ...prev,
                        beschreibung: e.target.value
                    }))
                }}/>


                <label>Format</label>
                <Select 
                    value={`${diagnostik.format}`}
                    onValueChange={async (val: string) => {
                        setDiagnostik(prev => ({
                            ...prev,
                            format: val as DiagnostikNumberFormat
                        }))
                    }}
                >
                    <SelectTrigger className="xl:w-[200px] w-min">
                        <SelectValue placeholder="Kein Format ausgewählt"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={DiagnostikNumberFormat.NUMMER}>
                            Nummer
                        </SelectItem>    
                        <SelectItem value={DiagnostikNumberFormat.PROZENT}>
                            Prozent
                        </SelectItem>   
                    </SelectContent>
                </Select> 

                <label>Obere Grenze</label>
                <Input type="number" value={`${diagnostik.obereGrenze ?? ''}`}
                    onChange={(e) => {
                        setDiagnostik(prev => ({
                            ...prev,
                            obereGrenze: e.target.value
                        }));
                    }}
                />

                <label>Untere Grenze</label>
                <Input type="number" value={diagnostik.untereGrenze ?? ''}
                    onChange={(e) => {
                        setDiagnostik(prev => ({
                            ...prev,
                            untereGrenze: e.target.value
                        }));
                    }}
                />

                <label>Farb-Bereiche</label>
                <Farbbereiche 
                    farbbereiche={diagnostik.farbbereiche ?? []} 
                    setFarbbereiche={setFarbbereiche} 
                    obereGrenze={diagnostik.obereGrenze ?? 0}
                    untereGrenze={diagnostik.untereGrenze ?? 0}
                />

                <label>Dateien</label>

                <MultiInput
                    label="Geeignete Klassen"
                    values={diagnostik.geeigneteKlassen ?? []}
                    setValues={(values) => setDiagnostik((prev) => {
                        return {
                            ...prev,
                            geeigneteKlassen: values
                        }
                    })}
                    buttonLabel="Klasse"
                />

                <MultiInput
                    label="Kategorie"
                    values={diagnostik.kategorien ?? []}
                    setValues={(values) => setDiagnostik((prev) => {
                        return {
                            ...prev,
                            kategorien: values
                        }
                    })}
                />
            </div>
        }

        <div className="flex gap-2 py-8">
            <ButtonLight className={cancelButtonClassName} onClick={() => onAbort()}>
                Abbrechen
            </ButtonLight>
            <ButtonLight className={submitButtonClassName} onClick={() => onSubmit(diagnostik)}>
                {submitButtonText}
            </ButtonLight>
        </div>

    </form>
}

interface FarbbereicheProps {
    farbbereiche: Farbbereich[], 
    setFarbbereiche: (bereiche: Farbbereich[]) => void,
    obereGrenze: number | string,
    untereGrenze: number | string
}
const Farbbereiche = (props: FarbbereicheProps) => {
    const { farbbereiche, setFarbbereiche, obereGrenze, untereGrenze } = props

    const [lastUpdatedValue, setLastUpdatedValue] = useState<null | string>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    

    useEffect(() => {
        if (lastUpdatedValue !== null) {
            inputRefs.current.find(ref => ref?.value === lastUpdatedValue)?.focus()
        }
    }, [farbbereiche]);

    return <div className="flex flex-col xl:flex-row gap-8">
        <div>
            <FarbbereichSlider {...props} />
        </div>


        <div className="flex flex-col gap-2">
            {
                sortFarbbereiche(farbbereiche).map((bereich, idx) => <div key={idx} className="flex gap-2 items-center w-full justify-end">

                    {
                        farbbereiche.length -1 == idx && <label>Mindeststandard</label>
                    }

                    {
                        bereich.obereGrenze !== undefined && <Input type="number" 
                            ref={(el) => {
                                inputRefs.current[idx] = el;
                            }}
                            value={bereich.obereGrenze}
                            onChange={(e) => {
                                const value = e.target.value
                                setLastUpdatedValue(value);
                                setFarbbereiche(farbbereiche.map((item, i) => {
                                    if (i !== idx) {
                                        return item;
                                    }
                                    return {
                                        ...item,
                                        obereGrenze: value
                                    }
                                }))
                            }}
                        />
                    }

                
                    <input type="color" key={idx} value={bereich.hexFarbe} onChange={(e) => {
        
                        setFarbbereiche(farbbereiche.map((item, i) => {
                            if (i !== idx) {
                                return item;
                            }
                            return {
                                ...item,
                                hexFarbe: e.target.value
                            }
                        }))
                    }}/>
                </div>)
            }
            <ButtonLight onClick={() => setFarbbereiche([...(farbbereiche), {
                obereGrenze: -1,
                hexFarbe: '#000000'
            }])}>
                Farbbereich hinzufügen
            </ButtonLight>

        </div>
        
    </div>
}
const FarbbereichSlider = (props: FarbbereicheProps) => {

    const { farbbereiche, setFarbbereiche, obereGrenze, untereGrenze } = props
    const sortedFarbbereiche = sortFarbbereiche(farbbereiche)

    const heightInPx = 250

    function getHeight(sortedFarbbereicheIdx: number) {

        return 0;
        // console.log(obereGrenze, untereGrenze, heightInPx)
        // const totalHeight = obereGrenze - untereGrenze
        // const wertInBereich = grenze - untereGrenze
        // return heightInPx - ((wertInBereich / totalHeight ) * heightInPx)
    }

    return <>
    
        <div className={`min-h-[${heightInPx}px] min-w-[${heightInPx}px] border border-gray-300 rounded-lg overflow-hidden flex flex-col`}>
            {sortedFarbbereiche.map((bereich, index) => {
                return (
                <div
                    key={index}
                    className="flex items-center justify-center text-white font-bold text-sm"
                    style={{
                        height: `${getHeight(index)}px`,
                        backgroundColor: bereich.hexFarbe,
                    }}
                >
                    {bereich.obereGrenze}
                    {getHeight(index)}
                </div>
                );
            })}
        </div>
     </>
}