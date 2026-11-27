import { Screen } from '../components/Screen'
import { Badge, Card, IconButton, Meter, SectionHead, Segmented } from '../components/ui'
import { Sq } from '../lib/Sq'
import { Icon } from '../components/Icon'
import { MoonGlyph } from '../components/MoonGlyph'
import { AvatarStack } from '../components/Avatar'
import { Link } from '../lib/router'
import { useStore, type PlaceId } from '../lib/store'
import { useNow } from '../lib/hooks'
import { nightTime, tonight, tideText } from '../lib/sky'
import { bdDate, bdTime, minutesToRead } from '../lib/format'
import { cases } from '../content/cases'
import { chapters } from '../content/chapters'
import { clueById } from '../content/clues'
import { places, placeById } from '../content/places'
import { memberById, team } from '../content/team'
import { unexplained } from '../content/unexplained'

const names = Object.fromEntries(team.map((m) => [m.id, m.short]))

export function Desk() {
  return (
    <Screen
      title="Desk"
      eyebrow="Most Lights"
      heading="Most lights have a person behind them."
      sub="Five brothers, two case files, sixteen chapters, and two things nobody could explain."
    >
      <div className="desk-grid">
        <div className="desk-col">
          <TonightCard />
          <UnexplainedCard />
        </div>
        <div className="desk-col">
        <ReadingCard />
        <section className="desk-cases" aria-labelledby="desk-cases">
          <SectionHead id="desk-cases" title="Case files" action={<Link to="/cases" className="text-link">All cases</Link>} />
          <div className="stack">
            {cases.map((c) => (
              <Card key={c.id} to={`/cases/${c.id}`} className="case-mini">
                <span className="case-no">{c.no}</span>
                <span className="case-mini-body">
                  <span className="case-mini-bn bn">{c.bn}</span>
                  <span className="case-mini-en">{c.en}</span>
                  <span className="case-mini-meta">
                    {c.where.split(',')[0]}, {c.from.slice(0, 4)}
                  </span>
                </span>
                <span className="case-mini-side">
                  <Badge tone={c.open ? 'warn' : 'accent'}>{c.open ? `${c.open} open` : c.status}</Badge>
                  <AvatarStack ids={c.team} size={24} names={names} />
                </span>
              </Card>
            ))}
          </div>
        </section>
        <PinnedCard />
        </div>
        <section className="desk-tools" aria-labelledby="desk-tools">
          <SectionHead id="desk-tools" title="Field tools" action={<Link to="/tools" className="text-link">All tools</Link>} />
          <div className="tool-grid">
            <Card to="/tools/moon" className="tool-tile" r={20}>
              <Icon name="moon" />
              <span className="tool-tile-title">Moon and tide</span>
              <span className="tool-tile-sub">Check a witness</span>
            </Card>
            <Card to="/tools/districts" className="tool-tile" r={20}>
              <Icon name="map" />
              <span className="tool-tile-title">Districts</span>
              <span className="tool-tile-sub">Fakhru is at 34</span>
            </Card>
            <Card to="/tools/kit" className="tool-tile" r={20}>
              <Icon name="kit" />
              <span className="tool-tile-title">Field kit</span>
              <span className="tool-tile-sub">Two checklists</span>
            </Card>
            <Card to="/tools/report" className="tool-tile" r={20}>
              <Icon name="pen" />
              <span className="tool-tile-title">Report a light</span>
              <span className="tool-tile-sub">Ask our questions</span>
            </Card>
          </div>
        </section>
      </div>
    </Screen>
  )
}

function TonightCard() {
  const now = useNow(60000)
  const placeId = useStore((s) => s.place)
  const setPref = useStore((s) => s.set)
  const place = placeById[placeId]
  const t = tonight(now, place.lat, place.lng)
  const tide = tideText(t.tide)
  return (
    <Card as="section" className="tonight" aria-labelledby="tonight-title">
      <div className="tonight-top">
        <MoonGlyph fraction={t.fraction} waxing={t.waxing} size={76} />
        <div className="tonight-head">
          <p className="eyebrow">Tonight in {place.name}</p>
          <h2 id="tonight-title" className="tonight-title">
            {t.phase}
          </h2>
          <p className="tonight-meta mono">
            {Math.round(t.fraction * 100)}% lit · day {Math.floor(t.age) + 1} of the moon
          </p>
        </div>
        <IconButton icon="next" label="Open moon and tide" to="/tools/moon" />
      </div>
      <p className="tonight-line">{t.line}</p>
      <dl className="facts">
        <div>
          <dt>Sunset</dt>
          <dd className="mono">{bdTime(t.sunset)}</dd>
        </div>
        <div>
          <dt>Moonrise</dt>
          <dd className="mono">{nightTime(t.moonrise, t.sunset)}</dd>
        </div>
        <div>
          <dt>Moonset</dt>
          <dd className="mono">{nightTime(t.moonset, t.sunset)}</dd>
        </div>
        <div>
          <dt>Tide</dt>
          <dd>
            {tide.title}
            {tide.bn && <span className="bn muted"> {tide.bn}</span>}
          </dd>
        </div>
      </dl>
      <div className="tonight-foot">
        <Segmented<PlaceId>
          label="Place"
          size="sm"
          value={placeId}
          onChange={(v) => setPref('place', v)}
          options={places.map((p) => ({ value: p.id, label: p.id === 'chapitala' ? 'Chapitala' : p.name }))}
        />
      </div>
      <p className="tiny muted">
        {bdDate(now)}, Bangladesh time. Computed on this device.
      </p>
    </Card>
  )
}

function ReadingCard() {
  const last = useStore((s) => s.lastChapter)
  const progress = useStore((s) => s.progress)
  const ch = chapters.find((c) => c.n === (last ?? 1)) ?? chapters[0]
  const p = progress[ch.n] ?? 0
  const done = chapters.filter((c) => (progress[c.n] ?? 0) >= 0.92).length
  const fresh = last === null
  return (
    <Card to={`/read/${ch.n}`} className="reading" aria-label={fresh ? 'Start reading' : `Continue chapter ${ch.n}`}>
      <span className="reading-kicker">
        <Icon name="book" size={18} />
        {fresh ? 'Start reading' : 'Continue reading'}
      </span>
      <span className="reading-title bn">দোয়ানির ডাক</span>
      <span className="reading-ch">
        <span className="bn">
          {ch.n}. {ch.bn}
        </span>
        <span className="muted"> {ch.en}</span>
      </span>
      <Meter value={fresh ? 0 : p} label={`Chapter ${ch.n} progress`} />
      <span className="reading-meta mono">
        {fresh ? `16 chapters · about ${minutesToRead(ch.words)} min for the first` : `${done} of 16 finished · ${Math.round(p * 100)}% of this one`}
      </span>
    </Card>
  )
}

function UnexplainedCard() {
  return (
    <Card to="/unexplained" className="open-card">
      <Sq as="span" r={14} edge={false} className="open-card-icon">
        <Icon name="lights" size={26} />
      </Sq>
      <span className="open-card-body">
        <span className="open-card-title">Still unexplained</span>
        <span className="open-card-sub">
          {unexplained.map((u) => u.en).join(' and ')}. Everyone else is accounted for.
        </span>
      </span>
      <Icon name="next" size={18} />
    </Card>
  )
}

function PinnedCard() {
  const pins = useStore((s) => s.pins)
  const list = pins.map((id) => clueById[id]).filter(Boolean)
  return (
    <section className="desk-pins" aria-labelledby="desk-pins">
      <SectionHead
        id="desk-pins"
        title="Pinned clues"
        action={<Link to="/board" className="text-link">Board</Link>}
      />
      {list.length === 0 ? (
        <Card className="pins-empty">
          <Icon name="pin" />
          <p>
            Nothing pinned yet. On the board, press and hold a clue or tap its pin. It will wait for you here.
          </p>
        </Card>
      ) : (
        <ul className="pin-row">
          {list.slice(0, 8).map((c) => (
            <li key={c.id}>
              <Card to={`/board/${c.id}`} className="pin-chip" r={14}>
                <Icon name="pinned" size={16} />
                <span className="pin-chip-title">{c.title}</span>
                <span className="pin-chip-by">
                  {c.by.length ? c.by.map((b) => memberById[b].short).join(', ') : c.helpers?.join(', ')}
                </span>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
