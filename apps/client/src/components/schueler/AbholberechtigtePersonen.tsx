import { ButtonLight } from "../ButtonLight";
import { Input } from "../Input";
import type { AbholberechtigtePerson } from '@thesis/schueler'

interface AbholberechtigtePersonenProps {
    personen: Array<AbholberechtigtePerson>,
    setPersonen: (personen: Array<AbholberechtigtePerson>) => void
}
export function AbholberechtigtePersonen ({ personen, setPersonen }: AbholberechtigtePersonenProps) {
    return <div className="mt-8">
        <label>Abholberechtigte Personen</label>
        {
            personen.map((person, idx) => <div className="flex flex-col gap-2">

                <h2 className="mt-4">Person {idx + 1}</h2>

                <label>Vorname</label>
                <Input key={idx} value={person.vorname} onChange={(e) => {
                    setPersonen(personen.map((p: any, i: any) => {
                        if (i !== idx) {
                            return p;
                        }
                        return {
                            ...p,
                            vorname: e.target.value
                        }
                    }))
                }}/>

                <label>Nachname</label>
                <Input key={idx} value={person.nachname} onChange={(e) => {
                    setPersonen(personen.map((p, i) => {
                        if (i !== idx) {
                            return p;
                        }
                        return {
                            ...p,
                            nachname: e.target.value
                        }
                    }))
                }}/>

                <label>Straße</label>
                <Input key={idx} value={person.strasse} onChange={(e) => {
                    setPersonen(personen.map((p, i) => {
                        if (i !== idx) {
                            return p;
                        }
                        return {
                            ...p,
                            strasse: e.target.value
                        }
                    }))
                }}/>

                <label>Hausnummer</label>
                <Input key={idx} value={person.hausnummer} onChange={(e) => {
                    setPersonen(personen.map((p, i) => {
                        if (i !== idx) {
                            return p;
                        }
                        return {
                            ...p,
                            hausnummer: e.target.value
                        }
                    }))
                }}/>

                <label>Postleitzahl</label>
                <Input key={idx} value={person.postleitzahl} onChange={(e) => {
                    setPersonen(personen.map((p, i) => {
                        if (i !== idx) {
                            return p;
                        }
                        return {
                            ...p,
                            postleitzahl: e.target.value
                        }
                    }))
                }}/>

                <label>Ort</label>
                <Input key={idx} value={person.ort} onChange={(e) => {
                    setPersonen(personen.map((p, i) => {
                        if (i !== idx) {
                            return p;
                        }
                        return {
                            ...p,
                            ort: e.target.value
                        }
                    }))
                }}/>

                <label>Abholzeit</label>
                <Input key={idx} value={person.abholzeit} onChange={(e) => {
                    setPersonen(personen.map((p, i) => {
                        if (i !== idx) {
                            return p;
                        }
                        return {
                            ...p,
                            abholzeit: e.target.value
                        }
                    }))
                }}/>
            
            
            </div>)

        }
        <ButtonLight 
            onClick={() => {
                setPersonen([...personen, {
                    vorname: '',
                    nachname: '',
                    strasse: '',
                    hausnummer: '',
                    postleitzahl: '',
                    ort: '', 
                    abholzeit: '',
                }])
            }} 
            className="mt-8"
        >
            Abholberechtigte Personen hinzufügen
        </ButtonLight>
    </div>
}