import { create } from 'zustand'
import { type Schuljahr, type Halbjahr, getSchuljahr} from '@thesis/schule'

type KlassenStoreData = {
	ausgewaeltesSchuljahr: Schuljahr,
  ausgewaeltesHalbjahr: Halbjahr,
  updateSchuljahr: (schuljahr: Schuljahr) => void,
  updateHalbjahr: (halbjahr: Halbjahr) => void,
}

export const useSchuljahrStore = create<KlassenStoreData>((set) => ({
  ausgewaeltesSchuljahr: getSchuljahr(new Date()),
  ausgewaeltesHalbjahr: "1. Halbjahr",
  updateSchuljahr: (schuljahr) => set({ ausgewaeltesSchuljahr: schuljahr }),
  updateHalbjahr: (schuljahr) => set({ ausgewaeltesHalbjahr: schuljahr })
}))