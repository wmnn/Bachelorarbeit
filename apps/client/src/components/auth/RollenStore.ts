import type { Rolle } from '@thesis/auth'
import { create } from 'zustand'

type RollenStoreData = {
	rollen: Rolle[] | undefined,
    setRollen: (fn: (prev: Rolle[] | undefined) => Rolle[]) => void
}
export const useRollenStore = create<RollenStoreData>((set) => ({
  rollen: undefined,
  setRollen : (fn: (prev: Rolle[] | undefined) => Rolle[]) => {
    set((state => ({ rollen: fn(state.rollen) })))
  }
}))