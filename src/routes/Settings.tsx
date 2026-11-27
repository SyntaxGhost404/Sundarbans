import { useState, type ReactNode } from 'react'
import { Screen } from '../components/Screen'
import { Button, Card, Segmented, Toggle } from '../components/ui'
import { Icon, type IconName } from '../components/Icon'
import { Sheet } from '../components/Sheet'
import { toast } from '../components/Toast'
import { useStore, type Leading, type Theme } from '../lib/store'
import { haptic, hapticsSupport } from '../lib/haptics'
import { storageAvailable } from '../lib/storage'
import { squircleMode } from '../lib/squircle'
import { Link } from '../lib/router'
import { Sq } from '../lib/Sq'

function Row({ icon, title, note, children }: { icon: IconName; title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <div className="set-row">
      <Sq as="span" r={10} edge={false} className="set-icon">
        <Icon name={icon} size={20} />
      </Sq>
      <span className="set-text">
        <span className="set-title">{title}</span>
        {note && <span className="set-note">{note}</span>}
      </span>
      <span className="set-control">{children}</span>
    </div>
  )
}

const hapticNote = {
  vibrate: 'Short, quiet taps on phones that support them. Most desktops ignore this.',
  ios: 'iPhone gives a light tick on iOS 18 and later. Older versions stay silent.',
  none: 'This browser has no haptics, so nothing will happen here. The setting is saved for when you use a phone.',
}

export function Settings() {
  const s = useStore()
  const [confirm, setConfirm] = useState(false)
  const stored = storageAvailable()

  return (
    <Screen title="Settings" back="/" sub="Everything here is saved on this device only.">
      <section className="set-group" aria-labelledby="set-look">
        <h2 id="set-look" className="block-title">
          Look and feel
        </h2>
        <Card className="set-card" r={20}>
          <div className="set-stack">
            <p className="set-title">Theme</p>
            <Segmented<Theme>
              label="Theme"
              block
              value={s.theme}
              onChange={(v) => s.set('theme', v)}
              options={[
                { value: 'system', label: 'System' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          </div>
          <Row icon="haptic" title="Haptic feedback" note={hapticNote[hapticsSupport]}>
            <Toggle checked={s.haptics} onChange={(v) => s.set('haptics', v)} label="Haptic feedback" />
          </Row>
          {s.haptics && (
            <div className="haptic-test">
              <span className="tiny muted">Try them:</span>
              <Button size="sm" feel={false} onClick={() => haptic('tap')}>
                Tap
              </Button>
              <Button size="sm" feel={false} onClick={() => haptic('success')}>
                Success
              </Button>
              <Button size="sm" feel={false} onClick={() => haptic('warning')}>
                Warning
              </Button>
            </div>
          )}
          <Row
            icon="spark"
            title="Reduce motion"
            note="Cuts slides and springs down to simple fades. Your system setting is also respected."
          >
            <Toggle checked={s.reduceMotion} onChange={(v) => s.set('reduceMotion', v)} label="Reduce motion" />
          </Row>
        </Card>
      </section>

      <section className="set-group" aria-labelledby="set-spoil">
        <h2 id="set-spoil" className="block-title">
          Spoilers
        </h2>
        <Card className="set-card" r={20}>
          <Row
            icon={s.spoilers ? 'eye' : 'eyeOff'}
            title="Show every answer"
            note="Off: answers wait behind a press and hold, and open by themselves once you have read that chapter. On: everything is shown."
          >
            <Toggle checked={s.spoilers} onChange={(v) => s.set('spoilers', v)} label="Show every answer" />
          </Row>
        </Card>
      </section>

      <section className="set-group" aria-labelledby="set-read">
        <h2 id="set-read" className="block-title">
          Reading
        </h2>
        <Card className="set-card" r={20}>
          <div className="set-stack">
            <p className="set-title">Text size</p>
            <Segmented<string>
              label="Text size"
              block
              value={String(s.readSize)}
              onChange={(v) => s.set('readSize', Number(v))}
              options={[
                { value: '17', label: 'Small' },
                { value: '19', label: 'Medium' },
                { value: '21', label: 'Large' },
                { value: '24', label: 'Huge' },
              ]}
            />
          </div>
          <div className="set-stack">
            <p className="set-title">Line spacing</p>
            <Segmented<Leading>
              label="Line spacing"
              block
              value={s.readLeading}
              onChange={(v) => s.set('readLeading', v)}
              options={[
                { value: 'tight', label: 'Tight' },
                { value: 'normal', label: 'Normal' },
                { value: 'loose', label: 'Loose' },
              ]}
            />
          </div>
          <Sq as="p" r={14} edge={false} className="reader-sample bn" style={{ fontSize: s.readSize, lineHeight: { tight: 1.7, normal: 1.9, loose: 2.1 }[s.readLeading] }}>
            আকাশে তখনো চাঁদ নেই।
          </Sq>
        </Card>
      </section>

      <section className="set-group" aria-labelledby="set-data">
        <h2 id="set-data" className="block-title">
          Your data
        </h2>
        <Card className="set-card" r={20}>
          <Row
            icon="archive"
            title={stored ? 'Saved on this device' : 'Not saved after you close this tab'}
            note={
              stored
                ? 'Reading progress, pins, districts, checklists and your report draft. Nothing leaves this device.'
                : 'This browser is blocking site storage, maybe because of a private window. Everything works, but it will be forgotten when the tab closes. Allow site data for this site to keep it.'
            }
          >
            <Button size="sm" variant="danger" feel="warning" onClick={() => setConfirm(true)}>
              Clear
            </Button>
          </Row>
        </Card>
      </section>

      <section className="set-group" aria-labelledby="set-about">
        <h2 id="set-about" className="block-title">
          About
        </h2>
        <Card className="set-card about" r={20}>
          <p>
            <strong>Most Lights</strong> started in 2025 as a joke between five brothers who posed as investigators of the
            paranormal and the perfectly normal. This version holds the files from two winters: Raja Chapitala and the
            Sundarbans.
          </p>
          <p>The cases are stories. The people are real. Every villain and the pirate gang are made up.</p>
          <p className="tiny muted">
            Moon and sun from published formulas (SunCalc, and Meeus for phase times), computed on this device. Fonts: IBM
            Plex and Noto Bengali. Corners: {squircleMode === 'native' ? 'native CSS squircles' : 'drawn squircles'}.
          </p>
          <p className="tiny muted">
            Keyboard: press <kbd className="kbd">/</kbd> to search, and the arrow keys to turn chapters. <Link to="/team/atif">The archive</Link> is
            Atif’s.
          </p>
        </Card>
      </section>

      <Sheet
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Clear your data?"
        footer={
          <div className="sheet-actions">
            <Button onClick={() => setConfirm(false)}>Keep it</Button>
            <Button
              variant="danger"
              icon="reset"
              feel="warning"
              onClick={() => {
                const snapshot = s.resetData()
                setConfirm(false)
                toast('Cleared progress, pins, districts, checklists and the report draft', {
                  icon: 'reset',
                  feel: false,
                  action: { label: 'Undo', run: () => useStore.getState().restore(snapshot) },
                })
              }}
            >
              Clear all
            </Button>
          </div>
        }
      >
        <p>
          This removes your reading progress, pinned clues, districts, checklists and report draft from this device. Your
          theme and other settings stay. You can undo for a few seconds afterwards.
        </p>
      </Sheet>
    </Screen>
  )
}
