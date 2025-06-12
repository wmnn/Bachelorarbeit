import { type Schuljahr, type Halbjahr } from './'

export interface Ganztagsangebot {
    id?: number,
    name: string, 
    schuljahr: Schuljahr,
    halbjahr: Halbjahr,
    schueler?: number[],
    betreuer?: number[],
}