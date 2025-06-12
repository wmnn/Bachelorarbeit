import { create } from 'zustand'
import type { User } from '@thesis/auth';

type UserStoreData = {
  selectedUser: User[],
  setSelectedUser: (fn: (prev: User[]) => User[]) => void;
  query: string,
  setQuery: (val: string) => void
}


export const useSelectedUserStore = create<UserStoreData>((set) => ({
  selectedUser: [],
  setSelectedUser: (fn) => {
    set((state) => ({
      selectedUser: fn(state.selectedUser),
    }));
  },
  query: '',
  setQuery: (val: string) => set({ query: val}),
}))