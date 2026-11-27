import { Screen } from '../components/Screen'
import { Button, Card, Meter } from '../components/ui'
import { Icon } from '../components/Icon'
import { chapters, totalWords } from '../content/chapters'
import { useStore } from '../lib/store'
import { bnNum, isoDay, minutesToRead } from '../lib/format'

export function ReadIndex() {
  const progress = useStore((s) => s.progress)
  const last = useStore((s) => s.lastChapter)
  const done = chapters.filter((c) => (progress[c.n] ?? 0) >= 0.92).length
  const resume = chapters.find((c) => c.n === last)
  return (
    <Screen
      title="Read"
      eyebrow="Case 02 · the full story, in Bangla"
      heading={<span className="bn">দোয়ানির ডাক</span>}
      sub={`The Call of the Doyani. Sixteen chapters, about ${Math.round(totalWords / 1000)} thousand words, about ${Math.round(minutesToRead(totalWords) / 60)} hours.`}
    >
      <Card className="read-head" r={20}>
        <div className="read-head-row">
          <span>
            <span className="read-head-big">{done}</span>
            <span className="muted"> of 16 finished</span>
          </span>
          {resume ? (
            <Button to={`/read/${resume.n}`} variant="primary" icon="book">
              Continue chapter {resume.n}
            </Button>
          ) : (
            <Button to="/read/1" variant="primary" icon="book">
              Start at chapter 1
            </Button>
          )}
        </div>
        <Meter value={done / 16} label="Chapters finished" />
        <p className="tiny muted">
          Your place is saved on this device. Spoilers on the rest of the site open by themselves as you read.
        </p>
      </Card>

      <ol className="toc">
        {chapters.map((c) => {
          const p = progress[c.n] ?? 0
          const d = isoDay(c.date)
          const state = p >= 0.92 ? 'done' : p > 0.02 ? 'reading' : 'new'
          return (
            <li key={c.n}>
              <Card to={`/read/${c.n}`} className={`toc-item is-${state}`} r={20}>
                <span className="toc-num bn" aria-hidden="true">
                  {bnNum(c.n)}
                </span>
                <span className="toc-body">
                  <span className="toc-bn bn">{c.bn}</span>
                  <span className="toc-en">
                    {c.n}. {c.en}
                  </span>
                  <span className="toc-meta mono">
                    {d.label} · {c.where} · {minutesToRead(c.words)} min
                  </span>
                  {state === 'reading' && <Meter value={p} label={`Chapter ${c.n} progress`} />}
                </span>
                <span className="toc-state" aria-label={state === 'done' ? 'Finished' : state === 'reading' ? 'In progress' : 'Not started'}>
                  {state === 'done' ? <Icon name="check" size={18} /> : <Icon name="next" size={18} />}
                </span>
              </Card>
            </li>
          )
        })}
      </ol>
    </Screen>
  )
}
