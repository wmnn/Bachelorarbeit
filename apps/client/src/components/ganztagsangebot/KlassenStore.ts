import { create } from 'zustand'
import { type KlassenVersion} from '@thesis/schule'

type GanztagsangebotStoreData = {
  neueKlassen: KlassenVersion[],
  setNeueKlassen: (fn: (prev: KlassenVersion[]) => KlassenVersion[]) => void;
}


export const useKlassenStore = create<GanztagsangebotStoreData>((set) => ({
  neueKlassen: [],
  setNeueKlassen: (fn) => {
    set((state) => ({
      neueKlassen: fn(state.neueKlassen),
    }));
  },
}))