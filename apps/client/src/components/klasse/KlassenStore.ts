import { create } from 'zustand'
import { type KlassenVersion} from '@thesis/schule'

type KlassenStoreData = {
  neueKlassen: KlassenVersion[],
  setNeueKlassen: (fn: (prev: KlassenVersion[]) => KlassenVersion[]) => void;
  klassenlehrerSelectInput: string,
  setKlassenlehrerSelectInput: (val: string) => void
}


export const useKlassenStore = create<KlassenStoreData>((set) => ({
  klassenlehrerSelectInput: '',
  setKlassenlehrerSelectInput: (val: string) => set({ klassenlehrerSelectInput: val}),
  neueKlassen: [],
  setNeueKlassen: (fn) => {
    set((state) => ({
      neueKlassen: fn(state.neueKlassen),
    }));
  },
}))