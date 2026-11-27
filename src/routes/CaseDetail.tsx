import { useRef, type ReactNode } from 'react'
import { AnimatePresence, motion, type PanInfo } from 'motion/react'
import { Screen } from '../components/Screen'
import { Badge, Button, Card, Segmented } from '../components/ui'
import { Icon } from '../components/Icon'
import { Avatar } from '../components/Avatar'
import { HoldToReveal } from '../components/HoldToReveal'
import { MoonGlyph } from '../components/MoonGlyph'
import { NotFound } from './NotFound'
import { caseById, type CaseFile, type CaseId } from '../content/cases'
import { clues } from '../content/clues'
import { memberById } from '../content/team'
import { placeById } from '../content/places'
import { Link, navigate, withQuery } from '../lib/router'
import { Sq } from '../lib/Sq'
import { fromBd, moonIllumination, phaseName } from '../lib/astro'
import { nightTime, tonight } from '../lib/sky'
import { isoDay, rangeLabel } from '../lib/format'
import { haptic } from '../lib/haptics'
import { useCalm } from '../lib/hooks'

const TABS = ['overview', 'days', 'people', 'explained', 'route'] as const
type Tab = (typeof TABS)[number]
const LABELS: Record<Tab, string> = {
  overview: 'Overview',
  days: 'Days',
  people: 'People',
  explained: 'Explained',
  route: 'Route',
}

export function CaseDetail({ id, tab }: { id: string; tab: string | null }) {
  const c = caseById[id as CaseId]
  const calm = useCalm()
  const dir = useRef(0)
  const current: Tab = (TABS as readonly string[]).includes(tab ?? '') ? (tab as Tab) : 'overview'
  if (!c) return <NotFound />

  const setTab = (t: Tab) => {
    dir.current = TABS.indexOf(t) - TABS.indexOf(current)
    navigate(withQuery(`/cases/${c.id}`, { tab: t === 'overview' ? undefined : t }), { replace: true })
  }

  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    const { x, y } = info.offset
    if (Math.abs(x) < 70 || Math.abs(x) < Math.abs(y) * 1.6) return
    const i = TABS.indexOf(current) + (x < 0 ? 1 : -1)
    if (i < 0 || i >= TABS.length) return
    haptic('select')
    setTab(TABS[i])
  }

  return (
    <Screen
      title={c.en}
      back="/cases"
      heading={null}
      bar={
        <div className="appbar-tabs">
          <Segmented<Tab>
            label="Case sections"
            size="sm"
            value={current}
            onChange={setTab}
            options={TABS.map((t) => ({ value: t, label: LABELS[t] }))}
          />
        </div>
      }
    >
      <CaseHero c={c} />
      <motion.div className="tab-pan" onPanEnd={onPanEnd}>
        <AnimatePresence mode="popLayout" initial={false} custom={dir.current}>
          <motion.div
            key={current}
            custom={dir.current}
            initial={calm ? { opacity: 0 } : { opacity: 0, x: dir.current >= 0 ? 24 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={calm ? { opacity: 0 } : { opacity: 0, x: dir.current >= 0 ? -24 : 24 }}
            transition={{ duration: calm ? 0.01 : 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="tab-panel"
            role="tabpanel"
            aria-label={LABELS[current]}
          >
            {current === 'overview' && <Overview c={c} />}
            {current === 'days' && <Days c={c} />}
            {current === 'people' && <People c={c} />}
            {current === 'explained' && <Explained c={c} />}
            {current === 'route' && <Route c={c} />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <p className="swipe-hint tiny muted">Swipe sideways to move between sections.</p>
    </Screen>
  )
}

function CaseHero({ c }: { c: CaseFile }) {
  return (
    <div className="case-hero">
      <div className="case-hero-top">
        <span className="case-no case-no-lg">{c.no}</span>
        <Badge tone="accent" icon="check">
          {c.status}
        </Badge>
        {c.open ? (
          <Badge tone="warn" icon="lights">
            {c.open} unexplained
          </Badge>
        ) : null}
      </div>
      <h1 className="case-hero-bn bn">{c.bn}</h1>
      <p className="case-hero-en">{c.en}</p>
      <p className="case-hero-meta">
        <span>
          <Icon name="place" size={16} />
          {c.where}
        </span>
        <span className="mono">
          <Icon name="calendar" size={16} />
          {rangeLabel(c.from, c.to)}
        </span>
      </p>
      <ul className="case-hero-team" aria-label="On this case">
        {c.team.map((m) => (
          <li key={m}>
            <Sq as={Link} r={12} edge={false} to={`/team/${m}`} className="team-pill" onClick={() => haptic('tap')}>
              <Avatar id={m} size={28} name="" />
              <span>{memberById[m].short}</span>
              {m === c.lead && <span className="lead-tag">lead</span>}
            </Sq>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Block({ title, children, icon }: { title: string; children: ReactNode; icon?: Parameters<typeof Icon>[0]['name'] }) {
  return (
    <section className="block">
      <h2 className="block-title">
        {icon && <Icon name={icon} size={18} />}
        {title}
      </h2>
      {children}
    </section>
  )
}

function Overview({ c }: { c: CaseFile }) {
  const n = clues.filter((x) => x.case === c.id).length
  return (
    <div className="overview">
      <p className="lede">{c.hook}</p>
      <Block title="Background" icon="info">
        {c.setup.map((p, i) => (
          <p key={i} className="prose">
            {p}
          </p>
        ))}
      </Block>
      <Block title="What really happened" icon="lock">
        <HoldToReveal label="Hold to reveal the solution" lines={4} chapter={c.story ? 15 : undefined}>
          <div className="solution">
            {c.solution.map((p, i) => (
              <p key={i} className="prose">
                {p}
              </p>
            ))}
          </div>
        </HoldToReveal>
      </Block>
      <div className="overview-actions">
        <Button to={withQuery('/board', { case: c.id })} icon="board" variant="secondary">
          {n} clues on the board
        </Button>
        {c.story ? (
          <Button to="/read" icon="book" variant="primary">
            Read the story
          </Button>
        ) : (
          <p className="tiny muted overview-note">This case exists as a file only. It has not been written up as a story yet.</p>
        )}
      </div>
      <Block title="What it taught us" icon="spark">
        <ul className="lessons">
          {c.lessons.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </Block>
    </div>
  )
}

function Days({ c }: { c: CaseFile }) {
  const place = placeById[c.place]
  return (
    <ol className="days">
      {c.days.map((d, i) => {
        const day = isoDay(d.date)
        const noon = fromBd(d.date, '12:00') ?? 0
        const night = tonight(noon, place.lat, place.lng)
        const ill = moonIllumination(fromBd(d.date, '22:00') ?? noon)
        return (
          <li key={i} className="day">
            <div className="day-date">
              <span className="day-dow mono">{day.label.slice(0, 3)}</span>
              <span className="day-num">{day.d}</span>
              <span className="day-mon mono">{day.label.slice(-3)}</span>
            </div>
            <Card className="day-card" r={20}>
              <div className="day-head">
                <h3 className="day-title">{d.title}</h3>
                {d.chapter && (
                  <Link to={`/read/${d.chapter}`} className="chapter-link mono" onClick={() => haptic('tap')}>
                    Ch {d.chapter}
                  </Link>
                )}
              </div>
              <p className="day-text">{d.text}</p>
              {d.spoiler && (
                <HoldToReveal compact lines={1} chapter={d.chapter} label="Hold for what happened">
                  <p className="day-spoiler">{d.spoiler}</p>
                </HoldToReveal>
              )}
              <div className="day-sky" title={`Computed for ${place.name}`}>
                <MoonGlyph fraction={ill.fraction} waxing={ill.waxing} size={28} />
                <span className="mono">
                  {phaseName(fromBd(d.date, '22:00') ?? noon)} · {Math.round(ill.fraction * 100)}% · sets{' '}
                  {nightTime(night.moonset, night.sunset)}
                </span>
              </div>
            </Card>
          </li>
        )
      })}
    </ol>
  )
}

function People({ c }: { c: CaseFile }) {
  const groups: Record<string, typeof c.people> = {}
  c.people.forEach((p) => (groups[p.group] ??= []).push(p))
  return (
    <div className="people">
      {Object.entries(groups).map(([g, list]) => (
        <section key={g} className="people-group">
          <h2 className="block-title">{g}</h2>
          <ul className="people-list">
            {list.map((p) => (
              <li key={p.name}>
                <Card className="person" r={20}>
                  <div className="person-head">
                    <span className="person-name">{p.name}</span>
                    {p.bn && <span className="person-bn bn muted">{p.bn}</span>}
                  </div>
                  <p className="person-role">{p.role}</p>
                  {p.truth && (
                    <HoldToReveal compact lines={1} chapter={c.story ? 15 : undefined} label="Hold for the truth">
                      <p className="person-truth">{p.truth}</p>
                    </HoldToReveal>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Explained({ c }: { c: CaseFile }) {
  return (
    <div className="explained">
      <p className="muted explained-intro">What people said it was, and what it turned out to be.</p>
      <ul className="said-list">
        {c.phenomena.map((p) => (
          <li key={p.said}>
            <Card className="said" r={20}>
              <p className="said-label mono">They said</p>
              <p className="said-text">
                {p.said}
                {p.bn && <span className="bn muted"> {p.bn}</span>}
              </p>
              <HoldToReveal compact lines={2} chapter={c.story ? 15 : undefined} label="Hold for what it was">
                <p className="said-label mono">It was</p>
                <p className="said-was">{p.was}</p>
                <p className="said-label mono">Cracked by</p>
                <p className="said-by">{p.cracked}</p>
              </HoldToReveal>
              {p.clue && (
                <Link to={`/board/${p.clue}`} className="text-link said-link" onClick={() => haptic('tap')}>
                  On the board
                  <Icon name="next" size={16} />
                </Link>
              )}
            </Card>
          </li>
        ))}
      </ul>
      {c.open ? (
        <Card to="/unexplained" className="open-card">
          <Sq as="span" r={14} edge={false} className="open-card-icon">
            <Icon name="lights" size={26} />
          </Sq>
          <span className="open-card-body">
            <span className="open-card-title">And two that were never explained</span>
            <span className="open-card-sub">The Calling and the Doyani Lights</span>
          </span>
          <Icon name="next" size={18} />
        </Card>
      ) : null}
    </div>
  )
}

function Route({ c }: { c: CaseFile }) {
  return (
    <div className="routes">
      {c.route.map((leg) => (
        <section key={leg.label} className="leg">
          <h2 className="block-title">
            <Icon name={leg.icon} size={18} />
            {leg.label}
          </h2>
          <ol className="line">
            {leg.stops.map((s, i) => (
              <li key={s.name + i} className={`stop stop-${s.mode}${i === 0 ? ' is-first' : ''}${i === leg.stops.length - 1 ? ' is-last' : ''}`}>
                <span className="stop-dot" aria-hidden="true" />
                <span className="stop-body">
                  <span className="stop-name">
                    <span className={/[ঀ-৿]/.test(s.name) ? 'bn' : undefined}>{s.name}</span>
                    {s.time && <span className="stop-time mono">{s.time}</span>}
                  </span>
                  {s.note && <span className="stop-note">{s.note}</span>}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ))}
      {c.id === 'doyani' && (
        <p className="tiny muted">
          Trains, times and off days were checked against Bangladesh Railway’s schedules. The whole-cabin rule is a family
          rule.
        </p>
      )}
    </div>
  )
}
