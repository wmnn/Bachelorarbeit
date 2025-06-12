import { type User } from '../../../auth/src'
import { type Schuljahr, type Halbjahr } from './'

export interface Ganztagsangebot {
    name: string, 
    schuljahr: Schuljahr,
    halbjahr: Halbjahr,
    schueler?: number[],
    betreuer?: number[],
}