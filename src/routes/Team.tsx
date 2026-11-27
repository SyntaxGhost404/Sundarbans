import { Screen } from '../components/Screen'
import { Card, SectionHead } from '../components/ui'
import { Avatar } from '../components/Avatar'
import { allies, team } from '../content/team'
import { clues } from '../content/clues'

const names: { who: string; calls: string; what: string }[] = [
  { who: 'Nasir and Fakhru', calls: 'Moin', what: 'বাবু' },
  { who: 'Oli and Ahsanul mama', calls: 'Moin', what: 'মঈন, or মঈন উদ্দিন' },
  { who: 'Moin and Fakhru', calls: 'Nasir', what: 'ভাইয়া' },
  { who: 'Oli', calls: 'Nasir', what: 'নাসির ভাই' },
  { who: 'Moin', calls: 'Fakhru', what: 'ভাইয়া' },
]

export function Team() {
  return (
    <Screen title="Team" sub="Three brothers, a khalato bhai and his brother. Nobody here is a detective.">
      <ul className="team-grid">
        {team.map((m) => {
          const cracked = clues.filter((c) => c.by.includes(m.id)).length
          return (
            <li key={m.id}>
              <Card to={`/team/${m.id}`} className="member-card" r={28}>
                <Avatar id={m.id} size={96} name={m.name} />
                <span className="member-body">
                  <span className="member-name">{m.name}</span>
                  <span className="member-bn bn muted">{m.bn}</span>
                  <span className="member-role">{m.role}</span>
                  <span className="member-line">{m.line}</span>
                  <span className="member-stats mono">
                    {m.cases.length ? `${m.cases.length} case${m.cases.length > 1 ? 's' : ''}` : 'Next trip'}
                    {cracked ? ` · ${cracked} clue${cracked > 1 ? 's' : ''} cracked` : ''}
                  </span>
                </span>
              </Card>
            </li>
          )
        })}
      </ul>

      <section className="names" aria-labelledby="names-title">
        <SectionHead id="names-title" title="What we call each other" sub="Getting this wrong at home is worse than getting a clue wrong." />
        <Card className="names-card" r={20}>
          <ul>
            {names.map((n) => (
              <li key={n.who + n.calls}>
                <span>
                  {n.who} call{n.who.includes(' and ') ? '' : 's'} {n.calls}
                </span>
                <span className="bn names-what">{n.what}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section aria-labelledby="allies-title">
        <SectionHead id="allies-title" title="Off the team, on our side" />
        {allies.map((a) => (
          <Card key={a.name} className="ally" r={20}>
            <span className="ally-name">
              {a.name} <span className="bn muted">{a.bn}</span>
            </span>
            <span className="ally-role">{a.role}</span>
          </Card>
        ))}
      </section>
    </Screen>
  )
}
