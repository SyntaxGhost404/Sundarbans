import { useMemo, useState } from 'react'
import { Screen } from '../components/Screen'
import { Button, Card, Chip, Field, SectionHead, Segmented, TextArea } from '../components/ui'
import { Icon } from '../components/Icon'
import { toast } from '../components/Toast'
import { useStore, type PlaceId, type ReportDraft } from '../lib/store'
import { fromBd, sky, tideRange } from '../lib/astro'
import { skyVerdict, tideText } from '../lib/sky'
import { bdDate } from '../lib/format'
import { shareText, copyText } from '../lib/share'
import { places, placeById } from '../content/places'
import { haptic } from '../lib/haptics'

const KINDS = ['Light', 'Sound', 'Voice', 'Trace', 'Other']

function compose(r: ReportDraft) {
  const lines: string[] = ['Most Lights field report', '']
  const add = (k: string, v: string) => v.trim() && lines.push(`${k}: ${v.trim()}`)
  add('Kind', r.kind.join(', '))
  add('What happened', r.what)
  add('Where', r.where)
  const t = r.date ? fromBd(r.date, r.time || '00:00') : null
  if (t !== null) add('When', `${bdDate(t)}${r.time ? `, ${r.time}` : ''}, Bangladesh time`)
  if (t !== null && r.near) {
    const p = placeById[r.near]
    const v = skyVerdict(sky(t, p.lat, p.lng))
    const tide = tideText(tideRange(t))
    add('Sky', `${v.title}. ${v.note} (computed for ${p.name})`)
    add('Tide', `${tide.title}${tide.bn ? ` (${tide.bn})` : ''}`)
  }
  add('Anyone else saw it', { yes: 'Yes', no: 'No', unsure: 'Not sure', '': '' }[r.others])
  add('Does it keep a timetable', r.timetable)
  add('What it leaves behind', r.leaves)
  add('Who gains if people believe it', r.gains)
  return lines.join('\n')
}

export function ReportTool() {
  const r = useStore((s) => s.report)
  const set = useStore((s) => s.setReport)
  const clear = useStore((s) => s.clearReport)
  const restore = useStore((s) => s.setReport)
  const [error, setError] = useState<string | undefined>()
  const [fallback, setFallback] = useState<string | null>(null)
  const text = useMemo(() => compose(r), [r])
  const t = r.date ? fromBd(r.date, r.time || '00:00') : null
  const preview = t !== null && r.near ? skyVerdict(sky(t, placeById[r.near].lat, placeById[r.near].lng)) : null

  const check = () => {
    if (!r.what.trim()) {
      setError('Write a line about what you saw or heard first.')
      haptic('error')
      document.getElementById('report-what')?.focus()
      return false
    }
    setError(undefined)
    return true
  }

  const onShare = async () => {
    if (!check()) return
    const res = await shareText('Field report', text)
    if (res === 'shared') toast('Shared', { icon: 'share' })
    else if (res === 'copied') toast('Copied. Paste it wherever you like.', { icon: 'copy' })
    else if (res === 'failed') {
      setFallback(text)
      toast('This browser blocked sharing and copying. The report is below to copy by hand.', { icon: 'warn', feel: 'warning' })
    }
  }

  const onCopy = async () => {
    if (!check()) return
    if (await copyText(text)) toast('Copied. Paste it wherever you like.', { icon: 'copy' })
    else {
      setFallback(text)
      toast('Copying is blocked here. Select the text below and copy it by hand.', { icon: 'warn', feel: 'warning' })
    }
  }

  return (
    <Screen
      title="Report a light"
      back="/tools"
      sub="Write it down while it is fresh. Then answer the questions we would ask before anyone says ghost."
    >
      <Card className="report-form" r={28}>
        <div className="setting">
          <p className="setting-label">What kind of thing</p>
          <div className="chips" role="group" aria-label="What kind of thing">
            {KINDS.map((k) => (
              <Chip
                key={k}
                on={r.kind.includes(k)}
                onClick={() => set({ kind: r.kind.includes(k) ? r.kind.filter((x) => x !== k) : [...r.kind, k] })}
              >
                {k}
              </Chip>
            ))}
          </div>
        </div>
        <TextArea
          id="report-what"
          label="What did you see or hear?"
          rows={4}
          placeholder="Pale lights low over the water, five or six, moving against the current."
          value={r.what}
          onChange={(e) => {
            set({ what: e.target.value })
            if (error && e.target.value.trim()) setError(undefined)
          }}
          hint={error ? <span className="field-error">{error}</span> : undefined}
        />
        <Field label="Where were you?" placeholder="A boat at the confluence, facing north" value={r.where} onChange={(e) => set({ where: e.target.value })} />
        <div className="moon-inputs">
          <Field label="Date" type="date" value={r.date} onChange={(e) => set({ date: e.target.value })} />
          <Field label="Time, Bangladesh" type="time" value={r.time} onChange={(e) => set({ time: e.target.value })} />
        </div>
        <div className="setting">
          <p className="setting-label">Nearest place, for the moon check</p>
          <div className="chips" role="group" aria-label="Nearest place">
            {[{ id: '' as PlaceId | '', name: 'Skip' }, ...places].map((p) => (
              <Chip key={p.id || 'skip'} on={r.near === p.id} onClick={() => set({ near: p.id })}>
                {p.name}
              </Chip>
            ))}
          </div>
          {preview && (
            <p className={`sky-preview tone-${preview.tone}`}>
              <Icon name="moon" size={18} />
              <span>
                <strong>{preview.title}.</strong> {preview.note}
              </span>
            </p>
          )}
          {r.near && !r.date && <p className="field-hint">Add a date to see what the sky allowed.</p>}
        </div>
      </Card>

      <section aria-labelledby="our-questions">
        <SectionHead id="our-questions" title="Our questions" sub="Every one of them cracked something in the cases." />
        <Card className="report-form" r={28}>
          <div className="setting">
            <p className="setting-label">Did anyone else see it?</p>
            <Segmented<ReportDraft['others']>
              label="Did anyone else see it?"
              block
              value={r.others}
              onChange={(v) => set({ others: v })}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
                { value: 'unsure', label: 'Not sure' },
              ]}
            />
          </div>
          <TextArea
            label="Does it keep a timetable?"
            rows={2}
            hint="The bells in Raja Chapitala started at 1:30 every night. Ghosts do not need timers."
            value={r.timetable}
            onChange={(e) => set({ timetable: e.target.value })}
          />
          <TextArea
            label="What does it leave behind?"
            rows={2}
            hint="Soil, a smell, a wire, a footprint, a price sticker."
            value={r.leaves}
            onChange={(e) => set({ leaves: e.target.value })}
          />
          <TextArea
            label="Who gains if people believe it?"
            rows={2}
            hint="A scared village stays home. That is useful to somebody."
            value={r.gains}
            onChange={(e) => set({ gains: e.target.value })}
          />
        </Card>
      </section>

      <section aria-labelledby="report-out">
        <SectionHead id="report-out" title="Your report" sub="Nothing is sent from this site. Share it with someone you trust." />
        <Card className="report-out" r={20}>
          <pre className="report-text">{text}</pre>
        </Card>
        {fallback && (
          <TextArea
            label="Copy by hand"
            readOnly
            rows={8}
            value={fallback}
            onFocus={(e) => e.currentTarget.select()}
            hint="Press and hold, or select all, then copy."
          />
        )}
        <div className="report-actions">
          <Button variant="primary" icon="share" onClick={onShare} feel={false}>
            Share
          </Button>
          <Button icon="copy" onClick={onCopy} feel={false}>
            Copy
          </Button>
          <Button
            variant="ghost"
            icon="reset"
            onClick={() => {
              const before = r
              clear()
              setFallback(null)
              setError(undefined)
              toast('Report cleared', { icon: 'reset', feel: 'tap', action: { label: 'Undo', run: () => restore(before) } })
            }}
          >
            Clear
          </Button>
        </div>
        <p className="tiny muted">Your draft is kept on this device until you clear it.</p>
      </section>
    </Screen>
  )
}
