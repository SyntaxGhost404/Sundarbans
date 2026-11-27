import { motion } from 'motion/react'
import { Link, useLocation } from '../lib/router'
import { Sq } from '../lib/Sq'
import { haptic } from '../lib/haptics'
import { useCalm, useNow } from '../lib/hooks'
import { useStore } from '../lib/store'
import { moonIllumination, moonTimes, phaseName } from '../lib/astro'
import { bdTime } from '../lib/format'
import { placeById } from '../content/places'
import { Icon, type IconName } from './Icon'
import { MoonGlyph } from './MoonGlyph'
import { Logo } from './Screen'

interface NavItem {
  to: string
  label: string
  icon: IconName
  match: (path: string) => boolean
}

const starts = (p: string) => (path: string) => path === p || path.startsWith(p + '/')

const primary: NavItem[] = [
  { to: '/', label: 'Desk', icon: 'lantern', match: (p) => p === '/' },
  { to: '/cases', label: 'Cases', icon: 'folder', match: starts('/cases') },
  { to: '/board', label: 'Board', icon: 'board', match: starts('/board') },
  { to: '/read', label: 'Read', icon: 'book', match: starts('/read') },
  { to: '/team', label: 'Team', icon: 'team', match: starts('/team') },
]

const secondary: NavItem[] = [
  { to: '/unexplained', label: 'Unexplained', icon: 'lights', match: starts('/unexplained') },
  { to: '/tools', label: 'Field tools', icon: 'kit', match: starts('/tools') },
  { to: '/settings', label: 'Settings', icon: 'sliders', match: starts('/settings') },
]

export function TabBar() {
  const { path } = useLocation()
  const calm = useCalm()
  return (
    <nav className="tabbar" aria-label="Main">
      {primary.map((item) => {
        const on = item.match(path)
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`tab${on ? ' is-on' : ''}`}
            aria-current={on ? 'page' : undefined}
            onClick={() => haptic('select')}
          >
            <span className="tab-icon">
              {on && (
                <motion.span
                  layoutId="tab-pill"
                  className="tab-pill-wrap"
                  transition={calm ? { duration: 0 } : { type: 'spring', stiffness: 560, damping: 42 }}
                >
                  <Sq r={10} edge={false} className="tab-pill" />
                </motion.span>
              )}
              <Icon name={item.icon} size={22} />
            </span>
            <span className="tab-label">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function Rail() {
  const { path } = useLocation()
  const calm = useCalm()
  const item = (n: NavItem) => {
    const on = n.match(path)
    return (
      <Link
        key={n.to}
        to={n.to}
        className={`rail-item${on ? ' is-on' : ''}`}
        aria-current={on ? 'page' : undefined}
        onClick={() => haptic('select')}
      >
        {on && (
          <motion.span
            layoutId="rail-pill"
            className="rail-pill-wrap"
            transition={calm ? { duration: 0 } : { type: 'spring', stiffness: 560, damping: 44 }}
          >
            <Sq r={14} edge={false} className="rail-pill" />
          </motion.span>
        )}
        <Icon name={n.icon} size={20} />
        <span>{n.label}</span>
      </Link>
    )
  }
  return (
    <nav className="rail" aria-label="Main">
      <Link to="/" className="rail-brand" aria-label="Most Lights, Desk">
        <Logo size={30} />
        <span className="rail-brand-text">
          <span className="rail-brand-name">Most Lights</span>
          <span className="rail-brand-sub">Case files</span>
        </span>
      </Link>
      <div className="rail-group">{primary.map(item)}</div>
      <div className="rail-sep" />
      <div className="rail-group">{secondary.map(item)}</div>
      <RailMoon />
    </nav>
  )
}

function RailMoon() {
  const now = useNow(5 * 60000)
  const placeId = useStore((s) => s.place)
  const place = placeById[placeId]
  const ill = moonIllumination(now)
  const mt = moonTimes(now, place.lat, place.lng)
  return (
    <Link to="/tools/moon" className="rail-moon" onClick={() => haptic('tap')}>
      <MoonGlyph fraction={ill.fraction} waxing={ill.waxing} size={40} />
      <span className="rail-moon-text">
        <span className="rail-moon-title">{phaseName(now)}</span>
        <span className="rail-moon-sub">
          {place.name}
          {mt.set ? `, sets ${bdTime(mt.set)}` : mt.rise ? `, rises ${bdTime(mt.rise)}` : ''}
        </span>
      </span>
    </Link>
  )
}
