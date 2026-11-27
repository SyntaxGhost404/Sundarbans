import { useEffect, useRef, useState, type ReactNode } from 'react'
import { back as goBack } from '../lib/router'
import { useDocumentTitle, useOnline, useWide } from '../lib/hooks'
import { useUI } from '../lib/ui'
import { Sq } from '../lib/Sq'
import { Icon } from './Icon'
import { IconButton } from './ui'

interface ScreenProps {
  title: string
  /** Large title shown in the page. Defaults to `title`. */
  heading?: ReactNode
  eyebrow?: ReactNode
  sub?: ReactNode
  /** Fallback route for the back button. Top-level screens have none. */
  back?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  bare?: boolean
  bar?: ReactNode
}

/** Page frame: a sticky app bar, an optional large title, and the content. */
export function Screen({ title, heading, eyebrow, sub, back, actions, children, className = '', bare, bar }: ScreenProps) {
  useDocumentTitle(title)
  const wide = useWide()
  const online = useOnline()
  const setSearch = useUI((s) => s.setSearch)
  const sentinel = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const showLarge = !bare && heading !== null

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting), { rootMargin: '-56px 0px 0px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const compactTitle = back || !showLarge || scrolled

  return (
    <>
      <header className={`appbar${scrolled ? ' is-scrolled' : ''}`}>
        <div className="appbar-inner">
          <div className="appbar-lead">
            {back ? (
              <IconButton icon="back" label="Back" onClick={() => goBack(back)} />
            ) : (
              !wide && (
                <span className="appbar-mark" aria-hidden="true">
                  <Logo size={28} />
                </span>
              )
            )}
          </div>
          <div className={`appbar-title${compactTitle ? ' is-shown' : ''}`} aria-hidden={!compactTitle}>
            {title}
          </div>
          <div className="appbar-actions">
            {!online && (
              <Sq as="span" r={10} edge={false} className="offline-pill" title="You are offline. Pages you already opened still work.">
                <Icon name="offline" size={16} />
                <span>Offline</span>
              </Sq>
            )}
            {actions}
            <IconButton icon="search" label="Search the files" onClick={() => setSearch(true)} />
            {!wide && !back && <IconButton icon="sliders" label="Settings" to="/settings" />}
          </div>
        </div>
        {bar}
      </header>
      <div className={`page ${className}`}>
        <div ref={sentinel} className="title-sentinel" aria-hidden="true" />
        {showLarge && (
          <div className="page-head">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className="page-title">{heading ?? title}</h1>
            {sub && <p className="page-sub">{sub}</p>}
          </div>
        )}
        {children}
      </div>
    </>
  )
}

/** The mark: a light, and someone standing in front of it. */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className="logo" aria-hidden="true">
      <circle cx="13.2" cy="13.2" r="8.2" className="logo-light" />
      <circle cx="20.4" cy="18.6" r="3.9" className="logo-figure" />
      <path d="M12.6 32c0-5.6 3.5-9.1 7.8-9.1s7.8 3.5 7.8 9.1z" className="logo-figure" />
    </svg>
  )
}
