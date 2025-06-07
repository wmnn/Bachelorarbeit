import { create } from 'zustand'
import { type Schuljahr, type Halbjahr, getSchuljahr} from '@thesis/schule'
import { createJSONStorage, persist } from 'zustand/middleware';

type KlassenStoreData = {
	ausgewaeltesSchuljahr: Schuljahr,
  ausgewaeltesHalbjahr: Halbjahr,
  updateSchuljahr: (schuljahr: Schuljahr) => void,
  updateHalbjahr: (halbjahr: Halbjahr) => void,
}

export const useSchuljahrStore = create<KlassenStoreData>()(
  persist(
    (set) => ({
      ausgewaeltesSchuljahr: getSchuljahr(new Date()),
      ausgewaeltesHalbjahr: '1. Halbjahr',
      updateSchuljahr: (schuljahr) => set({ ausgewaeltesSchuljahr: schuljahr }),
      updateHalbjahr: (halbjahr) => set({ ausgewaeltesHalbjahr: halbjahr }),
    }),
    {
      name: 'schuljahr-store', 
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);