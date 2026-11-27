import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Sq } from '../lib/Sq'
import { haptic } from '../lib/haptics'
import { useCalm } from '../lib/hooks'
import { useUnlocked } from '../lib/ui'
import { Icon } from './Icon'

const HOLD_MS = 600

/**
 * Hides a spoiler until it is held for a moment, so a scrolling thumb never
 * reveals it by accident. Keyboard and screen reader users reveal it with
 * a single press, which is never accidental.
 */
export function HoldToReveal({
  children,
  label = 'Hold to reveal',
  lines = 3,
  compact,
  chapter,
}: {
  children: ReactNode
  label?: string
  lines?: number
  compact?: boolean
  /** Opens by itself once this chapter has been read. */
  chapter?: number
}) {
  const showAll = useUnlocked(chapter)
  const [open, setOpen] = useState(false)
  const [holding, setHolding] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const calm = useCalm()

  useEffect(() => () => window.clearTimeout(timer.current), [])

  if (showAll || open) {
    return (
      <motion.div
        className="reveal-open"
        initial={showAll || calm ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        {children}
      </motion.div>
    )
  }

  const start = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    setHolding(true)
    haptic('select')
    timer.current = window.setTimeout(() => {
      setHolding(false)
      setOpen(true)
      haptic('success')
    }, HOLD_MS)
  }
  const stop = () => {
    window.clearTimeout(timer.current)
    setHolding(false)
  }

  const widths = ['92%', '78%', '86%', '64%', '70%']

  return (
    <Sq
      as="button"
      type="button"
      r={14}
      className={`reveal${holding ? ' is-holding' : ''}${compact ? ' is-compact' : ''}`}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
      onClick={(e: React.MouseEvent) => {
        // detail is 0 for keyboard and assistive tech activation.
        if (e.detail === 0) {
          setOpen(true)
          haptic('success')
        }
      }}
      aria-label={`${label}. Spoiler.`}
    >
      <span className="reveal-fill" style={{ transitionDuration: holding ? `${HOLD_MS}ms` : '160ms' }} />
      <span className="reveal-bars" aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} style={{ width: widths[i % widths.length] }} />
        ))}
      </span>
      <span className="reveal-label">
        <Icon name="lock" size={16} />
        {holding ? 'Keep holding' : label}
      </span>
    </Sq>
  )
}
