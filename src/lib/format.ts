import { bdParts } from './astro'

const BN_DIGITS = '০১২৩৪৫৬৭৮৯'
export const bnNum = (v: number | string) => String(v).replace(/\d/g, (d) => BN_DIGITS[+d])

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const pad = (v: number) => String(v).padStart(2, '0')

/** "Sun 19 Dec 2027" in Bangladesh time. */
export function bdDate(t: number, opts: { weekday?: boolean; year?: boolean } = {}) {
  const p = bdParts(t)
  const w = opts.weekday === false ? '' : DAYS[p.weekday] + ' '
  const y = opts.year === false ? '' : ' ' + p.year
  return `${w}${p.day} ${MONTHS[p.month - 1]}${y}`
}

/** "17:21" in Bangladesh time. */
export const bdTime = (t: number) => {
  const p = bdParts(t)
  return `${pad(p.hour)}:${pad(p.minute)}`
}

/** Parses "2027-12-19" without time zone surprises. */
export function isoDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m, d, label: `${DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${d} ${MONTHS[m - 1]}` }
}

export const pct = (v: number) => `${Math.round(v * 100)}%`

export function plural(n: number, one: string, many = one + 's') {
  return `${n} ${n === 1 ? one : many}`
}

export const minutesToRead = (words: number) => Math.max(1, Math.round(words / 180))

/** Lowercase, accent-free text for search. Keeps Bangla as is. */
export const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')

/** "16 to 22 Dec 2026", or "28 Dec 2027 to 9 Jan 2028" across months. */
export function rangeLabel(from: string, to: string) {
  const a = isoDay(from)
  const b = isoDay(to)
  if (a.y === b.y && a.m === b.m) return `${a.d} to ${b.d} ${MONTHS[b.m - 1]} ${b.y}`
  if (a.y === b.y) return `${a.d} ${MONTHS[a.m - 1]} to ${b.d} ${MONTHS[b.m - 1]} ${b.y}`
  return `${a.d} ${MONTHS[a.m - 1]} ${a.y} to ${b.d} ${MONTHS[b.m - 1]} ${b.y}`
}
