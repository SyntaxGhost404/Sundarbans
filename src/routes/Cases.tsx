import { Screen } from '../components/Screen'
import { Badge, Card, SectionHead } from '../components/ui'
import { Icon, type IconName } from '../components/Icon'
import { AvatarStack } from '../components/Avatar'
import { cases } from '../content/cases'
import { clues } from '../content/clues'
import { team } from '../content/team'
import { rangeLabel } from '../lib/format'

const names = Object.fromEntries(team.map((m) => [m.id, m.short]))

const method: { icon: IconName; title: string; text: string }[] = [
  { icon: 'lock', title: 'No authority, only access', text: 'We go where family, hospitality and a cover story let us. Nowhere else.' },
  { icon: 'search', title: 'Attention instead of power', text: 'Soil colour, moonset, a price sticker, a whistle, a ledger line. Anyone could notice them. Few do.' },
  { icon: 'team', title: 'Borrowed expertise', text: 'A freedom fighter’s memory, a skipper’s tides, a surgeon’s eye, a cousin’s gossip.' },
  { icon: 'archive', title: 'Evidence hygiene', text: 'Copy footage every morning, photograph with timestamps, save GPS pins.' },
  { icon: 'warn', title: 'Real costs', text: 'A stolen camera, a lost dinghy in fog, and more wrong theories than right ones.' },
  { icon: 'arrow', title: 'Hand-off, not heroics', text: 'Arrests belong to the police, the Coast Guard and the forest department. We bring the evidence.' },
]

export function Cases() {
  return (
    <Screen title="Cases" sub="Two winters, two case files. Both closed. One left something open.">
      <ul className="case-list">
        {cases.map((c) => {
          const n = clues.filter((x) => x.case === c.id).length
          return (
            <li key={c.id}>
              <Card to={`/cases/${c.id}`} className="case-card" r={28}>
                <span className="case-card-top">
                  <span className="case-no case-no-lg">{c.no}</span>
                  <span className="case-card-badges">
                    <Badge tone="accent" icon="check">
                      {c.status}
                    </Badge>
                    {c.open ? (
                      <Badge tone="warn" icon="lights">
                        {c.open} unexplained
                      </Badge>
                    ) : null}
                  </span>
                </span>
                <span className="case-card-bn bn">{c.bn}</span>
                <span className="case-card-en">{c.en}</span>
                <span className="case-card-hook">{c.hook}</span>
                <span className="case-card-foot">
                  <span className="case-card-meta">
                    <span>
                      <Icon name="place" size={16} />
                      {c.where}
                    </span>
                    <span className="mono">
                      <Icon name="calendar" size={16} />
                      {rangeLabel(c.from, c.to)}
                    </span>
                    <span>
                      <Icon name="board" size={16} />
                      {n} clues
                    </span>
                  </span>
                  <AvatarStack ids={c.team} size={30} names={names} />
                </span>
              </Card>
            </li>
          )
        })}
      </ul>

      <section className="method" aria-labelledby="method-title">
        <SectionHead
          id="method-title"
          title="How five amateurs investigate"
          sub="No badges, no warrants, no lab. This is what we have instead."
        />
        <ol className="method-grid">
          {method.map((m, i) => (
            <li key={m.title}>
              <Card className="method-card" r={20}>
                <span className="method-num mono">{String(i + 1).padStart(2, '0')}</span>
                <Icon name={m.icon} />
                <span className="method-title">{m.title}</span>
                <span className="method-text">{m.text}</span>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </Screen>
  )
}
