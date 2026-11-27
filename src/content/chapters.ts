import index from './story/index.json'

export interface ChapterMeta {
  n: number
  bn: string
  en: string
  date: string
  where: string
  words: number
}

const meta: Omit<ChapterMeta, 'words'>[] = [
  { n: 1, bn: 'ছাদে পূর্ণিমা', en: 'Full moon on the roof', date: '2027-12-13', where: 'Dhaka' },
  { n: 2, bn: 'সুন্দরবন এক্সপ্রেস', en: 'The Sundarban Express', date: '2027-12-19', where: 'Kamalapur to Joymoni' },
  { n: 3, bn: 'অন্ধকারে শিস', en: 'A whistle in the dark', date: '2027-12-19', where: 'Joymoni ghat' },
  { n: 4, bn: 'বনের দরজায়', en: 'At the forest’s door', date: '2027-12-20', where: 'Karamjal, Harbaria' },
  { n: 5, bn: 'পরীর দোয়ানি', en: 'The Fairies’ Doyani', date: '2027-12-21', where: 'The Doyani' },
  { n: 6, bn: 'কাদায় পায়ের ছাপ', en: 'Footprints in the mud', date: '2027-12-22', where: 'The Doyani' },
  { n: 7, bn: 'লালচে শুঁটকি', en: 'The reddish shutki', date: '2027-12-22', where: 'A sanctuary khal' },
  { n: 8, bn: 'এক দাগ নেটওয়ার্ক', en: 'One bar of network', date: '2027-12-23', where: 'Kochikhali' },
  { n: 9, bn: 'চাঁদের হিসাব', en: 'The moon’s account', date: '2027-12-23', where: 'Off Kochikhali' },
  { n: 10, bn: 'কটকা', en: 'Kotka', date: '2027-12-24', where: 'Kotka' },
  { n: 11, bn: 'দুবলার চর', en: 'Dublar Char', date: '2027-12-24', where: 'Alorkol, Dublar Char' },
  { n: 12, bn: 'কুয়াশা', en: 'Fog', date: '2027-12-25', where: 'The Doyani' },
  { n: 13, bn: 'নিষিদ্ধ আকাশ', en: 'The forbidden sky', date: '2027-12-25', where: 'The Doyani' },
  { n: 14, bn: 'কাদের', en: 'Kader', date: '2027-12-25', where: 'A side khal' },
  { n: 15, bn: 'ব্যাখ্যা', en: 'The explanation', date: '2027-12-25', where: 'Kotka' },
  { n: 16, bn: 'ব্যাখ্যার বাইরে', en: 'Beyond explanation', date: '2027-12-25', where: 'The Doyani to Dhaka' },
]

const words = new Map((index as { n: number; words: number }[]).map((c) => [c.n, c.words]))

export const chapters: ChapterMeta[] = meta.map((m) => ({ ...m, words: words.get(m.n) ?? 0 }))
export const totalWords = chapters.reduce((a, c) => a + c.words, 0)

export interface ChapterText {
  n: number
  words: number
  paras: string[]
}

const loaders = import.meta.glob<ChapterText>('./story/ch*.json', { import: 'default' })

/** Loads one chapter's text on demand, so the first visit stays light. */
export async function loadChapter(n: number): Promise<ChapterText> {
  const key = `./story/ch${String(n).padStart(2, '0')}.json`
  const load = loaders[key]
  if (!load) throw new Error(`Chapter ${n} is not in this build`)
  return load()
}
