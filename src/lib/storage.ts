// localStorage can be missing or throw (private windows, blocked site data).
// Everything here fails soft and the app keeps working from memory.

const memory = new Map<string, string>()
let available: boolean | null = null

export function storageAvailable(): boolean {
  if (available !== null) return available
  try {
    const k = '__ml_probe__'
    localStorage.setItem(k, '1')
    localStorage.removeItem(k)
    available = true
  } catch {
    available = false
  }
  return available
}

export const safeStorage = {
  getItem(name: string): string | null {
    try {
      if (storageAvailable()) return localStorage.getItem(name)
    } catch {
      /* fall through to memory */
    }
    return memory.get(name) ?? null
  },
  setItem(name: string, value: string): void {
    memory.set(name, value)
    try {
      if (storageAvailable()) localStorage.setItem(name, value)
    } catch {
      available = false
    }
  },
  removeItem(name: string): void {
    memory.delete(name)
    try {
      if (storageAvailable()) localStorage.removeItem(name)
    } catch {
      /* ignore */
    }
  },
}
