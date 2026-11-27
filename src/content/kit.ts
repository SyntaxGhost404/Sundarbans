import type { IconName } from '../components/Icon'

export interface KitItem {
  id: string
  text: string
  note?: string
  icon: IconName
  banned?: boolean
}

export interface KitList {
  id: string
  title: string
  sub: string
  items: KitItem[]
}

export const kitLists: KitList[] = [
  {
    id: 'village',
    title: 'Village nights',
    sub: 'What we carried to Raja Chapitala',
    items: [
      { id: 'cam', text: 'Trail camera with night vision', note: 'Point it where people walk, not where you hope they walk.', icon: 'camera' },
      { id: 'cards', text: 'Spare SD cards', note: 'Copy the footage every morning. Cameras get stolen.', icon: 'archive' },
      { id: 'red', text: 'Torch with a red filter', note: 'Keeps your night eyes. The diggers knew it too.', icon: 'light' },
      { id: 'note', text: 'Notebook and pen', note: 'Write the time of everything.', icon: 'notebook' },
      { id: 'glass', text: 'Magnifying glass', note: 'Soil colour, paw pads, wire ends.', icon: 'search' },
      { id: 'moon', text: 'Tonight’s moonrise and moonset', note: 'People dig after moonset. Check it here before you go.', icon: 'moon' },
      { id: 'power', text: 'Power bank', icon: 'haptic' },
      { id: 'story', text: 'A cover story', note: 'Drone shots for friends abroad. Rosmalai for Dhaka.', icon: 'testimony' },
      { id: 'maghrib', text: 'Home by Maghrib', note: 'Mamani counts heads.', icon: 'clock' },
    ],
  },
  {
    id: 'forest',
    title: 'Forest boat',
    sub: 'What we carried into the Sundarbans',
    items: [
      { id: 'pass', text: 'Forest pass for guests, boat and crew', note: 'No pass, no trip. Land only with the guard.', icon: 'document' },
      { id: 'jacket', text: 'Life jacket for anyone who cannot swim', note: 'Nasir’s rule. Not up for debate.', icon: 'boat' },
      { id: 'radio', text: 'Walkie-talkies', note: 'There is no network most of the time.', icon: 'signal' },
      { id: 'gps', text: 'Offline GPS with saved pins', note: 'Patrols need coordinates, not descriptions.', icon: 'place' },
      { id: 'cam', text: 'Trail camera', note: 'Mount it on a tree you can reach from the boat.', icon: 'camera' },
      { id: 'warm', text: 'Warm layers', note: 'Dawn fog on the water is colder than it looks.', icon: 'tide' },
      { id: 'med', text: 'Medical kit', note: 'ORS, dressings, and someone who knows how to use them.', icon: 'stethoscope' },
      { id: 'line', text: 'Line, hooks and bait', note: 'Oli will bait yours anyway.', icon: 'fish' },
      { id: 'tide', text: 'Tide range for the trip', note: 'Spring tides drown the low chars at dusk.', icon: 'moon' },
      { id: 'plastic', text: 'Single-use plastic', note: 'Banned in the forest. Leave it on shore.', icon: 'object', banned: true },
      { id: 'drone', text: 'Drone', note: 'Banned for visitors by forest rule. Nothing in the software stops it, so the rule is on you.', icon: 'drone', banned: true },
    ],
  },
]

export const kitById = Object.fromEntries(kitLists.map((k) => [k.id, k])) as Record<string, KitList>
