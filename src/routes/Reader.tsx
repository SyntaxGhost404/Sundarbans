import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Screen } from '../components/Screen'
import { Button, Card, IconButton, Segmented } from '../components/ui'
import { Sq } from '../lib/Sq'
import { Sheet } from '../components/Sheet'
import { chapters, loadChapter, type ChapterText } from '../content/chapters'
import { NotFound } from './NotFound'
import { useStore, type Leading, type Theme } from '../lib/store'
import { navigate } from '../lib/router'
import { bnNum, isoDay, minutesToRead } from '../lib/format'
import { haptic } from '../lib/haptics'
import { useOnline } from '../lib/hooks'

type Load = { state: 'loading' } | { state: 'ready'; text: ChapterText } | { state: 'error'; message: string }

/** Renders **bold** spans from the story source. Nothing else is interpreted. */
function rich(p: string): ReactNode {
  const parts = p.split(/\*\*(.+?)\*\*/g)
  return parts.map((s, i) => (i % 2 ? <strong key={i}>{s}</strong> : <Fragment key={i}>{s}</Fragment>))
}

export function Reader({ n }: { n: number }) {
  const meta = chapters.find((c) => c.n === n)
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [sheet, setSheet] = useState(false)
  const size = useStore((s) => s.readSize)
  const leading = useStore((s) => s.readLeading)
  const setProgress = useStore((s) => s.setProgress)
  const saved = useStore.getState().progress[n] ?? 0
  const bar = useRef<HTMLDivElement>(null)
  const online = useOnline()

  useEffect(() => {
    if (!meta) return
    let live = true
    setLoad({ state: 'loading' })
    loadChapter(n)
      .then((text) => live && setLoad({ state: 'ready', text }))
      .catch((err: unknown) => {
        if (!live) return
        const raw = err instanceof Error ? err.message : String(err)
        setLoad({ state: 'error', message: raw })
      })
    return () => {
      live = false
    }
  }, [n, meta, attempt])

  // Restore the reading position once the text is in, then track it.
  useEffect(() => {
    if (load.state !== 'ready') return
    const doc = document.documentElement
    const restore = saved > 0.02 && saved < 0.92
    if (restore) {
      requestAnimationFrame(() => {
        const max = doc.scrollHeight - window.innerHeight
        window.scrollTo({ top: Math.max(0, saved * max), behavior: 'instant' })
      })
    }
    let raf = 0
    let timer = 0
    let latest = 0
    const save = () => {
      window.clearTimeout(timer)
      setProgress(n, latest > 0.98 ? 1 : latest)
    }
    const measure = () => {
      raf = 0
      const max = Math.max(1, doc.scrollHeight - window.innerHeight)
      latest = Math.min(1, Math.max(0, window.scrollY / max))
      if (bar.current) bar.current.style.transform = `scaleX(${latest})`
      // Save once the reader pauses, not on every frame.
      window.clearTimeout(timer)
      timer = window.setTimeout(save, 250)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    const onHide = () => {
      if (document.visibilityState === 'hidden') save()
    }
    if (!restore) measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', save)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', save)
      cancelAnimationFrame(raf)
      if (timer) save()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load.state, n])

  const go = useCallback(
    (to: number) => {
      if (to < 1 || to > chapters.length) return
      haptic('select')
      navigate(`/read/${to}`, { replace: true })
    },
    [],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, [role="dialog"]')) return
      if (e.key === 'ArrowRight' && !e.metaKey && !e.altKey) go(n + 1)
      if (e.key === 'ArrowLeft' && !e.metaKey && !e.altKey) go(n - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [n, go])

  if (!meta) return <NotFound />
  const d = isoDay(meta.date)
  const lh = { tight: 1.7, normal: 1.9, loose: 2.1 }[leading]

  return (
    <Screen
      title={`${meta.n}. ${meta.en}`}
      back="/read"
      heading={null}
      actions={<IconButton icon="type" label="Reading settings" onClick={() => setSheet(true)} />}
      bar={
        <div className="read-progress" aria-hidden="true">
          <div ref={bar} className="read-progress-fill" />
        </div>
      }
      className="reader-page"
    >
      <article className="reader" style={{ ['--read-size' as string]: `${size}px`, ['--read-lh' as string]: lh }} lang="bn">
        <header className="reader-head">
          <p className="reader-num bn" aria-hidden="true">
            {bnNum(meta.n)}
          </p>
          <h1 className="reader-title bn">{meta.bn}</h1>
          <p className="reader-en" lang="en">
            Chapter {meta.n} · {meta.en}
          </p>
          <p className="reader-meta mono" lang="en">
            {d.label} {d.y} · {meta.where} · {minutesToRead(meta.words)} min
          </p>
        </header>

        {load.state === 'loading' && (
          <div className="reader-skeleton" aria-busy="true" aria-label="Loading the chapter">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} style={{ width: `${[96, 88, 92, 70, 94, 85, 90, 60, 80][i]}%` }} />
            ))}
          </div>
        )}

        {load.state === 'error' && (
          <Card className="reader-error" role="alert" lang="en">
            <p className="reader-error-title">This chapter did not load</p>
            <p>
              {online
                ? 'The file could not be fetched from the site. It may have been updated since you opened this page. Reload the page, then try again.'
                : 'You are offline, and this chapter was not saved on this device yet. Connect once and open it, and it will be kept for offline reading.'}
            </p>
            <p className="mono tiny muted">Detail: {load.message}</p>
            <div className="row-gap">
              <Button variant="primary" icon="reset" onClick={() => setAttempt((a) => a + 1)}>
                Try again
              </Button>
              <Button onClick={() => location.reload()}>Reload page</Button>
            </div>
          </Card>
        )}

        {load.state === 'ready' && (
          <div className="reader-body">
            {load.text.paras.map((p, i) => {
              const sep = /^\*\*॥.*॥\*\*$/.test(p)
              return (
                <p key={i} className={sep ? 'reader-end' : undefined}>
                  {rich(p)}
                </p>
              )
            })}
          </div>
        )}
      </article>

      {load.state === 'ready' && (
        <nav className="reader-pager" aria-label="Chapters" lang="en">
          {n > 1 ? (
            <Button icon="back" onClick={() => go(n - 1)} feel={false}>
              Chapter {n - 1}
            </Button>
          ) : (
            <span />
          )}
          {n < chapters.length ? (
            <Button variant="primary" iconRight="next" onClick={() => go(n + 1)} feel={false}>
              Chapter {n + 1}
            </Button>
          ) : (
            <Button variant="primary" to="/unexplained" iconRight="next">
              What stayed unexplained
            </Button>
          )}
        </nav>
      )}

      <ReadingSheet open={sheet} onClose={() => setSheet(false)} />
    </Screen>
  )
}

export function ReadingSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const size = useStore((s) => s.readSize)
  const leading = useStore((s) => s.readLeading)
  const theme = useStore((s) => s.theme)
  const set = useStore((s) => s.set)
  return (
    <Sheet open={open} onClose={onClose} title="Reading">
      <div className="settings-stack">
        <div className="setting">
          <p className="setting-label">Text size</p>
          <Segmented<string>
            label="Text size"
            block
            value={String(size)}
            onChange={(v) => set('readSize', Number(v))}
            options={[
              { value: '17', label: 'Small' },
              { value: '19', label: 'Medium' },
              { value: '21', label: 'Large' },
              { value: '24', label: 'Huge' },
            ]}
          />
        </div>
        <div className="setting">
          <p className="setting-label">Line spacing</p>
          <Segmented<Leading>
            label="Line spacing"
            block
            value={leading}
            onChange={(v) => set('readLeading', v)}
            options={[
              { value: 'tight', label: 'Tight' },
              { value: 'normal', label: 'Normal' },
              { value: 'loose', label: 'Loose' },
            ]}
          />
        </div>
        <div className="setting">
          <p className="setting-label">Theme</p>
          <Segmented<Theme>
            label="Theme"
            block
            value={theme}
            onChange={(v) => set('theme', v)}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />
        </div>
        <Sq as="p" r={14} edge={false} className="reader-sample bn" style={{ fontSize: size, lineHeight: { tight: 1.7, normal: 1.9, loose: 2.1 }[leading] }}>
          পরীর দোয়ানিতে যাওয়ার পথটা ছিল একটা ধীর অবিরাম সংকোচনের মতো।
        </Sq>
      </div>
    </Sheet>
  )
}
