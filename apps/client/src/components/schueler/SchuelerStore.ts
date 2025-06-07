import type { SchuelerSimple } from '@thesis/schueler';
import { create } from 'zustand'

type SchuelerStoreData = {
	schueler: SchuelerSimple[],
    setSchueler: (fn: (prev: SchuelerSimple[]) => SchuelerSimple[]) => void
}

export const useSchuelerStore = create<SchuelerStoreData>((set) => ({
    schueler: [],
    setSchueler: (fn: (prev: SchuelerSimple[]) => SchuelerSimple[]) => {
        set((state) => ({ schueler: fn(state.schueler)}))
    },
}))