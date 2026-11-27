import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useReducedMotion } from 'motion/react'
import { useStore } from './store'

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const useWide = () => useMediaQuery('(min-width: 960px)')
export const useDialogLayout = () => useMediaQuery('(min-width: 720px)')

/** True when the user or the system asks for less motion. */
export function useCalm() {
  const system = useReducedMotion()
  const pref = useStore((s) => s.reduceMotion)
  return pref || !!system
}

/** Fires once after the pointer is held still for `ms`. Movement cancels it. */
export function useLongPress(onLongPress: () => void, ms = 480) {
  const timer = useRef<number | undefined>(undefined)
  const start = useRef<{ x: number; y: number } | null>(null)
  const fired = useRef(false)

  const clear = useCallback(() => {
    window.clearTimeout(timer.current)
    start.current = null
  }, [])

  useEffect(() => clear, [clear])

  return {
    fired,
    handlers: {
      onPointerDown: (e: React.PointerEvent) => {
        if (e.button !== 0) return
        fired.current = false
        start.current = { x: e.clientX, y: e.clientY }
        timer.current = window.setTimeout(() => {
          fired.current = true
          onLongPress()
        }, ms)
      },
      onPointerMove: (e: React.PointerEvent) => {
        if (!start.current) return
        if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 10) clear()
      },
      onPointerUp: clear,
      onPointerCancel: clear,
      onPointerLeave: clear,
      onContextMenu: (e: React.MouseEvent) => {
        if (fired.current) e.preventDefault()
      },
    },
  }
}

/** Current time, refreshed every `ms`. Pauses while the tab is hidden. */
export function useNow(ms = 60000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    let id = window.setInterval(() => setNow(Date.now()), ms)
    const vis = () => {
      window.clearInterval(id)
      if (document.visibilityState === 'visible') {
        setNow(Date.now())
        id = window.setInterval(() => setNow(Date.now()), ms)
      }
    }
    document.addEventListener('visibilitychange', vis)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', vis)
    }
  }, [ms])
  return now
}

export function useOnline() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('online', cb)
      window.addEventListener('offline', cb)
      return () => {
        window.removeEventListener('online', cb)
        window.removeEventListener('offline', cb)
      }
    },
    () => navigator.onLine,
    () => true,
  )
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Most Lights` : 'Most Lights'
  }, [title])
}
