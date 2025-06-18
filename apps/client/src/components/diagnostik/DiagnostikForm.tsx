import { useState } from "react";
import { ButtonLight } from "../ButtonLight"
import { Input } from "../Input";
import { DiagnostikNumberFormat, type Diagnostik, type Farbbereich } from '@thesis/diagnostik'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useKlassen } from "../shared/useKlassen";
import { getTitle, type Klasse } from "@thesis/schule";
import { MultiInput } from "../shared/MultiInput";
import { NumberInput } from "../shared/NumberInput";

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
        typ: 'Vorlage',
        format: DiagnostikNumberFormat.NUMMER,
        klasseId: -1,
        vorlageId: -1,
        farbbereiche: [{
            hexFarbe: '#129600'
        }]
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
    
    return <form className="flex flex-col gap-2">
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
            value={diagnostik.klasseId === -1 ? undefined : `${diagnostik.klasseId}`}
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
            value={`${diagnostik.typ}`}
            onValueChange={async (val: Diagnostik['typ']) => {
                setDiagnostik(prev => ({
                    ...prev,
                    typ: val
                }))
            }}
        >
            <SelectTrigger className="xl:w-[200px] w-min">
                <SelectValue placeholder="Keine Rolle"/>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={`${'Vorlage' satisfies Diagnostik['typ']}`}>
                    Vorlage
                </SelectItem>     
                <SelectItem value={`${'benutzerdefiniert' satisfies Diagnostik['typ']}`}>
                    benutzerdefiniert
                </SelectItem>    
            </SelectContent>
        </Select>  

        {
            diagnostik.typ === 'Vorlage' && <div className="flex flex-col">
                <label>Vorlage</label>
                <Select 
                    value={diagnostik.vorlageId === -1 ? undefined : `${diagnostik.vorlageId}`}
                    onValueChange={async (val: Diagnostik['typ']) => {
                        setDiagnostik(prev => ({
                            ...prev,
                            typ: val
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
            diagnostik.typ === 'benutzerdefiniert' && <div className="flex flex-col">
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
                <NumberInput value={diagnostik.obereGrenze ?? ''}
                    setValue={(val) => {
                        setDiagnostik(prev => ({
                            ...prev,
                            obereGrenze: val
                        }));
                    }}
                />

                <label>Untere Grenze</label>
                <NumberInput value={diagnostik.untereGrenze ?? ''}
                    setValue={(val) => {
                        setDiagnostik(prev => ({
                            ...prev,
                            untereGrenze: val
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
                <ButtonLight onClick={() => setFarbbereiche([...(diagnostik.farbbereiche ?? []), {
                    obereGrenze: -1,
                    hexFarbe: '#000000'
                }])}>
                    Farbbereich hinzufügen
                </ButtonLight>

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
    obereGrenze: number,
    untereGrenze: number
}
const Farbbereiche = (props: FarbbereicheProps) => {
    const { farbbereiche, setFarbbereiche, obereGrenze, untereGrenze } = props

    // const heightInPx = 250
    // function getHeight(grenze: number) {
    //     console.log(obereGrenze, untereGrenze, heightInPx)
    //     const totalHeight = obereGrenze - untereGrenze
    //     const wertInBereich = grenze - untereGrenze
    //     return heightInPx - ((wertInBereich / totalHeight ) * heightInPx)
    // }
    return <div className="flex flex-col xl:flex-row gap-8">
        <div>
            {/* <div className={`min-h-[${heightInPx}px] min-w-[${heightInPx}px] border border-gray-300 rounded-lg overflow-hidden flex flex-col`}>
                {farbbereiche.map((bereich, index) => {
                    return (
                    <div
                        key={index}
                        className="flex items-center justify-center text-white font-bold text-sm"
                        style={{
                            height: `${getHeight(bereich.obereGrenze ?? 0)}px`,
                            backgroundColor: bereich.hexFarbe,
                        }}
                    >
                        {bereich.obereGrenze}
                        {getHeight(bereich.obereGrenze ?? 0)}
                    </div>
                    );
                })}
            </div> */}


        </div>


        <div>
            {
                farbbereiche?.map((bereich, idx) => <div className="flex gap-2">
                    {
                        bereich.obereGrenze && <NumberInput 
                            value={bereich.obereGrenze ?? ''}
                            setValue={(val) => {
                                setFarbbereiche(farbbereiche.map((item, i) => {
                                    if (i !== idx) {
                                        return item;
                                    }
                                    return {
                                        ...item,
                                        obereGrenze: val ?? 0
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

        </div>
        
    </div>
}