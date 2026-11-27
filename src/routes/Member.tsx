import { Screen } from '../components/Screen'
import { Card, SectionHead } from '../components/ui'
import { Icon } from '../components/Icon'
import { asset } from '../components/Avatar'
import { Sq } from '../lib/Sq'
import { Link } from '../lib/router'
import { haptic } from '../lib/haptics'
import { memberById, photoSrc, team, type MemberId } from '../content/team'
import { clues, kindById } from '../content/clues'
import { caseById } from '../content/cases'
import { NotFound } from './NotFound'

export function MemberPage({ id }: { id: string }) {
  const m = memberById[id as MemberId]
  if (!m) return <NotFound />
  const cracked = clues.filter((c) => c.by.includes(m.id))
  const i = team.findIndex((t) => t.id === m.id)
  const prev = team[(i - 1 + team.length) % team.length]
  const next = team[(i + 1) % team.length]

  return (
    <Screen title={m.short} back="/team" heading={null}>
      <div className="member">
        <Sq r={28} edge={false} className="member-photo">
          <img src={asset(photoSrc(m.id, 'portrait'))} alt={m.name} width={720} height={900} decoding="async" />
        </Sq>
        <div className="member-info">
          <p className="eyebrow">{m.role}</p>
          <h1 className="page-title">{m.name}</h1>
          <p className="member-bn-lg bn">{m.bn}</p>
          <p className="lede">{m.line}</p>
          {m.bio.map((p, k) => (
            <p key={k} className="prose">
              {p}
            </p>
          ))}
          {m.calls && <p className="tiny muted member-calls">{m.calls}</p>}
        </div>
      </div>

      {m.quote && (
        <Card className="creed member-quote" r={28}>
          <Icon name="quote" size={24} />
          <p className="creed-bn bn">{m.quote.bn}</p>
          <p className="creed-en">{m.quote.en}</p>
          <p className="creed-by mono">{m.quote.where}</p>
        </Card>
      )}

      <div className="member-cols">
        <section aria-labelledby="good-at">
          <SectionHead id="good-at" title="Good at" />
          <ul className="tags">
            {m.strengths.map((s) => (
              <li key={s}>
                <Sq r={10} className="tag">
                  {s}
                </Sq>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="carries">
          <SectionHead id="carries" title="Carries" />
          <ul className="gear">
            {m.gear.map((g) => (
              <li key={g.text}>
                <Sq r={10} edge={false} className="gear-icon">
                  <Icon name={g.icon} size={18} />
                </Sq>
                {g.text}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="files">
        <SectionHead id="files" title="In the files" />
        {m.cases.length === 0 ? (
          <Card className="pins-empty">
            <Icon name="archive" />
            <p>Not in a case file yet. The archive is his.</p>
          </Card>
        ) : (
          <ul className="stack">
            {m.cases.map((cid) => {
              const c = caseById[cid]
              return (
                <li key={cid}>
                  <Card to={`/cases/${cid}`} className="case-mini">
                    <span className="case-no">{c.no}</span>
                    <span className="case-mini-body">
                      <span className="case-mini-bn bn">{c.bn}</span>
                      <span className="case-mini-en">{c.en}</span>
                    </span>
                    {c.lead === m.id && <span className="lead-tag">lead</span>}
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {cracked.length > 0 && (
        <section aria-labelledby="cracked">
          <SectionHead id="cracked" title={`Cracked ${cracked.length} clue${cracked.length > 1 ? 's' : ''}`} />
          <ul className="cracked">
            {cracked.map((c) => (
              <li key={c.id}>
                <Link to={`/board/${c.id}`} className="cracked-row" onClick={() => haptic('tap')}>
                  <Icon name={kindById[c.kind].icon} size={18} />
                  <span>{c.title}</span>
                  <span className="mono muted">{caseById[c.case].no}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="pager" aria-label="Team members">
        <Link to={`/team/${prev.id}`} replace className="pager-link" onClick={() => haptic('select')}>
          <Icon name="back" size={18} />
          {prev.short}
        </Link>
        <Link to={`/team/${next.id}`} replace className="pager-link is-next" onClick={() => haptic('select')}>
          {next.short}
          <Icon name="next" size={18} />
        </Link>
      </nav>
    </Screen>
  )
}
