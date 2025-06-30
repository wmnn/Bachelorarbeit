import { useEffect, useRef, useState } from "react";
import { ButtonLight } from "../ButtonLight"
import { Input } from "../Input";
import { DiagnostikNumberFormat, DiagnostikTyp, Sichtbarkeit, sortFarbbereiche, type Diagnostik, type Farbbereich } from '@thesis/diagnostik'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useKlassen } from "../shared/useKlassen";
import { getTitle, type Klasse } from "@thesis/schule";
import { MultiInput } from "../shared/MultiInput";
import { DialogWithButtons } from "../dialog/DialogWithButtons";
import { useDiagnostiken } from "../shared/useDiagnostiken";

interface DiagnostikFormProps {
  onAbort: () => void,
  onSubmit: (diagnostik: Diagnostik, files: File[]) => void,
  submitButtonClassName?: string,
  cancelButtonClassName?: string,
  submitButtonText: string,
  initialDiagnostik?: Diagnostik,
  title?: string,
}

export const DiagnostikForm = (props: DiagnostikFormProps) => {
    const { submitButtonText, submitButtonClassName, cancelButtonClassName, onAbort, onSubmit, initialDiagnostik } = props;
    const [diagnostik, setDiagnostik] = useState<Diagnostik>(initialDiagnostik ? {
        ...initialDiagnostik,
        erstellungsTyp: "benutzerdefiniert",
    } : {
        id: -1,
        name: '',
        beschreibung: '',
        erstellungsTyp: 'Vorlage',
        format: DiagnostikNumberFormat.NUMMER,
        klasseId: -1,
        vorlageId: -1,
        farbbereiche: [{
            hexFarbe: '#129600'
        }, {
            hexFarbe: '#cf0202',
            obereGrenze: ''
        }],
        speicherTyp: DiagnostikTyp.LAUFENDES_VERFAHREN,
        sichtbarkeit: Sichtbarkeit.PRIVAT
    })
    const [isSichtbarkeitDialogShown, setIsSichtbarkeitDialogShown] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const [deletedFiles, setDeletedFiles] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null);

    const klassenQuery = useKlassen()
    const vorlagenQuery = useDiagnostiken(DiagnostikTyp.VORLAGE)

    if (klassenQuery.isPending || vorlagenQuery.isPending) {
        return <p>...Loading</p>
    }
    const klassen = (klassenQuery.data ?? []) as Klasse[]
    const vorlagen = vorlagenQuery.data ?? []

    function handleSubmit() { 
        onSubmit({
            ...diagnostik,
            files: (diagnostik.files ?? []).filter(fileName => !deletedFiles.includes(fileName))
        }, files)
    }

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
        onSubmit(newDiagnostik, [])
    }
    
    return <form className="flex flex-col gap-2">
        <div className="flex justify-end">

        {
            isSichtbarkeitDialogShown && <DialogWithButtons
                closeDialog={() => setIsSichtbarkeitDialogShown(false)}
                onSubmit={handleVorlageButton}
                submitButtonText="Vorlage erstellen"
            >
                <label>
                    Sichtbarkeit
                </label>
                <Select 
                    value={`${diagnostik.sichtbarkeit}`}
                    onValueChange={async (val: string) => {
                        setDiagnostik(prev => ({
                            ...prev,
                            sichtbarkeit: parseInt(val)
                        }))
                    }}
                >
                    <SelectTrigger className="xl:w-[200px] w-min">
                        <SelectValue placeholder="Keine Sichtbarkeit ausgewählt"/>
                    </SelectTrigger>
                    <SelectContent>
    
                        <SelectItem value={`${Sichtbarkeit.PRIVAT}`}>
                            privat
                        </SelectItem>  
                        <SelectItem value={`${Sichtbarkeit.ÖFFENTLICH}`}>
                            öffentlich
                        </SelectItem>  
                        
                    </SelectContent>
                </Select>  
            </DialogWithButtons>
        }
            
        <button type="button" className="border-[1px] border-gray-200 px-2 py-2 rounded-lg hover:bg-black hover:text-white transition-all" onClick={() => setIsSichtbarkeitDialogShown(true)}>
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
            onValueChange={async (val: string) => {
                setDiagnostik(prev => ({
                    ...prev,
                    erstellungsTyp: val as Diagnostik['erstellungsTyp']
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
                    onValueChange={async (val: string) => {
                        setDiagnostik(prev => ({
                            ...prev,
                            vorlageId: parseInt(val)
                        }))
                    }}
                >
                    <SelectTrigger className="xl:w-[200px] w-min">
                        <SelectValue placeholder="Keine Vorlage ausgewählt"/>
                    </SelectTrigger>
                    <SelectContent>
                        {
                            vorlagen.map(vorlage => <SelectItem value={`${vorlage.id}`}>
                                {vorlage.name}
                            </SelectItem>)
                        }  
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

                {
                    initialDiagnostik !== undefined && <div>
                        <label>
                            Dateien löschen
                        </label>
                        {diagnostik.files != undefined && diagnostik.files?.length > 0 && (
                            <ul className="mt-2 text-sm text-gray-700 flex flex-col items-start gap-2">
                            {diagnostik.files.map((file, index) => (
                                <button key={index} type="button" className="flex gap-2 items-center" onClick={() => {
                                    if (deletedFiles.includes(file)) {
                                        setDeletedFiles(prev => prev.filter(path => path != file))
                                    } else {
                                        setDeletedFiles(prev => [...prev, file])
                                    }
                                }}>
                                    <input type="checkbox" checked={deletedFiles.includes(file)} />
                                    File: {file}
                                </button>
                            ))}
                            </ul>
                        )}
                    </div>   
                }

                <label>
                    {initialDiagnostik !== undefined && 'Weitere'} Dateien hochladen
                </label>
                <Input type="file" ref={fileInputRef} id="file" name="file" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} hidden/>
                {files.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-700">
                    {files.map((file, index) => (
                        <li key={index}>File: {file.name}</li>
                    ))}
                    </ul>
                )}
                <ButtonLight
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                >
                    Dateien auswählen
                </ButtonLight>
                

                {/* <label>Format</label>
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
                </Select>  */}

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
            <ButtonLight className={cancelButtonClassName} onClick={onAbort}>
                Abbrechen
            </ButtonLight>
            <ButtonLight className={submitButtonClassName} onClick={handleSubmit}>
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
    const { farbbereiche, setFarbbereiche } = props

    const [lastUpdatedValue, setLastUpdatedValue] = useState<null | string>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    

    useEffect(() => {
        if (lastUpdatedValue !== null) {
            inputRefs.current.find(ref => ref?.value === lastUpdatedValue)?.focus()
        }
    }, [farbbereiche]);

    return <div className="flex flex-col xl:flex-row gap-8">
        {/* <div>
            <FarbbereichSlider {...props} />
        </div> */}


        <div className="xl:ml-16 flex flex-col gap-2">
            {
                sortFarbbereiche(farbbereiche).map((bereich, idx) => <div key={idx} className="flex gap-2 items-center w-full justify-end">

                    {
                        farbbereiche.length -1 == idx && <label>Mindeststandard</label>
                    }

                    {
                        idx !== 0 && <Input type="number" 
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
            {/* <ButtonLight onClick={() => setFarbbereiche([...(farbbereiche), {
                obereGrenze: -1,
                hexFarbe: '#000000'
            }])}>
                Farbbereich hinzufügen
            </ButtonLight> */}

        </div>
        
    </div>
}
// const FarbbereichSlider = (props: FarbbereicheProps) => {

//     const { farbbereiche } = props
//     const sortedFarbbereiche = sortFarbbereiche(farbbereiche)

//     const heightInPx = 250

//     function getHeight(_: number) {

//         return 0;
//         // console.log(obereGrenze, untereGrenze, heightInPx)
//         // const totalHeight = obereGrenze - untereGrenze
//         // const wertInBereich = grenze - untereGrenze
//         // return heightInPx - ((wertInBereich / totalHeight ) * heightInPx)
//     }

//     return <>
    
//         <div className={`min-h-[${heightInPx}px] min-w-[${heightInPx}px] border border-gray-300 rounded-lg overflow-hidden flex flex-col`}>
//             {sortedFarbbereiche.map((bereich, index) => {
//                 return (
//                 <div
//                     key={index}
//                     className="flex items-center justify-center text-white font-bold text-sm"
//                     style={{
//                         height: `${getHeight(index)}px`,
//                         backgroundColor: bereich.hexFarbe,
//                     }}
//                 >
//                     {bereich.obereGrenze}
//                     {getHeight(index)}
//                 </div>
//                 );
//             })}
//         </div>
//      </>
// }