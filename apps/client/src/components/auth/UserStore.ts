import type { User } from '@thesis/auth'
import { create } from 'zustand'

type UserStoreData = {
    users: User[],
    setUsers: (fn: (prev: User[]) => User[]) => void
}

export const useUserStore = create<UserStoreData>((set) => ({
  users: [],
  setUsers : (fn: (prev: User[]) => User[]) => {
    set((state => ({ users: fn(state.users) })))
  }
}))