import { useState } from "react";
import { Input } from "../Input";
import { ButtonLight } from "../ButtonLight";
import { AbholberechtigtePersonen } from "./AbholberechtigtePersonen";
import type { Schueler } from "@thesis/schueler";
import { MultiInput } from "../shared/MultiInput";


interface SchuelerEditFormProps {
  onAbort: () => void,
  onSubmit: (schueler: Schueler) => void,
  submitButtonClassName?: string,
  cancelButtonClassName?: string,
  submitButtonText: string
  initialSchueler?: Schueler,
  title?: string
}

export function SchuelerEditForm({ onAbort, onSubmit, submitButtonText, submitButtonClassName, cancelButtonClassName, initialSchueler, title }: SchuelerEditFormProps) {

    const [vorname, setVorname] = useState(initialSchueler?.vorname ?? '');
    const [nachname, setNachname] = useState(initialSchueler?.nachname ?? '');
    const [kommentar, setKommentar] = useState(initialSchueler?.kommentar ?? '');
    const [medikamente, setMedikamente] = useState<string[]>(initialSchueler?.medikamente ?? []);
    const [ort, setOrt] = useState(initialSchueler?.ort ?? '');
    const [geburtsdatum, setGeburtsdatum] = useState(new Date().toISOString().split('T')[0]);
    const [strasse, setStrasse] = useState(initialSchueler?.strasse ?? '');
    const [familiensprache, setFamiliensprache] = useState(initialSchueler?.familiensprache ?? '');
    const [hatSonderpaedagogischeKraft, setHatSonderpaedagogischeKraft] = useState((initialSchueler?.hatSonderpaedagogischeKraft as any) === "0" ? false : true);
    const [verlaesstSchuleAllein, setVerlaesstSchuleAllein] = useState<boolean>((initialSchueler?.verlaesstSchuleAllein as any) === "0" ? false : true);
    const [hausnummer, setHausnummer] = useState(initialSchueler?.hausnummer ?? '');
    const [postleitzahl, setPostleitzahl] = useState(initialSchueler?.postleitzahl ?? '');
    const [allergienUndUnvertraeglichkeiten, setAllergienUndUnvertraeglichkeiten] = useState<string[]>(initialSchueler?.allergienUndUnvertraeglichkeiten ?? []);
    const [abholberechtigtePersonen, setAbholberechtigtePersonen] = useState<any[]>(initialSchueler?.abholberechtigtePersonen ?? []);    

    async function handleSubmit() {

        const schueler: Schueler = {
            vorname, 
            nachname, 
            postleitzahl, 
            familiensprache,
            ort, 
            geburtsdatum,
            strasse, 
            hausnummer, 
            hatSonderpaedagogischeKraft,
            verlaesstSchuleAllein,
            abholberechtigtePersonen, 
            medikamente, 
            allergienUndUnvertraeglichkeiten,
            kommentar
        }

        onSubmit(schueler)
    }

    return <div className="flex flex-col justify-between">
        { title && <h1>{title}</h1>}
    
        <label>Kommentare</label>
        <textarea className="border-[1px] border-gray-300 min-h-[160px] p-2" value={kommentar} onChange={(e) => setKommentar(e.target.value)}/>

        <label>Vorname</label>
        <Input value={vorname} onChange={(e) => setVorname(e.target.value)}/>
        <label>Nachname</label>
        <Input value={nachname} onChange={(e) => setNachname(e.target.value)}/>

        <label>Familiensprache</label>
        <Input value={familiensprache} onChange={(e) => setFamiliensprache(e.target.value)}/>

        <label>Geburtstag</label>
        <Input type="date" name="geburtstag" value={geburtsdatum} onChange={(e) => setGeburtsdatum(e.target.value)}/>

        <div className="flex gap-2 flex-col md:flex-row mt-2">
            <div className="basis-0 grow-[2] flex flex-col gap-2">
                <label>Straße</label>
                <Input value={strasse} onChange={(e) => setStrasse(e.target.value)}/>
            </div>

            <div className="basis-0 grow-[1] flex flex-col gap-2">
                <label>Hausnummer</label>
                <Input value={hausnummer} onChange={(e) => setHausnummer(e.target.value)}/>
            </div>
        </div>

        <div className="flex gap-2 flex-col md:flex-row mt-2">
            <div className="basis-0 grow-[1] flex flex-col gap-2">
                <label>Postleitzahl</label>
                <Input value={postleitzahl} onChange={(e) => setPostleitzahl(e.target.value)}/>
            </div>

            <div className="basis-0 grow-[2] flex flex-col gap-2">
                <label>Ort</label>
                <Input value={ort} onChange={(e) => setOrt(e.target.value)}/>
            </div>
        </div>

        <div className="flex gap-2 items-center py-2">
            <label>Verlässt Schule alleine?</label>
            <Input type="checkbox" checked={verlaesstSchuleAllein} onChange={() => setVerlaesstSchuleAllein(prev => !prev)}/>
        </div>

        <div className="flex gap-2 items-center py-2">
            <label>Sonderpädagogische Kraft?</label>
            <Input type="checkbox" checked={hatSonderpaedagogischeKraft} onChange={() => setHatSonderpaedagogischeKraft(prev => !prev)}/>
        </div>

        <MultiInput values={medikamente} setValues={setMedikamente} label="Medikamente"/>
        <MultiInput values={allergienUndUnvertraeglichkeiten} setValues={setAllergienUndUnvertraeglichkeiten} label="Allergien und Unverträglichkeiten"/>
        <AbholberechtigtePersonen personen={abholberechtigtePersonen} setPersonen={setAbholberechtigtePersonen}/>
         <div className="flex gap-2 py-8">
            <ButtonLight className={cancelButtonClassName} onClick={() => onAbort()}>
                Abbrechen
            </ButtonLight>
            <ButtonLight className={submitButtonClassName} onClick={() => handleSubmit()}>
                {submitButtonText}
            </ButtonLight>
        </div>
    </div>
}