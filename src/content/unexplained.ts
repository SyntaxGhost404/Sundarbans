export interface Sighting {
  night: string
  date: string
  time: string
  what: string
  who: string
  ended?: string
  chapter?: number
}

export interface Mark {
  t: string
  label: string
  kind: 'voice' | 'lights' | 'camera' | 'prayer' | 'boat'
  approx?: boolean
}

export interface Unexplained {
  id: 'calling' | 'lights'
  bn: string
  en: string
  summary: string
  sightings: Sighting[]
  candidates: string[]
  against: string[]
  lore: string
}

export const creed = {
  bn: 'যা ব্যাখ্যা করা যায়, তা শেষ বিন্দু পর্যন্ত করব। যা যায় না, তার সামনে মাথা নিচু করব।',
  en: 'What can be explained, we explain to the last detail. What cannot, we bow our heads to.',
  by: 'Nasir',
}

export const unexplained: Unexplained[] = [
  {
    id: 'calling',
    bn: 'নাম ধরে ডাক',
    en: 'The Calling',
    summary:
      'A voice from the forest that calls someone by name, in the voice of a person they love. It has never once been the person.',
    sightings: [
      {
        night: 'Night three',
        date: '2027-12-22',
        time: '01:40',
        what: '“বাবু… এই বাবু… এদিকে আয়।” Nasir’s exact voice, using the pet name only Nasir and Fakhru use, while Nasir slept a foot away.',
        who: 'Moin and Fakhru, wide awake. The skipper at the wheel whispered, “সাড়া দিবেন না।”',
        ended: 'Nasir woke, recited the refuge dua and Ayat al-Kursi. Silence.',
        chapter: 5,
      },
      {
        night: 'Two nights after Kader vanished',
        date: '2027-10-31',
        time: 'About 02:00',
        what: 'Kader’s voice called “রাহেলা” three times behind her hut.',
        who: 'Rahela, alone. That night Kader lay chained and feverish, tens of kilometres away.',
        chapter: 16,
      },
      {
        night: 'Night seven',
        date: '2027-12-26',
        time: '01:55',
        what: '“কাদের… বাপ কাদের…” A woman’s voice.',
        who: 'Kader, shaking. It was his mother’s voice. She died three years ago.',
        chapter: 16,
      },
    ],
    candidates: ['Half-sleep hallucination', 'Grief', 'Wind in the gewa snags'],
    lore: 'Listening to video 19, the skipper said one word under his breath: নিশি.',
    against: [
      'Two awake listeners on night three, not one.',
      'A specific name and a specific voice each time.',
      'No person anywhere near the bank.',
    ],
  },
  {
    id: 'lights',
    bn: 'দোয়ানির আলো',
    en: 'The Doyani Lights',
    summary:
      'Pale lights in a slow, crooked line, low over the confluence. Not as sharp as a torch, not as yellow as a lantern. They move as if they know where they are going.',
    sightings: [
      {
        night: 'Night three',
        date: '2027-12-22',
        time: 'Soon after the Calling',
        what: 'Five or six lights, an arm’s length above the water, drifting north toward the graves’ bank. The ebb ran south. The wind blew from the north.',
        who: 'Moin, Fakhru, Nasir, the skipper. Rafiqul cocked his shotgun.',
        ended: 'They stopped by the graves, held still for a moment, and faded.',
        chapter: 5,
      },
      {
        night: 'Night seven',
        date: '2027-12-26',
        time: '01:52 to 02:09',
        what: 'They came back with a Coast Guard boat at anchor 200 m away and every suspect in custody or miles inland. The searchlight found empty water.',
        who: 'Everyone on both boats.',
        ended: 'Nasir climbed to the wheelhouse roof and gave the adhan. The lights went out one by one.',
        chapter: 16,
      },
    ],
    candidates: ['Marsh gas (আলেয়া)', 'Bioluminescence', 'Reflections'],
    lore: 'The skipper calls whatever lives in the old gewa grove ওনারা, them, and will not say more.',
    against: [
      'They moved against the current and against the wind.',
      'Many witnesses, including the Coast Guard.',
      'Both times, they ended at the adhan.',
    ],
  },
]

/** The trail camera’s night: what it saw, and what it did not. */
export const trailCam = {
  night3: 'Recorded the pirates’ dinghy at 03:10. Recorded nothing at the time of the lights.',
  night7: 'Fired 37 times in 17 minutes, from 01:52 to 02:09. Every frame shows empty water and trees.',
  audio: 'Video 19, at 02:03:41: a faint sound far off, like two syllables. Maybe a word. Maybe not.',
}

// Marks for the night-strip chart. Exact times come from the story;
// approximate ones are drawn hollow and say "about".
export const nightStrip: { night: string; marks: Mark[] }[] = [
  {
    night: 'Night three, 21 to 22 Dec',
    marks: [
      { t: '01:40', label: 'The Calling', kind: 'voice' },
      { t: '01:50', label: 'The lights, minutes later', kind: 'lights', approx: true },
      { t: '03:10', label: 'Dinghy on the trail cam, explained', kind: 'boat' },
    ],
  },
  {
    night: 'Night seven, 25 to 26 Dec',
    marks: [
      { t: '01:52', label: 'The skipper wakes us. Lights. The trail cam starts firing.', kind: 'lights' },
      { t: '01:55', label: 'A mother’s voice', kind: 'voice', approx: true },
      { t: '02:03', label: 'A faint sound on video 19, at 02:03:41', kind: 'camera' },
      { t: '02:06', label: 'The adhan. The lights go out one by one.', kind: 'prayer', approx: true },
      { t: '02:09', label: 'Trigger 37, the last', kind: 'camera' },
    ],
  },
]
