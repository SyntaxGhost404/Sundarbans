import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { create } from 'zustand'
import { Sq } from '../lib/Sq'
import { haptic, type HapticKind } from '../lib/haptics'
import { useCalm } from '../lib/hooks'
import { Icon, type IconName } from './Icon'

interface ToastItem {
  id: number
  text: string
  icon?: IconName
  action?: { label: string; run: () => void }
  ms: number
}

interface ToastState {
  items: ToastItem[]
  push: (t: ToastItem) => void
  drop: (id: number) => void
}

const useToasts = create<ToastState>((set) => ({
  items: [],
  push: (t) => set((s) => ({ items: [...s.items.slice(-2), t] })),
  drop: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}))

let seq = 0

export function toast(
  text: string,
  opts: { icon?: IconName; action?: ToastItem['action']; ms?: number; feel?: HapticKind | false } = {},
) {
  const id = ++seq
  if (opts.feel !== false) haptic(opts.feel ?? 'success')
  useToasts.getState().push({ id, text, icon: opts.icon, action: opts.action, ms: opts.ms ?? (opts.action ? 5200 : 3200) })
  return id
}

function ToastView({ item }: { item: ToastItem }) {
  const drop = useToasts((s) => s.drop)
  const timer = useRef<number | undefined>(undefined)
  const calm = useCalm()

  const arm = () => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => drop(item.id), item.ms)
  }
  useEffect(() => {
    arm()
    return () => window.clearTimeout(timer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.li
      layout={!calm}
      className="toast-item"
      initial={calm ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={calm ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.14 } }}
      transition={{ type: 'spring', stiffness: 520, damping: 38 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 500) drop(item.id)
      }}
      onPointerEnter={() => window.clearTimeout(timer.current)}
      onPointerLeave={arm}
      onFocus={() => window.clearTimeout(timer.current)}
      onBlur={arm}
    >
      <Sq r={14} className="toast">
        {item.icon && <Icon name={item.icon} size={20} />}
        <span className="toast-text">{item.text}</span>
        {item.action && (
          <button
            type="button"
            className="toast-action"
            onClick={() => {
              haptic('tap')
              item.action?.run()
              drop(item.id)
            }}
          >
            {item.action.label}
          </button>
        )}
      </Sq>
    </motion.li>
  )
}

export function ToastHost() {
  const items = useToasts((s) => s.items)
  return createPortal(
    <ol className="toast-host" aria-live="polite" aria-relevant="additions">
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <ToastView key={t.id} item={t} />
        ))}
      </AnimatePresence>
    </ol>,
    document.getElementById('layer') ?? document.body,
  )
}
