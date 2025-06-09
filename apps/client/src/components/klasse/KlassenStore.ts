import { create } from 'zustand'
import { type KlassenVersion} from '@thesis/schule'
import type { User } from '@thesis/auth';

type KlassenStoreData = {
  neueKlassen: KlassenVersion[],
  setNeueKlassen: (fn: (prev: KlassenVersion[]) => KlassenVersion[]) => void;
  klassenlehrerSelectInput: string,
  setKlassenlehrerSelectInput: (val: string) => void
  klassenlehrer: User[],
  setKlassenlehrer: (fn: (prev: User[]) => User[]) => void;
}


export const useKlassenStore = create<KlassenStoreData>((set) => ({
  klassenlehrerSelectInput: '',
  setKlassenlehrerSelectInput: (val: string) => set({ klassenlehrerSelectInput: val}),
  klassenlehrer: [],
  setKlassenlehrer: (fn) => {
    set((state) => ({
      klassenlehrer: fn(state.klassenlehrer),
    }));
  },
  neueKlassen: [],
  setNeueKlassen: (fn) => {
    set((state) => ({
      neueKlassen: fn(state.neueKlassen),
    }));
  },
}))