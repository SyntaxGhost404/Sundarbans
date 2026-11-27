import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { safeStorage } from './storage'

export type Theme = 'system' | 'light' | 'dark'
export type Leading = 'tight' | 'normal' | 'loose'
export type PlaceId = 'dhaka' | 'chapitala' | 'mongla' | 'kotka'

export interface ReportDraft {
  kind: string[]
  what: string
  where: string
  date: string
  time: string
  others: 'yes' | 'no' | 'unsure' | ''
  near: PlaceId | ''
  timetable: string
  leaves: string
  gains: string
}

export const emptyReport: ReportDraft = {
  kind: [],
  what: '',
  where: '',
  date: '',
  time: '',
  others: '',
  near: '',
  timetable: '',
  leaves: '',
  gains: '',
}

export interface Prefs {
  theme: Theme
  haptics: boolean
  spoilers: boolean
  reduceMotion: boolean
  readSize: number
  readLeading: Leading
  place: PlaceId
}

interface Data {
  progress: Record<string, number>
  lastChapter: number | null
  pins: string[]
  districts: string[]
  kit: Record<string, string[]>
  report: ReportDraft
}

interface Actions {
  set: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void
  setProgress: (chapter: number, value: number) => void
  togglePin: (id: string) => boolean
  toggleDistrict: (id: string) => void
  setDistricts: (ids: string[]) => void
  toggleKit: (list: string, item: string) => void
  setKit: (list: string, items: string[]) => void
  setReport: (patch: Partial<ReportDraft>) => void
  clearReport: () => void
  restore: (snapshot: Partial<Data>) => void
  resetData: () => Data
}

export type Store = Prefs & Data & Actions

export const defaultPrefs: Prefs = {
  theme: 'system',
  haptics: true,
  spoilers: false,
  reduceMotion: false,
  readSize: 19,
  readLeading: 'normal',
  place: 'dhaka',
}

const emptyData = (): Data => ({
  progress: {},
  lastChapter: null,
  pins: [],
  districts: [],
  kit: {},
  report: { ...emptyReport },
})

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...defaultPrefs,
      ...emptyData(),
      set: (key, value) => set({ [key]: value } as Partial<Store>),
      setProgress: (chapter, value) =>
        set((s) => {
          const prev = s.progress[chapter] ?? 0
          const clamped = Math.max(0, Math.min(1, value))
          // A finished chapter stays finished when it is opened again.
          const next = prev >= 0.92 ? Math.max(prev, clamped) : clamped
          if (Math.abs(prev - next) < 0.005 && s.lastChapter === chapter) return s
          return { progress: { ...s.progress, [chapter]: next }, lastChapter: chapter }
        }),
      togglePin: (id) => {
        const pinned = get().pins.includes(id)
        set((s) => ({ pins: pinned ? s.pins.filter((p) => p !== id) : [id, ...s.pins] }))
        return !pinned
      },
      toggleDistrict: (id) =>
        set((s) => ({
          districts: s.districts.includes(id)
            ? s.districts.filter((d) => d !== id)
            : [...s.districts, id],
        })),
      setDistricts: (ids) => set({ districts: ids }),
      toggleKit: (list, item) =>
        set((s) => {
          const cur = s.kit[list] ?? []
          const next = cur.includes(item) ? cur.filter((i) => i !== item) : [...cur, item]
          return { kit: { ...s.kit, [list]: next } }
        }),
      setKit: (list, items) => set((s) => ({ kit: { ...s.kit, [list]: items } })),
      setReport: (patch) => set((s) => ({ report: { ...s.report, ...patch } })),
      clearReport: () => set({ report: { ...emptyReport } }),
      restore: (snapshot) => set(snapshot),
      resetData: () => {
        const s = get()
        const snapshot: Data = {
          progress: s.progress,
          lastChapter: s.lastChapter,
          pins: s.pins,
          districts: s.districts,
          kit: s.kit,
          report: s.report,
        }
        set(emptyData())
        return snapshot
      },
    }),
    {
      name: 'most-lights',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        theme: s.theme,
        haptics: s.haptics,
        spoilers: s.spoilers,
        reduceMotion: s.reduceMotion,
        readSize: s.readSize,
        readLeading: s.readLeading,
        place: s.place,
        progress: s.progress,
        lastChapter: s.lastChapter,
        pins: s.pins,
        districts: s.districts,
        kit: s.kit,
        report: s.report,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Store>
        return {
          ...current,
          ...p,
          report: { ...emptyReport, ...(p.report ?? {}) },
        }
      },
    },
  ),
)

/** Applies the theme to <html> and the browser chrome colour. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
  const dark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((m) => m.setAttribute('content', dark ? '#0b0e0c' : '#f2f4f1'))
}
