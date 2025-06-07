import { create } from 'zustand'
import { type Schuljahr, type Halbjahr, getSchuljahr, type KlassenVersion} from '@thesis/schule'

type KlassenStoreData = {
	ausgewaeltesSchuljahr: Schuljahr,
  ausgewaeltesHalbjahr: Halbjahr,
  updateSchuljahr: (schuljahr: Schuljahr) => void,
  updateHalbjahr: (halbjahr: Halbjahr) => void,
  neueKlassen: KlassenVersion[],
  setNeueKlassen: (fn: (prev: KlassenVersion[]) => KlassenVersion[]) => void;
}

export const useKlassenStore = create<KlassenStoreData>((set) => ({
  ausgewaeltesSchuljahr: getSchuljahr(new Date()),
  ausgewaeltesHalbjahr: "1. Halbjahr",
  neueKlassen: [],
  setNeueKlassen: (fn) => {
    set((state) => ({
      neueKlassen: fn(state.neueKlassen),
    }));
  },
  updateSchuljahr: (schuljahr) => set({ ausgewaeltesSchuljahr: schuljahr }),
  updateHalbjahr: (schuljahr) => set({ ausgewaeltesHalbjahr: schuljahr })
}))