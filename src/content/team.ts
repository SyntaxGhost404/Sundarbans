import type { IconName } from '../components/Icon'

export type MemberId = 'nasir' | 'fakhru' | 'oli' | 'moin' | 'atif'

export interface Member {
  id: MemberId
  name: string
  short: string
  bn: string
  role: string
  line: string
  bio: string[]
  strengths: string[]
  gear: { icon: IconName; text: string }[]
  quote?: { bn: string; en: string; where: string }
  calls?: string
  cases: ('rongmohol' | 'doyani')[]
  icon: IconName
}

export const photoSrc = (id: MemberId, px: number | 'portrait') =>
  `photos/${id}-${px === 'portrait' ? 'portrait' : px}.webp`

export const team: Member[] = [
  {
    id: 'nasir',
    name: 'Dr. Nasir Uddin',
    short: 'Nasir',
    bn: 'নাসির ভাই',
    role: 'Lead, Sundarbans',
    line: 'Surgeon. Reads a wound the way other people read a page.',
    bio: [
      'The eldest brother and a government surgeon. Always in a panjabi and white payjama, even on a trawler.',
      'He said he could not possibly come to the Sundarbans. He was already on the boat when the rest of us arrived, eating bhetki.',
      'Calm, dry and exact. Keeps faith and reason in the same hand.',
    ],
    strengths: ['Reads wounds and cuts', 'Knows the smell of poison', 'Keeps a crew calm', 'Decides fast'],
    gear: [
      { icon: 'stethoscope', text: 'His own medical kit' },
      { icon: 'boat', text: 'Life jackets for the two who cannot swim' },
    ],
    quote: {
      bn: 'যা ব্যাখ্যা করা যায়, তা শেষ বিন্দু পর্যন্ত করব। যা যায় না, তার সামনে মাথা নিচু করব।',
      en: 'What can be explained, we explain to the last detail. What cannot, we bow our heads to.',
      where: 'The Sundarbans, December 2027',
    },
    calls: 'Calls Moin বাবু',
    cases: ['doyani'],
    icon: 'stethoscope',
  },
  {
    id: 'fakhru',
    name: 'Fakhruddin',
    short: 'Fakhru',
    bn: 'ফখরু ভাইয়া',
    role: 'Timelines',
    line: 'PhD student in the US. Writes everything down, then lines it up.',
    bio: [
      'The middle brother, home for the winter break. Lead of the Raja Chapitala case.',
      'Keeps a notebook timeline that wins arguments, and a list of the 64 districts on the last page of his diary, ticked in red ink.',
      'Owns the night-vision trail camera. Cannot swim.',
    ],
    strengths: ['Timelines', 'Logbooks and paperwork', 'Patience', 'Explaining it at the end'],
    gear: [
      { icon: 'camera', text: '4K night-vision trail camera' },
      { icon: 'notebook', text: 'Notebook and a magnifying glass' },
    ],
    quote: {
      bn: 'ভূত সময় মেনে চলে না। মানুষ সময় সেট করে।',
      en: 'Ghosts do not keep time. People set timers.',
      where: 'Raja Chapitala, December 2026',
    },
    calls: 'Calls Moin বাবু',
    cases: ['rongmohol', 'doyani'],
    icon: 'notebook',
  },
  {
    id: 'oli',
    name: 'Oli Ullah',
    short: 'Oli',
    bn: 'অলি ভাই',
    role: 'Fieldwork',
    line: 'Angler, swimmer, drone pilot. First onto the mud.',
    bio: [
      'Our khalato bhai from Narayanganj. There is a pond behind his house, which explains the casting.',
      'The most action-fit of us. Baits everyone else’s hooks, reads dead fish on a tide line, and flies a DJI Mini 4 Pro better than anyone we know.',
      'Funny until it matters, then very quiet.',
    ],
    strengths: ['Fishing', 'Swimming', 'Drone flying', 'Spotting what nets do not do'],
    gear: [
      { icon: 'drone', text: 'DJI Mini 4 Pro' },
      { icon: 'fish', text: 'Line, hooks and bait for everyone' },
    ],
    quote: {
      bn: 'জালে এমন হয় না।',
      en: 'Nets do not do this.',
      where: 'The tide line at the Doyani',
    },
    calls: 'Calls Moin মঈন',
    cases: ['rongmohol', 'doyani'],
    icon: 'fish',
  },
  {
    id: 'moin',
    name: 'Moin Uddin',
    short: 'Moin',
    bn: 'মঈন',
    role: 'Narrator',
    line: 'Writes it all down. Copies the footage every morning.',
    bio: [
      'The youngest brother and the one telling the story. Oli’s right hand and drone pupil.',
      'His habit of copying the trail-cam footage every morning saved the evidence when the camera was stolen.',
      'Cannot swim. Flew the drone himself the morning the fog took Oli.',
    ],
    strengths: ['Noticing', 'Backups', 'Reading the calendar', 'Flying when it counts'],
    gear: [
      { icon: 'archive', text: 'Spare cards and a backup of everything' },
      { icon: 'moon', text: 'A moonrise table in his head' },
    ],
    quote: {
      bn: 'তুমি না বলেছিলে, অধিকাংশ আলোর পেছনে মানুষ থাকে?',
      en: 'Didn’t you say most lights have a person behind them?',
      where: 'Night three at the Doyani',
    },
    calls: 'Nasir and Fakhru call him বাবু',
    cases: ['rongmohol', 'doyani'],
    icon: 'pen',
  },
  {
    id: 'atif',
    name: 'Atif Ullah',
    short: 'Atif',
    bn: 'আতিফ',
    role: 'Archive',
    line: 'Oli’s brother. Keeps the files.',
    bio: [
      'Oli’s brother, and one of the five who first put this site together in 2025.',
      'He was not on the roof in Raja Chapitala or on the boat in the Sundarbans. There is a seat with his name on it for the next one.',
    ],
    strengths: ['Keeping the archive', 'Asking the obvious question'],
    gear: [{ icon: 'archive', text: 'The archive' }],
    cases: [],
    icon: 'archive',
  },
]

export const memberById = Object.fromEntries(team.map((m) => [m.id, m])) as Record<MemberId, Member>

export const allies = [
  {
    name: 'Ahsanul mama',
    bn: 'আহসানুল মামা',
    role: 'Off-site. Context, counsel and one phone call at the right time. He never solves it for us.',
  },
]
