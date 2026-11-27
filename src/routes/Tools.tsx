import { Screen } from '../components/Screen'
import { Card } from '../components/ui'
import { Icon, type IconName } from '../components/Icon'
import { useStore } from '../lib/store'
import { kitLists } from '../content/kit'
import { Sq } from '../lib/Sq'

export function Tools() {
  const districts = useStore((s) => s.districts.length)
  const kit = useStore((s) => s.kit)
  const report = useStore((s) => s.report)
  const kitDone = kitLists.reduce((a, l) => a + (kit[l.id]?.length ?? 0), 0)
  const kitTotal = kitLists.reduce((a, l) => a + l.items.filter((i) => !i.banned).length, 0)
  const draft = !!(report.what || report.where)

  const tools: { to: string; icon: IconName; title: string; text: string; status: string }[] = [
    {
      to: '/tools/moon',
      icon: 'moon',
      title: 'Moon and tide',
      text: 'Phase, moonrise, moonset and tide range for any date. Check whether a witness could have seen what they say.',
      status: 'Works offline',
    },
    {
      to: '/tools/districts',
      icon: 'map',
      title: 'Districts',
      text: 'Tick the districts you have stood in, by Fakhru’s rule. Your feet have to touch the ground.',
      status: `${districts} of 64`,
    },
    {
      to: '/tools/kit',
      icon: 'kit',
      title: 'Field kit',
      text: 'The checklists we wish we had, for a village night watch and a forest boat.',
      status: `${kitDone} of ${kitTotal} packed`,
    },
    {
      to: '/tools/report',
      icon: 'pen',
      title: 'Report a light',
      text: 'Write down a strange light or sound, and answer the questions we would ask before calling it a ghost.',
      status: draft ? 'Draft saved' : 'Nothing sent anywhere',
    },
  ]

  return (
    <Screen title="Field tools" sub="Small tools that did real work in the cases. Everything runs on this device.">
      <ul className="tools-list">
        {tools.map((t) => (
          <li key={t.to}>
            <Card to={t.to} className="tool-card" r={28}>
              <Sq as="span" r={14} edge={false} className="tool-card-icon">
                <Icon name={t.icon} size={24} />
              </Sq>
              <span className="tool-card-body">
                <span className="tool-card-title">{t.title}</span>
                <span className="tool-card-text">{t.text}</span>
                <span className="tool-card-status mono">{t.status}</span>
              </span>
              <Icon name="next" size={18} />
            </Card>
          </li>
        ))}
      </ul>
    </Screen>
  )
}
