import type { AbholberechtigtePerson } from "./AbholberechtigtePerson";

export interface Schueler {
    vorname: string,
    nachname: string,
    postleitzahl: string,
    ort: string,
    strasse: string,
    hausnummer: string,
    abholberechtigtePersonen: AbholberechtigtePerson[],
    medikamente: string[],
    familiensprache: string,
    geburtsdatum: string,
    hatSonderpaedagogischeKraft: boolean,
    verlaesstSchuleAllein: boolean,
    allergienUndUnvertraeglichkeiten: string[]
}