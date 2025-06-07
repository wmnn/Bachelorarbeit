import { SCHUELER_QUERY_KEY } from '@/reactQueryKeys';
import type { Schueler } from '@thesis/schueler';
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type SchuelerStoreData = {
	schueler: Schueler[],
    setSchueler: (fn: (prev: Schueler[]) => Schueler[]) => void,
    setSingleSchueler: (schuelerId: number, schueler: Schueler) => void,
    getSchueler: (schuelerId: number) => Schueler | undefined
}

export const useSchuelerStore = create<SchuelerStoreData>()(persist(
    (set, get) => ({
        schueler: [],
        setSchueler: (fn: (prev: Schueler[]) => Schueler[]) => {
            set((state) => ({ schueler: fn(state.schueler)}))
        },
        getSchueler: (schuelerId) => {
            return get().schueler.find(o => o.id === schuelerId)
        },
        setSingleSchueler: (schuelerId, updatedSchueler) => set(() => {
            return {
                schueler: [...get().schueler.filter(o => o.id !== schuelerId), updatedSchueler]
            }
        })
    }), {
        name: SCHUELER_QUERY_KEY, 
        storage: createJSONStorage(() => sessionStorage),
    }),
)
