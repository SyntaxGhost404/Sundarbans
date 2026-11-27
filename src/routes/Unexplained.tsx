import { Screen } from '../components/Screen'
import { Card } from '../components/ui'
import { Icon } from '../components/Icon'
import { HoldToReveal } from '../components/HoldToReveal'
import { creed, nightStrip, trailCam, unexplained, type Mark, type Sighting } from '../content/unexplained'
import { Link } from '../lib/router'
import { isoDay } from '../lib/format'
import { haptic } from '../lib/haptics'
import { useUnlocked } from '../lib/ui'
import { Sq } from '../lib/Sq'

export function Unexplained() {
  const unlocked = useUnlocked(16)
  return (
    <Screen
      title="Unexplained"
      sub="Everything else in both cases has a person behind it. These two do not, as far as anyone can tell."
    >
      <Card className="creed" r={28}>
        <Icon name="quote" size={26} />
        <p className="creed-bn bn">{creed.bn}</p>
        <p className="creed-en">{creed.en}</p>
        <p className="creed-by mono">{creed.by}</p>
      </Card>

      {!unlocked && (
        <Sq as="p" r={14} edge={false} className="notice">
          <Icon name="info" size={18} />
          <span>
            This page reaches into the last chapter. Later sightings stay held back until you hold them, or until you have read
            that far.
          </span>
        </Sq>
      )}

      {unexplained.map((u) => (
        <section key={u.id} className="phen" aria-labelledby={`phen-${u.id}`}>
          <header className="phen-head">
            <h2 id={`phen-${u.id}`} className="phen-title">
              {u.en}
            </h2>
            <p className="phen-bn bn">{u.bn}</p>
            <p className="phen-summary">{u.summary}</p>
          </header>
          <ol className="sightings">
            {u.sightings.map((s) => (
              <li key={s.date + s.time}>
                {s.chapter && s.chapter >= 16 ? (
                  <HoldToReveal chapter={16} lines={3} label="Hold to reveal this sighting">
                    <SightingCard s={s} />
                  </HoldToReveal>
                ) : (
                  <SightingCard s={s} />
                )}
              </li>
            ))}
          </ol>
          <div className="weigh">
            <Card className="weigh-col" r={20}>
              <p className="said-label mono">Ordinary answers people gave</p>
              <ul>
                {u.candidates.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </Card>
            <Card className="weigh-col" r={20}>
              <p className="said-label mono">Why none of them fit</p>
              <ul>
                {u.against.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </Card>
          </div>
          <p className="phen-lore">
            <span className="bn">{u.lore}</span>
          </p>
        </section>
      ))}

      <section className="phen" aria-labelledby="strip-title">
        <header className="phen-head">
          <h2 id="strip-title" className="phen-title">
            The two nights, minute by minute
          </h2>
          <p className="phen-summary">Solid marks are times from the story. Hollow marks are close estimates.</p>
        </header>
        <HoldToReveal chapter={16} lines={4} label="Hold to see both nights">
          <div className="strips">
            {nightStrip.map((n) => (
              <NightStrip key={n.night} night={n.night} marks={n.marks} />
            ))}
          </div>
          <Card className="cam-note" r={20}>
            <p className="said-label mono">The trail camera</p>
            <p>{trailCam.night3}</p>
            <p>{trailCam.night7}</p>
            <p>{trailCam.audio}</p>
          </Card>
        </HoldToReveal>
      </section>

      <Card className="ask" r={20}>
        <p>
          Seen something like it? Write it down the way we would, with the moon and the tide, and decide for yourself what it
          was.
        </p>
        <Link to="/tools/report" className="text-link" onClick={() => haptic('tap')}>
          Report a light
          <Icon name="next" size={16} />
        </Link>
      </Card>
    </Screen>
  )
}

function SightingCard({ s }: { s: Sighting }) {
  const d = isoDay(s.date)
  return (
    <Card className="sighting" r={20}>
      <div className="sighting-head">
        <span className="sighting-night">{s.night}</span>
        <span className="mono muted">
          {d.label} {d.y}, {s.time}
        </span>
      </div>
      <p className="sighting-what">{s.what}</p>
      <p className="sighting-who">
        <Icon name="eye" size={16} />
        <span>{s.who}</span>
      </p>
      {s.ended && (
        <p className="sighting-ended">
          <Icon name="moon" size={16} />
          <span>{s.ended}</span>
        </p>
      )}
      {s.chapter && (
        <Link to={`/read/${s.chapter}`} className="chapter-link mono" onClick={() => haptic('tap')}>
          Ch {s.chapter}
        </Link>
      )}
    </Card>
  )
}

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

const clock = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

/** A ruler for one night. The window fits the marks, so close ones stay apart. */
function NightStrip({ night, marks }: { night: string; marks: Mark[] }) {
  const times = marks.map((m) => toMin(m.t))
  const from = Math.floor((Math.min(...times) - 5) / 5) * 5
  const to = Math.ceil((Math.max(...times) + 5) / 5) * 5
  const span = to - from
  const step = span <= 40 ? 5 : 15
  const labelEvery = span <= 40 ? 10 : 30
  const pos = (m: number) => `${((m - from) / span) * 100}%`
  const ticks: number[] = []
  for (let m = Math.ceil(from / step) * step; m <= to; m += step) ticks.push(m)
  return (
    <figure className="strip">
      <figcaption className="strip-title">{night}</figcaption>
      <div className="strip-track" role="img" aria-label={`${night}: ${marks.map((m) => `${m.approx ? 'about ' : ''}${m.t}, ${m.label}`).join('; ')}`}>
        {ticks.map((m) => (
          <span key={m} className={`strip-tick${m % labelEvery ? ' is-minor' : ''}`} style={{ left: pos(m) }}>
            {m % labelEvery === 0 && <span className="strip-tick-label">{clock(m)}</span>}
          </span>
        ))}
        {marks.map((m) => (
          <span
            key={m.t + m.label}
            className={`strip-mark strip-${m.kind}${m.approx ? ' is-approx' : ''}`}
            style={{ left: pos(toMin(m.t)) }}
          />
        ))}
      </div>
      <ol className="strip-legend">
        {marks.map((m) => (
          <li key={m.t + m.label}>
            <span className={`strip-key strip-${m.kind}${m.approx ? ' is-approx' : ''}`} aria-hidden="true" />
            <span className="mono">{m.approx ? `about ${m.t}` : m.t}</span>
            <span>{m.label}</span>
          </li>
        ))}
      </ol>
    </figure>
  )
}
