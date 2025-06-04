import { useState } from "react";
import { Input } from "../Input";
import { ButtonLight } from "../ButtonLight";
import { DialogWithButtons } from "../dialog/DialogWithButtons";
import { AbholberechtigtePersonen } from "./AbholberechtigtePersonen";
import { createSchueler, type Schueler } from "@thesis/schueler";

function MultiInput({ values, setValues, label }: { values: Array<string>, setValues: (values: Array<string>) => void, label: string}) {
    return <div className="flex flex-col gap-2 my-2">
        <label>{label}</label>
        {
            values.map((value, idx) => <Input key={idx} value={value} onChange={(e) => {
                setValues(values.map((v, i) => {
                    if (i !== idx) {
                        return v;
                    }
                    return e.target.value
                }))
            }}/>)
        }
        <ButtonLight onClick={() => setValues([...values, ''])}>
            {label} hinzufügen
        </ButtonLight>
    </div>
}
export function SchuelerErstellenDialog() {

    const [vorname, setVorname] = useState('');
    const [nachname, setNachname] = useState('');
    const [medikamente, setMedikamente] = useState<string[]>([]);
    const [ort, setOrt] = useState('');
    const [geburtsdatum, setGeburtsdatum] = useState(new Date().toISOString().split('T')[0]);
    const [strasse, setStrasse] = useState('');
    const [familiensprache, setFamiliensprache] = useState('');
    const [hatSonderpaedagogischeKraft, setHatSonderpaedagogischeKraft] = useState(false);
    const [verlaesstSchuleAllein, setVerlaesstSchuleAllein] = useState(false);
    const [hausnummer, setHausnummer] = useState('');
    const [postleitzahl, setPostleitzahl] = useState('');
    const [allergienUndUnvertraeglichkeiten, setAllergienUndUnvertraeglichkeiten] = useState<string[]>([]);
    const [abholberechtigtePersonen, setAbholberechtigtePersonen] = useState<any[]>([]);    

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
            allergienUndUnvertraeglichkeiten
        }

        const res = await createSchueler(schueler)
        console.log(res)

    }

    return <DialogWithButtons onSubmit={() => handleSubmit()} closeDialog={() => {}} submitButtonText="Erstellen">

        <div className="flex flex-col justify-between">
            <h1>Schüler erstellen</h1>

            <label>Vorname</label>
            <Input value={vorname} onChange={(e) => setVorname(e.target.value)}/>
            <label>Nachname</label>
            <Input value={nachname} onChange={(e) => setNachname(e.target.value)}/>

            <label>Familiensprache</label>
            <Input value={familiensprache} onChange={(e) => setFamiliensprache(e.target.value)}/>

            <label>Geburtstag</label>
            <Input type="date" name="geburtstag"/>

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
                <Input type="checkbox" value={nachname} onChange={(e) => setNachname(e.target.value)}/>
            </div>

            <div className="flex gap-2 items-center py-2">
                <label>Sonderpädagogische Kraft?</label>
                <Input type="checkbox" value={nachname} onChange={(e) => setNachname(e.target.value)}/>
            </div>

            <MultiInput values={medikamente} setValues={setMedikamente} label="Medikamente"/>
            <MultiInput values={allergienUndUnvertraeglichkeiten} setValues={setAllergienUndUnvertraeglichkeiten} label="Allergien und Unverträglichkeiten"/>
            <AbholberechtigtePersonen personen={abholberechtigtePersonen} setPersonen={setAbholberechtigtePersonen}/>
        </div>
    </DialogWithButtons>
}