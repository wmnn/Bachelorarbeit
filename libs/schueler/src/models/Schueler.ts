import type { AbholberechtigtePerson } from "./AbholberechtigtePerson";

export interface SchuelerSimple {
    id?: number,
    vorname: string,
    nachname: string,
    hatSonderpaedagogischeKraft?: boolean,
    verlaesstSchuleAllein?: boolean,
}
export type Schueler = {
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
} & SchuelerSimple