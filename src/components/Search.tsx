import { useEffect, useMemo, useRef, useState } from 'react'
import { Sheet } from './Sheet'
import { Icon, type IconName } from './Icon'
import { useUI } from '../lib/ui'
import { navigate } from '../lib/router'
import { haptic } from '../lib/haptics'
import { fold } from '../lib/format'
import { Sq } from '../lib/Sq'
import { clues, kindById } from '../content/clues'
import { cases } from '../content/cases'
import { team } from '../content/team'
import { chapters } from '../content/chapters'
import { unexplained } from '../content/unexplained'

interface Hit {
  group: string
  title: string
  sub: string
  to: string
  icon: IconName
  hay: string
}

const tools: Hit[] = [
  { group: 'Tools', title: 'Moon and tide', sub: 'Phase, moonrise, moonset, tide range', to: '/tools/moon', icon: 'moon', hay: '' },
  { group: 'Tools', title: 'Districts', sub: 'Tick the districts you have stood in', to: '/tools/districts', icon: 'map', hay: '' },
  { group: 'Tools', title: 'Field kit', sub: 'Checklists for village nights and forest boats', to: '/tools/kit', icon: 'kit', hay: '' },
  { group: 'Tools', title: 'Report a light', sub: 'Write down what you saw, the way we would', to: '/tools/report', icon: 'pen', hay: '' },
  { group: 'Tools', title: 'Settings', sub: 'Theme, haptics, spoilers, reading', to: '/settings', icon: 'sliders', hay: 'haptic vibration dark light theme' },
]

function buildIndex(): Hit[] {
  const out: Hit[] = []
  for (const c of cases)
    out.push({
      group: 'Cases',
      title: `${c.no} · ${c.en}`,
      sub: `${c.bn}, ${c.where}`,
      to: `/cases/${c.id}`,
      icon: 'folder',
      hay: [c.bn, c.where, c.hook, ...c.people.map((p) => p.name)].join(' '),
    })
  for (const m of team)
    out.push({
      group: 'Team',
      title: m.name,
      sub: `${m.role}. ${m.line}`,
      to: `/team/${m.id}`,
      icon: 'team',
      hay: [m.short, m.bn, ...m.strengths].join(' '),
    })
  for (const c of clues)
    out.push({
      group: 'Clues',
      title: c.title,
      sub: c.seemed,
      to: `/board/${c.id}`,
      icon: kindById[c.kind].icon,
      hay: [c.bn ?? '', kindById[c.kind].label].join(' '),
    })
  for (const ch of chapters)
    out.push({
      group: 'Chapters',
      title: `${ch.n}. ${ch.en}`,
      sub: `${ch.bn}, ${ch.where}`,
      to: `/read/${ch.n}`,
      icon: 'book',
      hay: ch.bn,
    })
  for (const u of unexplained)
    out.push({ group: 'Unexplained', title: u.en, sub: u.bn, to: '/unexplained', icon: 'lights', hay: u.summary })
  return [...out, ...tools]
}

export function SearchSheet() {
  const open = useUI((s) => s.searchOpen)
  const setOpen = useUI((s) => s.setSearch)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const list = useRef<HTMLUListElement>(null)
  const index = useMemo(buildIndex, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      const typing = t.closest('input, textarea, select, [contenteditable="true"]')
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  useEffect(() => {
    if (!open) {
      setQ('')
      setActive(0)
    }
  }, [open])

  const results = useMemo(() => {
    const terms = fold(q).split(/\s+/).filter(Boolean)
    if (!terms.length) return []
    return index
      .map((h) => {
        const title = fold(h.title)
        const all = fold(`${h.title} ${h.sub} ${h.hay}`)
        if (!terms.every((t) => all.includes(t))) return null
        const score = terms.reduce((s, t) => s + (title.startsWith(t) ? 6 : title.includes(t) ? 3 : 1), 0)
        return { h, score }
      })
      .filter((x): x is { h: Hit; score: number } => !!x)
      .sort((a, b) => b.score - a.score)
      .slice(0, 24)
      .map((x) => x.h)
  }, [q, index])

  const go = (h: Hit) => {
    haptic('tap')
    setOpen(false)
    navigate(h.to)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (!results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(results.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      go(results[active])
    }
  }

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const groups: Record<string, { h: Hit; i: number }[]> = {}
  results.forEach((h, i) => (groups[h.group] ??= []).push({ h, i }))

  return (
    <Sheet open={open} onClose={() => setOpen(false)} title="Search the files" size="tall">
      <Sq r={14} className="field search-field">
        <Icon name="search" size={20} className="field-icon" />
        <input
          data-autofocus
          className="field-input"
          type="search"
          inputMode="search"
          enterKeyHint="go"
          placeholder="A name, a place, a clue"
          aria-label="Search the files"
          aria-controls="search-results"
          aria-activedescendant={results.length ? `sr-${active}` : undefined}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setActive(0)
          }}
          onKeyDown={onKey}
          autoComplete="off"
          spellCheck={false}
        />
      </Sq>
      {!q.trim() && (
        <div className="search-hints">
          <p className="muted">Try a name like Hasmat, a place like Kotka, or a word like moon.</p>
          <div className="search-suggest">
            {['moon', 'vest', 'Kader', 'Rongmohol', 'drone', 'Oli'].map((s) => (
              <button key={s} type="button" className="link-btn" onClick={() => setQ(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      {q.trim() && !results.length && (
        <p className="search-empty">
          Nothing in the files matches “{q.trim()}”. Check the spelling, or try one word.
        </p>
      )}
      <ul id="search-results" ref={list} className="search-results" role="listbox" aria-label="Results">
        {Object.entries(groups).map(([g, items]) => (
          <li key={g} role="presentation">
            <p className="search-group">{g}</p>
            <ul role="presentation">
              {items.map(({ h, i }) => (
                <li
                  key={h.to + h.title}
                  id={`sr-${i}`}
                  data-i={i}
                  role="option"
                  aria-selected={i === active}
                  className={`search-hit${i === active ? ' is-active' : ''}`}
                  onClick={() => go(h)}
                  onPointerMove={() => setActive(i)}
                >
                  <Sq r={10} edge={false} className="search-hit-icon">
                    <Icon name={h.icon} size={18} />
                  </Sq>
                  <span className="search-hit-text">
                    <span className="search-hit-title">{h.title}</span>
                    <span className="search-hit-sub">{h.sub}</span>
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
