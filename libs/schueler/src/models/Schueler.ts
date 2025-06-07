import type { AbholberechtigtePerson } from "./AbholberechtigtePerson";
import { type Anwesenheiten } from "@thesis/anwesenheiten"

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
    heutigerSchultagAnwesenheitsstatus?: Anwesenheiten,
    heutigerGanztagAnwesenheitsstatus?: Anwesenheiten,
    hatSonderpaedagogischeKraft: boolean,
    verlaesstSchuleAllein: boolean,
    allergienUndUnvertraeglichkeiten: string[]
} & SchuelerSimple