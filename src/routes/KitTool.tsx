import { useState } from 'react'
import { Screen } from '../components/Screen'
import { Badge, Button, Card, Check, Meter, Segmented } from '../components/ui'
import { Icon } from '../components/Icon'
import { toast } from '../components/Toast'
import { Sq } from '../lib/Sq'
import { kitLists } from '../content/kit'
import { useStore } from '../lib/store'
import { Link } from '../lib/router'
import { haptic } from '../lib/haptics'

export function KitTool() {
  const [listId, setListId] = useState(kitLists[0].id)
  const kit = useStore((s) => s.kit)
  const toggle = useStore((s) => s.toggleKit)
  const setKit = useStore((s) => s.setKit)
  const list = kitLists.find((l) => l.id === listId) ?? kitLists[0]
  const packed = kit[list.id] ?? []
  const allowed = list.items.filter((i) => !i.banned)
  const done = allowed.filter((i) => packed.includes(i.id)).length
  const complete = done === allowed.length

  return (
    <Screen title="Field kit" back="/tools" sub="Two checklists, written after the fact. Tick as you pack.">
      <Segmented
        label="Checklist"
        block
        value={listId}
        onChange={setListId}
        options={kitLists.map((l) => ({ value: l.id, label: l.title }))}
      />

      <Card className="kit-head" r={20}>
        <div className="kit-head-row">
          <div>
            <p className="kit-title">{list.title}</p>
            <p className="muted">{list.sub}</p>
          </div>
          <p className="score-big">
            {done}
            <span className="muted"> / {allowed.length}</span>
          </p>
        </div>
        <Meter value={done / allowed.length} label={`${list.title} packed`} />
        {complete && (
          <p className="kit-done">
            <Icon name="check" size={18} />
            Packed. Tell someone at home where you are going.
          </p>
        )}
      </Card>

      <ul className="kit-list">
        {list.items.map((item) =>
          item.banned ? (
            <li key={item.id}>
              <Sq r={14} className="kit-banned">
                <Icon name={item.icon} size={20} />
                <span className="kit-banned-text">
                  <span className="kit-banned-title">
                    {item.text}
                    <Badge tone="danger">Not allowed</Badge>
                  </span>
                  {item.note && <span className="check-hint">{item.note}</span>}
                </span>
              </Sq>
            </li>
          ) : (
            <li key={item.id}>
              <Check checked={packed.includes(item.id)} onChange={() => toggle(list.id, item.id)} hint={item.note}>
                {item.text}
                {item.id === 'moon' || item.id === 'tide' ? (
                  <Link to="/tools/moon" className="text-link kit-link" onClick={() => haptic('tap')}>
                    Check
                  </Link>
                ) : null}
              </Check>
            </li>
          ),
        )}
      </ul>

      {packed.length > 0 && (
        <Button
          variant="ghost"
          icon="reset"
          onClick={() => {
            const before = packed
            setKit(list.id, [])
            toast('Checklist cleared', {
              icon: 'reset',
              feel: 'tap',
              action: { label: 'Undo', run: () => setKit(list.id, before) },
            })
          }}
        >
          Start this list again
        </Button>
      )}
    </Screen>
  )
}
