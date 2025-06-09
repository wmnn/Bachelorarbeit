import { User } from "../../../auth/src"
import type { Halbjahr, Schuljahr } from "./schule"
import { type SchuelerSimple } from '@thesis/schueler'

export type Klasse = {
    id: number,
    klassenlehrer?: User[],
    versionen: KlassenVersion[]
}

export type KlassenVersion = {
    klassenId?: number,
    schuljahr: Schuljahr,
    halbjahr: Halbjahr,
    klassenstufe: number | string | undefined,
    zusatz: string | undefined,
    schueler?: number[],
    klassenlehrer?: User[] 
}