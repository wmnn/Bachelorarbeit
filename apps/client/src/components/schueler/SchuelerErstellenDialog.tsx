import { useState } from "react";
import { Input } from "../Input";
import { ButtonLight } from "../ButtonLight";
import { DialogWithButtons } from "../dialog/DialogWithButtons";

export function SchuelerErstellenDialog() {

    const [vorname, setVorname] = useState('');
    const [nachname, setNachname] = useState('');

    return <DialogWithButtons onSubmit={() => {}} closeDialog={() => {}} submitButtonText="Erstellen">

        <div className="flex flex-col justify-between">
            <h1>Schüler erstellen</h1>
         <label>Vorname</label>
        <Input value={vorname} onChange={(e) => setVorname(e.target.value)}/>
        <label>Nachname</label>
        <Input value={nachname} onChange={(e) => setNachname(e.target.value)}/>

        <label>Familiensprache</label>
        <Input value={nachname} onChange={(e) => setNachname(e.target.value)}/>

        <label>Geburtstag</label>
        <Input type="date" name="geburtstag"/>

        <div className="flex gap-2 flex-col md:flex-row mt-2">
            <div className="basis-0 grow-[2] flex flex-col gap-2">
                <label>Straße</label>
                <Input name="s"/>
            </div>

            <div className="basis-0 grow-[1] flex flex-col gap-2">
                <label>Hausnummer</label>
                <Input name="s"/>
            </div>
        </div>

        <div className="flex gap-2 flex-col md:flex-row mt-2">
            <div className="basis-0 grow-[1] flex flex-col gap-2">
                <label>Postleitzahl</label>
                <Input name="s"/>
            </div>

            <div className="basis-0 grow-[2] flex flex-col gap-2">
                <label>Ort</label>
                <Input name="s"/>
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

        <label>Medikamente</label>
        <ButtonLight>Medikament hinzufügen</ButtonLight>

        <label>Allergien und Unverträglichkeiten</label>
        <ButtonLight>Allergie oder Unverträglichkeit hinzufügen</ButtonLight>

        <label>Abholberechtigte Personen</label>
        <ButtonLight>Abholberechtigte Person hinzufügen</ButtonLight>

        </div>
        
        
    </DialogWithButtons>
}