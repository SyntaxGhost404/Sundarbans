import { useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { Screen } from '../components/Screen'
import { Button, Card, Chip, Empty, Field, IconButton, Segmented } from '../components/ui'
import { Icon } from '../components/Icon'
import { Avatar } from '../components/Avatar'
import { Sheet } from '../components/Sheet'
import { HoldToReveal } from '../components/HoldToReveal'
import { toast } from '../components/Toast'
import { clueById, clues, kindById, kinds, type Clue, type ClueKind } from '../content/clues'
import { caseById, type CaseId } from '../content/cases'
import { chapters } from '../content/chapters'
import { memberById } from '../content/team'
import { Link, navigate, useLocation, withQuery } from '../lib/router'
import { useStore } from '../lib/store'
import { useCalm, useLongPress } from '../lib/hooks'
import { haptic } from '../lib/haptics'
import { fold } from '../lib/format'
import { Sq } from '../lib/Sq'

type CaseFilter = 'all' | CaseId

export function Board({ clueId }: { clueId?: string }) {
  const { query } = useLocation()
  const caseFilter = (['rongmohol', 'doyani'].includes(query.get('case') ?? '') ? query.get('case') : 'all') as CaseFilter
  const [kind, setKind] = useState<ClueKind[]>([])
  const [q, setQ] = useState('')
  const [pinnedOnly, setPinnedOnly] = useState(false)
  const pins = useStore((s) => s.pins)
  const calm = useCalm()

  const setCase = (v: CaseFilter) => navigate(withQuery('/board', { case: v === 'all' ? undefined : v }), { replace: true })

  const list = useMemo(() => {
    const terms = fold(q).split(/\s+/).filter(Boolean)
    const rows = clues.filter((c) => {
      if (caseFilter !== 'all' && c.case !== caseFilter) return false
      if (kind.length && !kind.includes(c.kind)) return false
      if (pinnedOnly && !pins.includes(c.id)) return false
      if (terms.length) {
        const hay = fold(`${c.title} ${c.bn ?? ''} ${c.seemed} ${c.when ?? ''} ${kindById[c.kind].label}`)
        if (!terms.every((t) => hay.includes(t))) return false
      }
      return true
    })
    // Pinned clues float to the top, in pin order.
    return rows.sort((a, b) => {
      const pa = pins.indexOf(a.id)
      const pb = pins.indexOf(b.id)
      if (pa === -1 && pb === -1) return 0
      if (pa === -1) return 1
      if (pb === -1) return -1
      return pa - pb
    })
  }, [caseFilter, kind, q, pinnedOnly, pins])

  const counts = useMemo(() => {
    const m = new Map<ClueKind, number>()
    clues.forEach((c) => {
      if (caseFilter === 'all' || c.case === caseFilter) m.set(c.kind, (m.get(c.kind) ?? 0) + 1)
    })
    return m
  }, [caseFilter])

  const open = clueId ? clueById[clueId] : undefined
  const closeSheet = () => navigate(withQuery('/board', { case: caseFilter === 'all' ? undefined : caseFilter }), { replace: true })
  const filtered = kind.length > 0 || q || pinnedOnly

  return (
    <Screen title="Board" sub={`${clues.length} clues from both cases. Each one looked like one thing and was another.`}>
      <div className="board-tools">
        <Segmented<CaseFilter>
          label="Case"
          value={caseFilter}
          onChange={setCase}
          options={[
            { value: 'all', label: 'Both' },
            { value: 'rongmohol', label: '01 Rongmohol' },
            { value: 'doyani', label: '02 Doyani' },
          ]}
        />
        <Field
          type="search"
          icon="search"
          placeholder="Filter clues"
          aria-label="Filter clues"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          trailing={
            q ? <IconButton icon="close" label="Clear filter" size="sm" onClick={() => setQ('')} className="field-clear" /> : null
          }
        />
        <div className="chips" role="group" aria-label="Kind of clue">
          <Chip on={pinnedOnly} icon="pinned" onClick={() => setPinnedOnly((v) => !v)} count={pins.length}>
            Pinned
          </Chip>
          {kinds
            .filter((k) => counts.get(k.id))
            .map((k) => (
              <Chip
                key={k.id}
                icon={k.icon}
                on={kind.includes(k.id)}
                count={counts.get(k.id)}
                onClick={() => setKind((cur) => (cur.includes(k.id) ? cur.filter((x) => x !== k.id) : [...cur, k.id]))}
              >
                {k.label}
              </Chip>
            ))}
        </div>
        <p className="board-count tiny muted" aria-live="polite">
          {list.length === clues.length ? 'Showing every clue.' : `Showing ${list.length} of ${clues.length}.`}
          {filtered && (
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                haptic('tap')
                setKind([])
                setQ('')
                setPinnedOnly(false)
              }}
            >
              Clear filters
            </button>
          )}
        </p>
      </div>

      {list.length === 0 ? (
        <Empty icon="board" title={pinnedOnly && !pins.length ? 'No pinned clues yet' : 'No clue matches'}>
          {pinnedOnly && !pins.length
            ? 'Press and hold any clue, or tap its pin, to keep it here and on your Desk.'
            : 'Loosen a filter, or search for one word.'}
        </Empty>
      ) : (
        <LayoutGroup>
          <motion.ul className="clue-grid" layout={!calm}>
            <AnimatePresence initial={false}>
              {list.map((c) => (
                <motion.li
                  key={c.id}
                  layout={!calm}
                  initial={calm ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={calm ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                >
                  <ClueCard c={c} pinned={pins.includes(c.id)} caseFilter={caseFilter} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </LayoutGroup>
      )}

      <Sheet open={!!open} onClose={closeSheet} title={open?.title ?? 'Clue'}>
        {open && <ClueDetail c={open} />}
      </Sheet>
    </Screen>
  )
}

function usePinToggle() {
  const togglePin = useStore((s) => s.togglePin)
  return (c: Clue) => {
    const nowPinned = togglePin(c.id)
    toast(nowPinned ? `Pinned “${c.title}”` : `Unpinned “${c.title}”`, {
      icon: nowPinned ? 'pinned' : 'pin',
      feel: nowPinned ? 'success' : 'tap',
      action: { label: 'Undo', run: () => togglePin(c.id) },
    })
  }
}

function ClueCard({ c, pinned, caseFilter }: { c: Clue; pinned: boolean; caseFilter: CaseFilter }) {
  const toggle = usePinToggle()
  const { fired, handlers } = useLongPress(() => toggle(c))
  const k = kindById[c.kind]
  return (
    <div className={`clue${pinned ? ' is-pinned' : ''}`}>
      <Card
        to={withQuery(`/board/${c.id}`, { case: caseFilter === 'all' ? undefined : caseFilter })}
        className="clue-card"
        r={20}
        {...handlers}
        onClickCapture={(e: React.MouseEvent) => {
          // A long press pins; it should not also open the clue.
          if (fired.current) {
            e.preventDefault()
            e.stopPropagation()
            fired.current = false
          }
        }}
      >
        <span className="clue-top">
          <span className="clue-kind">
            <Icon name={k.icon} size={16} />
            {k.label}
          </span>
          <span className="clue-case mono">{caseById[c.case].no}</span>
        </span>
        <span className="clue-title">{c.title}</span>
        {c.bn && <span className="clue-bn bn">{c.bn}</span>}
        <span className="clue-seemed">{c.seemed}</span>
        <span className="clue-foot">
          <span className="clue-by">
            {c.by.map((m) => (
              <Avatar key={m} id={m} size={24} name={memberById[m].short} />
            ))}
            {!c.by.length && c.helpers && <span className="tiny muted">{c.helpers.join(', ')}</span>}
          </span>
          {c.when && <span className="clue-when mono">{c.when}</span>}
        </span>
      </Card>
      <IconButton
        icon={pinned ? 'pinned' : 'pin'}
        label={pinned ? `Unpin ${c.title}` : `Pin ${c.title}`}
        size="sm"
        active={pinned}
        className="clue-pin"
        feel={false}
        onClick={() => toggle(c)}
      />
    </div>
  )
}

function ClueDetail({ c }: { c: Clue }) {
  const pinned = useStore((s) => s.pins.includes(c.id))
  const toggle = usePinToggle()
  const k = kindById[c.kind]
  const cs = caseById[c.case]
  const ch = c.chapter ? chapters.find((x) => x.n === c.chapter) : undefined
  return (
    <div className="clue-detail">
      <p className="clue-detail-meta">
        <span className="clue-kind">
          <Icon name={k.icon} size={16} />
          {k.label}
        </span>
        <Link to={`/cases/${cs.id}`} className="text-link" onClick={() => haptic('tap')}>
          Case {cs.no}, {cs.en}
        </Link>
        {c.when && <span className="mono muted">{c.when}</span>}
      </p>
      {c.bn && <p className="bn clue-detail-bn">{c.bn}</p>}
      <p className="said-label mono">It seemed</p>
      <p className="prose">{c.seemed}</p>
      <p className="said-label mono">It was</p>
      <HoldToReveal chapter={c.chapter} lines={3}>
        <p className="prose">{c.was}</p>
      </HoldToReveal>
      <p className="said-label mono">Cracked by</p>
      <ul className="by-list">
        {c.by.map((m) => (
          <li key={m}>
            <Sq as={Link} r={12} edge={false} to={`/team/${m}`} className="team-pill" onClick={() => haptic('tap')}>
              <Avatar id={m} size={28} name="" />
              <span>{memberById[m].short}</span>
            </Sq>
          </li>
        ))}
        {c.helpers?.map((h) => (
          <li key={h}>
            <Sq as="span" r={12} edge={false} className="team-pill is-plain">
              <Icon name="team" size={18} />
              <span>{h}</span>
            </Sq>
          </li>
        ))}
      </ul>
      <div className="clue-detail-actions">
        <Button icon={pinned ? 'pinned' : 'pin'} variant={pinned ? 'primary' : 'secondary'} feel={false} onClick={() => toggle(c)}>
          {pinned ? 'Pinned' : 'Pin'}
        </Button>
        {ch && (
          <Button to={`/read/${ch.n}`} icon="book" variant="secondary">
            Chapter {ch.n}
          </Button>
        )}
      </div>
    </div>
  )
}
