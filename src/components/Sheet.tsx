import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useDragControls, useMotionValue, useTransform } from 'motion/react'
import { Sq } from '../lib/Sq'
import { useCalm, useDialogLayout } from '../lib/hooks'
import { haptic } from '../lib/haptics'
import { IconButton } from './ui'

let openCount = 0
function lockApp(on: boolean) {
  openCount = Math.max(0, openCount + (on ? 1 : -1))
  const app = document.getElementById('app')
  const locked = openCount > 0
  app?.toggleAttribute('inert', locked)
  document.documentElement.classList.toggle('is-locked', locked)
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  /** Visually hide the title (it stays available to screen readers). */
  quietTitle?: boolean
  size?: 'auto' | 'tall'
}

export function Sheet(props: SheetProps) {
  return createPortal(
    <AnimatePresence>{props.open && <SheetBody key="sheet" {...props} />}</AnimatePresence>,
    document.getElementById('layer') ?? document.body,
  )
}

function SheetBody({ onClose, title, children, footer, quietTitle, size = 'auto' }: SheetProps) {
  const dialog = useDialogLayout()
  const calm = useCalm()
  const id = useId()
  const panel = useRef<HTMLDivElement>(null)
  const controls = useDragControls()
  const dragY = useMotionValue(0)
  const fade = useTransform(dragY, [0, 360], [1, 0.15])
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    lockApp(true)
    const el = panel.current
    const first =
      el?.querySelector<HTMLElement>('[data-autofocus]') ?? el?.querySelector<HTMLElement>('.sheet-body ' + FOCUSABLE)
    // Wait a frame so the entering panel is in the tree and focusable.
    const raf = requestAnimationFrame(() => (first ?? el)?.focus({ preventScroll: true }))
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeRef.current()
      } else if (e.key === 'Tab' && el) {
        const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null)
        if (!items.length) return
        const a = items[0]
        const z = items[items.length - 1]
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault()
          z.focus()
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault()
          a.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      lockApp(false)
      opener?.focus?.({ preventScroll: true })
    }
  }, [])

  const spring = calm ? { duration: 0.01 } : { type: 'spring' as const, stiffness: 420, damping: 40, mass: 0.9 }

  return (
    <div className={`sheet-root${dialog ? ' is-dialog' : ''}`}>
      <motion.div
        className="sheet-scrim-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: calm ? 0.01 : 0.2 }}
        onClick={onClose}
        aria-hidden="true"
      >
        <motion.div className="sheet-scrim" style={{ opacity: dialog ? 1 : fade }} />
      </motion.div>
      <motion.div
        className="sheet-frame"
        initial={dialog ? { opacity: 0, scale: 0.97, y: 8 } : { y: '100%' }}
        animate={dialog ? { opacity: 1, scale: 1, y: 0 } : { y: 0 }}
        exit={dialog ? { opacity: 0, scale: 0.98, y: 6 } : { y: '100%' }}
        transition={dialog ? { duration: calm ? 0.01 : 0.18, ease: [0.2, 0.8, 0.2, 1] } : spring}
      >
        <motion.div
          className="sheet-drag"
          drag={dialog ? false : 'y'}
          dragControls={controls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.04, bottom: 0.85 }}
          dragTransition={{ bounceStiffness: 500, bounceDamping: 40 }}
          style={{ y: dragY }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 110 || info.velocity.y > 520) {
              haptic('tap')
              onClose()
            }
          }}
        >
          <Sq
            ref={panel}
            r={dialog ? 28 : [28, 28, 0, 0]}
            className={`sheet sheet-${size}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-t`}
            tabIndex={-1}
          >
            <div
              className="sheet-head"
              onPointerDown={(e) => {
                if (!dialog && !(e.target as HTMLElement).closest('button')) controls.start(e)
              }}
            >
              {!dialog && <span className="sheet-handle" aria-hidden="true" />}
              <div className="sheet-titlebar">
                <h2 id={`${id}-t`} className={quietTitle ? 'vh' : 'sheet-title'}>
                  {title}
                </h2>
                <IconButton icon="close" label="Close" size="sm" onClick={onClose} className="sheet-close" />
              </div>
            </div>
            <div className="sheet-body">{children}</div>
            {footer && <div className="sheet-foot">{footer}</div>}
          </Sq>
        </motion.div>
      </motion.div>
    </div>
  )
}
