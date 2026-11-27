import { useMemo, useState } from 'react'
import { Screen } from '../components/Screen'
import { Button, Card, Check, Empty, Field, IconButton, Meter } from '../components/ui'
import { Sheet } from '../components/Sheet'
import { toast } from '../components/Toast'
import { allDistricts, divisions, fakhru } from '../content/districts'
import { useStore } from '../lib/store'
import { fold } from '../lib/format'
import { haptic } from '../lib/haptics'

export function DistrictsTool() {
  const ticked = useStore((s) => s.districts)
  const toggle = useStore((s) => s.toggleDistrict)
  const setAll = useStore((s) => s.setDistricts)
  const [q, setQ] = useState('')
  const [confirm, setConfirm] = useState(false)
  const set = useMemo(() => new Set(ticked), [ticked])

  const terms = fold(q).trim()
  const shown = divisions
    .map((v) => ({
      ...v,
      list: v.districts.filter((d) => !terms || fold(`${d.en} ${d.bn} ${v.en}`).includes(terms)),
    }))
    .filter((v) => v.list.length)

  const mine = ticked.length

  return (
    <Screen title="Districts" back="/tools" sub="Sixty-four districts. Fakhru keeps his list on the last page of his diary.">
      <Card className="district-score" r={28}>
        <div className="score-row">
          <div>
            <p className="said-label mono">You</p>
            <p className="score-big">
              {mine}
              <span className="muted"> / 64</span>
            </p>
            <Meter value={mine / 64} label="Your districts" />
          </div>
          <div>
            <p className="said-label mono">Fakhru</p>
            <p className="score-big">
              {fakhru.count}
              <span className="muted"> / 64</span>
            </p>
            <Meter value={fakhru.count / 64} label="Fakhru’s districts" />
          </div>
        </div>
        <p className="rule">
          <span className="bn">{fakhru.rule.bn}</span>
          <span className="muted"> {fakhru.rule.en}</span>
        </p>
        <ul className="ticks">
          {fakhru.ticks.map((t) => (
            <li key={t.n}>
              <span className="mono tick-n">{t.n}</span>
              <span>
                {t.district}. {t.note}
              </span>
            </li>
          ))}
          <li>
            <span className="mono tick-n">?</span>
            <span className="bn">{fakhru.never}</span>
          </li>
        </ul>
      </Card>

      <div className="district-tools">
        <Field
          type="search"
          icon="search"
          placeholder="Find a district, in English or বাংলা"
          aria-label="Find a district"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          trailing={q ? <IconButton icon="close" label="Clear" size="sm" onClick={() => setQ('')} className="field-clear" /> : null}
        />
        {mine > 0 && (
          <Button size="sm" icon="reset" variant="ghost" onClick={() => setConfirm(true)}>
            Clear my list
          </Button>
        )}
      </div>

      {shown.length === 0 && (
        <Empty icon="map" title="No district by that name">
          Spellings vary. Try the first few letters, like “Cox” or “চট্ট”.
        </Empty>
      )}

      {shown.map((v) => {
        const have = v.districts.filter((d) => set.has(d.id)).length
        return (
          <section key={v.id} className="division" aria-labelledby={`div-${v.id}`}>
            <header className="division-head">
              <h2 id={`div-${v.id}`} className="block-title">
                {v.en} <span className="bn muted">{v.bn}</span>
              </h2>
              <span className="mono muted">
                {have} / {v.districts.length}
              </span>
            </header>
            <ul className="district-grid">
              {v.list.map((d) => (
                <li key={d.id}>
                  <Check checked={set.has(d.id)} onChange={() => toggle(d.id)} hint={<span className="bn">{d.bn}</span>}>
                    {d.en}
                  </Check>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <p className="tiny muted">
        {allDistricts.length} districts across {divisions.length} divisions. Saved on this device only.
      </p>

      <Sheet
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Clear your districts?"
        footer={
          <div className="sheet-actions">
            <Button onClick={() => setConfirm(false)}>Keep them</Button>
            <Button
              variant="danger"
              icon="reset"
              feel="warning"
              onClick={() => {
                const before = ticked
                setAll([])
                setConfirm(false)
                toast(`Cleared ${before.length} district${before.length === 1 ? '' : 's'}`, {
                  icon: 'reset',
                  feel: false,
                  action: {
                    label: 'Undo',
                    run: () => {
                      setAll(before)
                      haptic('success')
                    },
                  },
                })
              }}
            >
              Clear {mine}
            </Button>
          </div>
        }
      >
        <p>This removes all {mine} ticks from this device. You can undo it for a few seconds afterwards.</p>
      </Sheet>
    </Screen>
  )
}
