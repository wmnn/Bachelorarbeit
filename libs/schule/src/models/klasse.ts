import type { Halbjahr, Schuljahr } from "./schule"
import { type SchuelerSimple } from '@thesis/schueler'

export type Klasse = {
    id: number,
    versionen: KlassenVersion[]
}

export type KlassenVersion = {
    klassenId?: number,
    schuljahr: Schuljahr,
    halbjahr: Halbjahr,
    klassenstufe: number | undefined,
    zusatz: string | undefined,
    schueler?: number[]
}