import type { AbholberechtigtePerson } from "./AbholberechtigtePerson";
import { type Anwesenheitsstatus } from "@thesis/anwesenheiten"

export interface SchuelerSimple {
    id?: number,
    vorname: string,
    nachname: string,
    hatSonderpaedagogischeKraft?: boolean,
    verlaesstSchuleAllein?: boolean,
    derzeitigeKlasse?: string,
    heutigerSchultagAnwesenheitsstatus?: Anwesenheitsstatus,
    heutigerGanztagAnwesenheitsstatus?: Anwesenheitsstatus,
    ernährung: Ernährung,
    medikamente?: string[],
}
export type Schueler = {
    postleitzahl: string,
    ort: string,
    strasse: string,
    hausnummer: string,
    abholberechtigtePersonen: AbholberechtigtePerson[],
    familiensprache: string,
    geburtsdatum: string,
    klasse?: string, // im aktuellen Schulhalbjahr
    hatSonderpaedagogischeKraft: boolean,
    verlaesstSchuleAllein: boolean,
    allergienUndUnvertraeglichkeiten: string[],
    kommentar?: string,
    ernährung?: Ernährung
} & SchuelerSimple

export enum Ernährung {
    NORMAL,
    VEGETARISCH,
    VEGAN
}