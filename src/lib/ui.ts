import { create } from 'zustand'
import { useStore } from './store'

// Short-lived UI state that should not survive a reload.
interface UI {
  searchOpen: boolean
  setSearch: (open: boolean) => void
}

export const useUI = create<UI>((set) => ({
  searchOpen: false,
  setSearch: (searchOpen) => set({ searchOpen }),
}))

/**
 * A spoiler opens by itself once the reader has finished that chapter,
 * or when spoilers are switched on in Settings.
 */
export function useUnlocked(chapter?: number) {
  return useStore((s) => {
    if (s.spoilers) return true
    if (!chapter) return false
    for (const [n, v] of Object.entries(s.progress)) {
      const k = Number(n)
      if (k > chapter && v > 0.02) return true
      if (k === chapter && v >= 0.92) return true
    }
    return false
  })
}
