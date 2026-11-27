import { useMemo, useState } from 'react'
import { Screen } from '../components/Screen'
import { Button, Card, Field, SectionHead, Segmented } from '../components/ui'
import { Icon } from '../components/Icon'
import { MoonGlyph } from '../components/MoonGlyph'
import { useStore, type PlaceId } from '../lib/store'
import { places, placeById } from '../content/places'
import { fromBd, hijri, lunation, moonIllumination, phaseName, phasesBetween, sky, toBdInput } from '../lib/astro'
import { nightTime, skyVerdict, tideText, tonight } from '../lib/sky'
import { bdDate, bdTime } from '../lib/format'
import { haptic } from '../lib/haptics'

const presets: { label: string; note: string; place: PlaceId; date: string; time: string }[] = [
  { label: 'Kader’s dusk', note: 'The witness said moonlight, at low tide', place: 'mongla', date: '2027-10-29', time: '17:30' },
  { label: 'The Calling', note: 'Night three at the Doyani', place: 'mongla', date: '2027-12-22', time: '01:40' },
  { label: 'Night seven', note: 'The lights come back', place: 'mongla', date: '2027-12-26', time: '01:55' },
  { label: 'The bells start', note: 'First night at nanur bari', place: 'chapitala', date: '2026-12-17', time: '01:40' },
  { label: 'Extraction night', note: 'They dig after moonset', place: 'chapitala', date: '2026-12-21', time: '03:45' },
]

const KIND_LABEL = { new: 'New moon', first: 'First quarter', full: 'Full moon', last: 'Last quarter' } as const

export function MoonTool() {
  const savedPlace = useStore((s) => s.place)
  const setPref = useStore((s) => s.set)
  const init = toBdInput(Date.now())
  const [place, setPlace] = useState<PlaceId>(savedPlace)
  const [date, setDate] = useState(init.date)
  const [time, setTime] = useState(init.time)
  const p = placeById[place]
  const t = fromBd(date, time || '00:00')

  const data = useMemo(() => {
    if (t === null) return null
    const ill = moonIllumination(t)
    const night = tonight(t, p.lat, p.lng)
    const reading = sky(t, p.lat, p.lng)
    const lun = lunation(t)
    const phases = phasesBetween(t - 3 * 86400000, t + 30 * 86400000).slice(0, 5)
    return { ill, night, reading, lun, phases, phase: phaseName(t), hijri: hijri(t) }
  }, [t, p.lat, p.lng])

  const now = () => {
    const v = toBdInput(Date.now())
    setDate(v.date)
    setTime(v.time)
    haptic('tap')
  }

  const verdict = data && t !== null ? skyVerdict(data.reading, Math.abs(t - Date.now()) < 30 * 60000) : null
  const tide = data ? tideText(data.night.tide) : null

  return (
    <Screen title="Moon and tide" back="/tools" sub="Ghosts do not check moonrise tables. People do.">
      <Card className="moon-form" r={28}>
        <div className="setting">
          <p className="setting-label">Place</p>
          <Segmented<PlaceId>
            label="Place"
            block
            value={place}
            onChange={(v) => {
              setPlace(v)
              setPref('place', v)
            }}
            options={places.map((x) => ({ value: x.id, label: x.id === 'chapitala' ? 'Chapitala' : x.name }))}
          />
        </div>
        <div className="moon-inputs">
          <Field
            label="Date"
            type="date"
            value={date}
            min="1900-01-01"
            max="2100-12-31"
            onChange={(e) => setDate(e.target.value)}
            error={t === null ? 'Pick a full date, like 29 Oct 2027.' : undefined}
          />
          <Field label="Time, Bangladesh" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div className="row-gap">
          <Button size="sm" icon="clock" onClick={now} feel={false}>
            Now
          </Button>
          <span className="tiny muted">Times are Bangladesh time, UTC+6. Positions are good to a few minutes.</span>
        </div>
      </Card>

      {data && verdict && tide && (
        <>
          <Card className={`moon-result tone-${verdict.tone}`} r={28} aria-live="polite">
            <div className="moon-result-top">
              <MoonGlyph fraction={data.ill.fraction} waxing={data.ill.waxing} size={104} />
              <div>
                <p className="eyebrow">
                  {bdDate(t!)} at {bdTime(t!)}, {p.name}
                </p>
                <h2 className="moon-verdict">{verdict.title}</h2>
                <p className="moon-note">{verdict.note}</p>
              </div>
            </div>
            <dl className="facts facts-wide">
              <div>
                <dt>Phase</dt>
                <dd>{data.phase}</dd>
              </div>
              <div>
                <dt>Lit</dt>
                <dd className="mono">{Math.round(data.ill.fraction * 100)}%</dd>
              </div>
              <div>
                <dt>Moon age</dt>
                <dd className="mono">{data.lun.age.toFixed(1)} days</dd>
              </div>
              <div>
                <dt>Sunset</dt>
                <dd className="mono">{bdTime(data.night.sunset)}</dd>
              </div>
              <div>
                <dt>Moonrise</dt>
                <dd className="mono">{nightTime(data.night.moonrise, data.night.sunset)}</dd>
              </div>
              <div>
                <dt>Moonset</dt>
                <dd className="mono">{nightTime(data.night.moonset, data.night.sunset)}</dd>
              </div>
            </dl>
            <p className="moon-line">{data.night.line}</p>
          </Card>

          <div className="moon-cols">
            <Card className="tide-card" r={20}>
              <p className="said-label mono">Tide range</p>
              <p className="tide-title">
                <Icon name="tide" />
                {tide.title}
                {tide.bn && <span className="bn"> {tide.bn}</span>}
              </p>
              <p className="muted">{tide.note}</p>
              <p className="tiny muted">
                From the moon alone. This tool cannot give high-water times, which depend on the channel. Ask a skipper.
              </p>
            </Card>
            <Card className="tide-card" r={20}>
              <p className="said-label mono">Lunar calendar</p>
              <p className="tide-title">
                <Icon name="calendar" />
                {data.hijri ?? 'Not available in this browser'}
              </p>
              <p className="tiny muted">
                Umm al-Qura reckoning. Bangladesh sights the moon locally, so its date can run a day or two behind.
              </p>
            </Card>
          </div>

          <section aria-labelledby="next-phases">
            <SectionHead id="next-phases" title="Phases around this date" />
            <ul className="phase-list">
              {data.phases.map((e) => (
                <li key={e.time}>
                  <MoonGlyph
                    fraction={e.kind === 'new' ? 0 : e.kind === 'full' ? 1 : 0.5}
                    waxing={e.kind !== 'last'}
                    size={32}
                  />
                  <span>{KIND_LABEL[e.kind]}</span>
                  <span className="mono muted">
                    {bdDate(e.time)}, {bdTime(e.time)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <section aria-labelledby="presets">
        <SectionHead id="presets" title="From the files" sub="Load a moment from either case and see what the sky allowed." />
        <ul className="preset-list">
          {presets.map((x) => (
            <li key={x.label}>
              <Card
                className="preset"
                r={20}
                onClick={() => {
                  setPlace(x.place)
                  setDate(x.date)
                  setTime(x.time)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <span className="preset-title">{x.label}</span>
                <span className="preset-note">{x.note}</span>
                <span className="preset-meta mono">
                  {bdDate(fromBd(x.date, x.time)!)}, {x.time}, {placeById[x.place].name}
                </span>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </Screen>
  )
}
