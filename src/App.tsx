import { useEffect, type ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import { useLocation } from './lib/router'
import { applyTheme, useStore } from './lib/store'
import { useWide } from './lib/hooks'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Rail, TabBar } from './components/Nav'
import { ToastHost, toast } from './components/Toast'
import { SearchSheet } from './components/Search'
import { Desk } from './routes/Desk'
import { Cases } from './routes/Cases'
import { CaseDetail } from './routes/CaseDetail'
import { Board } from './routes/Board'
import { Unexplained } from './routes/Unexplained'
import { ReadIndex } from './routes/ReadIndex'
import { Reader } from './routes/Reader'
import { Team } from './routes/Team'
import { MemberPage } from './routes/Member'
import { Tools } from './routes/Tools'
import { MoonTool } from './routes/MoonTool'
import { DistrictsTool } from './routes/DistrictsTool'
import { KitTool } from './routes/KitTool'
import { ReportTool } from './routes/ReportTool'
import { Settings } from './routes/Settings'
import { NotFound } from './routes/NotFound'

function route(parts: string[], query: URLSearchParams): { key: string; el: ReactNode } {
  const [a, b] = parts
  switch (a) {
    case undefined:
      return { key: 'desk', el: <Desk /> }
    case 'cases':
      return b ? { key: `case-${b}`, el: <CaseDetail id={b} tab={query.get('tab')} /> } : { key: 'cases', el: <Cases /> }
    case 'board':
      return { key: 'board', el: <Board clueId={b} /> }
    case 'unexplained':
      return { key: 'unexplained', el: <Unexplained /> }
    case 'read':
      return b ? { key: `read-${b}`, el: <Reader n={Number(b)} /> } : { key: 'read', el: <ReadIndex /> }
    case 'team':
      return b ? { key: `team-${b}`, el: <MemberPage id={b} /> } : { key: 'team', el: <Team /> }
    case 'tools':
      if (!b) return { key: 'tools', el: <Tools /> }
      if (b === 'moon') return { key: 'moon', el: <MoonTool /> }
      if (b === 'districts') return { key: 'districts', el: <DistrictsTool /> }
      if (b === 'kit') return { key: 'kit', el: <KitTool /> }
      if (b === 'report') return { key: 'report', el: <ReportTool /> }
      return { key: '404', el: <NotFound /> }
    case 'settings':
      return { key: 'settings', el: <Settings /> }
    default:
      return { key: '404', el: <NotFound /> }
  }
}

export function App() {
  const loc = useLocation()
  const wide = useWide()
  const theme = useStore((s) => s.theme)
  const calmPref = useStore((s) => s.reduceMotion)

  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const on = () => applyTheme('system')
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.toggle('calm', calmPref)
  }, [calmPref])

  useEffect(() => {
    const off = () => toast('You are offline. Pages you already opened still work.', { icon: 'offline', feel: 'warning' })
    const on = () => toast('Back online.', { icon: 'signal', feel: false })
    window.addEventListener('offline', off)
    window.addEventListener('online', on)
    return () => {
      window.removeEventListener('offline', off)
      window.removeEventListener('online', on)
    }
  }, [])

  const r = route(loc.parts, loc.query)

  return (
    <MotionConfig reducedMotion={calmPref ? 'always' : 'user'}>
      <div id="app" className={`shell${wide ? ' is-wide' : ''}`}>
        <a href="#main" className="skip" onClick={(e) => {
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}>
          Skip to content
        </a>
        {wide && <Rail />}
        <div className="main-col">
          <main id="main" tabIndex={-1} key={r.key} className="screen">
            <ErrorBoundary resetKey={r.key}>{r.el}</ErrorBoundary>
          </main>
        </div>
        {!wide && <TabBar />}
      </div>
      <SearchSheet />
      <ToastHost />
    </MotionConfig>
  )
}
