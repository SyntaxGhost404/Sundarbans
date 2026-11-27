// Sun and moon for the field tools.
// Positions, rise and set: the compact SunCalc model (good to a few minutes).
// Phase instants: Meeus, Astronomical Algorithms ch. 49 (good to about a minute).
// All civil times in this app are Bangladesh time, UTC+6 with no daylight saving.

const RAD = Math.PI / 180
const DAY = 86400000
const J1970 = 2440588
const J2000 = 2451545
const E = RAD * 23.4397
export const BD_OFFSET = 6 * 3600000

const { sin, cos, tan, asin, atan2, acos, PI } = Math

const toJulian = (t: number) => t / DAY - 0.5 + J1970
const fromJulian = (j: number) => (j + 0.5 - J1970) * DAY
const toDays = (t: number) => toJulian(t) - J2000

const rightAscension = (l: number, b: number) => atan2(sin(l) * cos(E) - tan(b) * sin(E), cos(l))
const declination = (l: number, b: number) => asin(sin(b) * cos(E) + cos(b) * sin(E) * sin(l))
const azimuthOf = (H: number, phi: number, dec: number) =>
  atan2(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi))
const altitudeOf = (H: number, phi: number, dec: number) =>
  asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H))
const siderealTime = (d: number, lw: number) => RAD * (280.16 + 360.9856235 * d) - lw

function refraction(h: number) {
  const x = h < 0 ? 0 : h
  return 0.0002967 / tan(x + 0.00312536 / (x + 0.08901179))
}

const solarMeanAnomaly = (d: number) => RAD * (357.5291 + 0.98560028 * d)
function eclipticLongitude(M: number) {
  const C = RAD * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M))
  return M + C + RAD * 102.9372 + PI
}
function sunCoords(d: number) {
  const L = eclipticLongitude(solarMeanAnomaly(d))
  return { dec: declination(L, 0), ra: rightAscension(L, 0) }
}

export function sunPosition(t: number, lat: number, lng: number) {
  const lw = RAD * -lng
  const phi = RAD * lat
  const d = toDays(t)
  const c = sunCoords(d)
  const H = siderealTime(d, lw) - c.ra
  return { azimuth: azimuthOf(H, phi, c.dec), altitude: altitudeOf(H, phi, c.dec) }
}

const J0 = 0.0009
const julianCycle = (d: number, lw: number) => Math.round(d - J0 - lw / (2 * PI))
const approxTransit = (Ht: number, lw: number, n: number) => J0 + (Ht + lw) / (2 * PI) + n
const solarTransitJ = (ds: number, M: number, L: number) =>
  J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L)
const hourAngle = (h: number, phi: number, d: number) =>
  acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d)))

/** Sunrise, sunset and the end and start of civil twilight, for the BD day containing `t`. */
export function sunTimes(t: number, lat: number, lng: number) {
  // Anchor to local noon so the solar cycle lands on the right civil day.
  const noon = bdMidnight(t) + 12 * 3600000
  const lw = RAD * -lng
  const phi = RAD * lat
  const d = toDays(noon)
  const n = julianCycle(d, lw)
  const ds = approxTransit(0, lw, n)
  const M = solarMeanAnomaly(ds)
  const L = eclipticLongitude(M)
  const dec = declination(L, 0)
  const Jnoon = solarTransitJ(ds, M, L)
  const at = (h: number) => {
    const w = hourAngle(h * RAD, phi, dec)
    const Jset = solarTransitJ(approxTransit(w, lw, n), M, L)
    return { rise: fromJulian(Jnoon - (Jset - Jnoon)), set: fromJulian(Jset) }
  }
  const sun = at(-0.833)
  const civil = at(-6)
  return { sunrise: sun.rise, sunset: sun.set, dawn: civil.rise, dusk: civil.set, noon: fromJulian(Jnoon) }
}

function moonCoords(d: number) {
  const L = RAD * (218.316 + 13.176396 * d)
  const M = RAD * (134.963 + 13.064993 * d)
  const F = RAD * (93.272 + 13.22935 * d)
  const l = L + RAD * 6.289 * sin(M)
  const b = RAD * 5.128 * sin(F)
  const dist = 385001 - 20905 * cos(M)
  return { ra: rightAscension(l, b), dec: declination(l, b), dist }
}

export function moonPosition(t: number, lat: number, lng: number) {
  const lw = RAD * -lng
  const phi = RAD * lat
  const d = toDays(t)
  const c = moonCoords(d)
  const H = siderealTime(d, lw) - c.ra
  let h = altitudeOf(H, phi, c.dec)
  h += refraction(h)
  return { azimuth: azimuthOf(H, phi, c.dec), altitude: h, distance: c.dist }
}

/** Fraction of the disc lit (0 to 1) and whether the moon is waxing. */
export function moonIllumination(t: number) {
  const d = toDays(t)
  const s = sunCoords(d)
  const m = moonCoords(d)
  const sdist = 149598000
  const phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra))
  const inc = atan2(sdist * sin(phi), m.dist - sdist * cos(phi))
  const angle = atan2(
    cos(s.dec) * sin(s.ra - m.ra),
    sin(s.dec) * cos(m.dec) - cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra),
  )
  return { fraction: (1 + cos(inc)) / 2, waxing: angle < 0 }
}

/** Moonrise and moonset within the BD civil day that contains `t`. */
export function moonTimes(t: number, lat: number, lng: number) {
  const start = bdMidnight(t)
  const hc = 0.133 * RAD
  const alt = (hours: number) => moonPosition(start + hours * 3600000, lat, lng).altitude - hc
  let h0 = alt(0)
  let rise: number | undefined
  let set: number | undefined
  let ye = 0
  for (let i = 1; i <= 24; i += 2) {
    const h1 = alt(i)
    const h2 = alt(i + 1)
    const a = (h0 + h2) / 2 - h1
    const b = (h2 - h0) / 2
    const xe = -b / (2 * a)
    ye = (a * xe + b) * xe + h1
    const disc = b * b - 4 * a * h1
    let roots = 0
    let x1 = 0
    let x2 = 0
    if (disc >= 0) {
      const dx = Math.sqrt(disc) / (Math.abs(a) * 2)
      x1 = xe - dx
      x2 = xe + dx
      if (Math.abs(x1) <= 1) roots++
      if (Math.abs(x2) <= 1) roots++
      if (x1 < -1) x1 = x2
    }
    if (roots === 1) {
      if (h0 < 0) rise = i + x1
      else set = i + x1
    } else if (roots === 2) {
      rise = i + (ye < 0 ? x2 : x1)
      set = i + (ye < 0 ? x1 : x2)
    }
    if (rise !== undefined && set !== undefined) break
    h0 = h2
  }
  return {
    rise: rise === undefined ? null : start + rise * 3600000,
    set: set === undefined ? null : start + set * 3600000,
    alwaysUp: rise === undefined && set === undefined && ye > 0,
    alwaysDown: rise === undefined && set === undefined && ye <= 0,
  }
}

// Meeus ch. 49. q: 0 new, 1 first quarter, 2 full, 3 last quarter.
export type PhaseKind = 'new' | 'first' | 'full' | 'last'
const KINDS: PhaseKind[] = ['new', 'first', 'full', 'last']

function phaseJDE(k: number, q: number): number {
  const kk = k + q / 4
  const T = kk / 1236.85
  const T2 = T * T
  const T3 = T2 * T
  const T4 = T3 * T
  let jde =
    2451550.09766 + 29.530588861 * kk + 0.00015437 * T2 - 0.00000015 * T3 + 0.00000000073 * T4
  const Ec = 1 - 0.002516 * T - 0.0000074 * T2
  const M = RAD * (2.5534 + 29.1053567 * kk - 0.0000014 * T2 - 0.00000011 * T3)
  const Mp =
    RAD * (201.5643 + 385.81693528 * kk + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4)
  const F =
    RAD * (160.7108 + 390.67050284 * kk - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4)
  const Om = RAD * (124.7746 - 1.56375588 * kk + 0.0020672 * T2 + 0.00000215 * T3)

  if (q === 0 || q === 2) {
    const isNew = q === 0
    jde +=
      (isNew ? -0.4072 : -0.40614) * sin(Mp) +
      (isNew ? 0.17241 : 0.17302) * Ec * sin(M) +
      (isNew ? 0.01608 : 0.01614) * sin(2 * Mp) +
      (isNew ? 0.01039 : 0.01043) * sin(2 * F) +
      (isNew ? 0.00739 : 0.00734) * Ec * sin(Mp - M) -
      (isNew ? 0.00514 : 0.00515) * Ec * sin(Mp + M) +
      (isNew ? 0.00208 : 0.00209) * Ec * Ec * sin(2 * M) -
      0.00111 * sin(Mp - 2 * F) -
      0.00057 * sin(Mp + 2 * F) +
      0.00056 * Ec * sin(2 * Mp + M) -
      0.00042 * sin(3 * Mp) +
      0.00042 * Ec * sin(M + 2 * F) +
      0.00038 * Ec * sin(M - 2 * F) -
      0.00024 * Ec * sin(2 * Mp - M) -
      0.00017 * sin(Om) -
      0.00007 * sin(Mp + 2 * M) +
      0.00004 * sin(2 * Mp - 2 * F) +
      0.00004 * sin(3 * M) +
      0.00003 * sin(Mp + M - 2 * F) +
      0.00003 * sin(2 * Mp + 2 * F) -
      0.00003 * sin(Mp + M + 2 * F) +
      0.00003 * sin(Mp - M + 2 * F) -
      0.00002 * sin(Mp - M - 2 * F) -
      0.00002 * sin(3 * Mp + M) +
      0.00002 * sin(4 * Mp)
  } else {
    jde +=
      -0.62801 * sin(Mp) +
      0.17172 * Ec * sin(M) -
      0.01183 * Ec * sin(Mp + M) +
      0.00862 * sin(2 * Mp) +
      0.00804 * sin(2 * F) +
      0.00454 * Ec * sin(Mp - M) +
      0.00204 * Ec * Ec * sin(2 * M) -
      0.0018 * sin(Mp - 2 * F) -
      0.0007 * sin(Mp + 2 * F) -
      0.0004 * sin(3 * Mp) -
      0.00034 * Ec * sin(2 * Mp - M) +
      0.00032 * Ec * sin(M + 2 * F) +
      0.00032 * Ec * sin(M - 2 * F) -
      0.00028 * Ec * Ec * sin(Mp + 2 * M) +
      0.00027 * Ec * sin(2 * Mp + M) -
      0.00017 * sin(Om) -
      0.00005 * sin(Mp - M - 2 * F) +
      0.00004 * sin(2 * Mp + 2 * F) -
      0.00004 * sin(Mp + M + 2 * F) +
      0.00004 * sin(Mp - 2 * M) +
      0.00003 * sin(Mp + M - 2 * F) +
      0.00003 * sin(3 * M) +
      0.00002 * sin(2 * Mp - 2 * F) +
      0.00002 * sin(Mp - M + 2 * F) -
      0.00002 * sin(3 * Mp + M)
    const W =
      0.00306 -
      0.00038 * Ec * cos(M) +
      0.00026 * cos(Mp) -
      0.00002 * cos(Mp - M) +
      0.00002 * cos(Mp + M) +
      0.00002 * cos(2 * F)
    jde += q === 1 ? W : -W
  }

  const A = [
    [299.77 + 0.107408 * kk - 0.009173 * T2, 0.000325],
    [251.88 + 0.016321 * kk, 0.000165],
    [251.83 + 26.651886 * kk, 0.000164],
    [349.42 + 36.412478 * kk, 0.000126],
    [84.66 + 18.206239 * kk, 0.00011],
    [141.74 + 53.303771 * kk, 0.000062],
    [207.14 + 2.453732 * kk, 0.00006],
    [154.84 + 7.30686 * kk, 0.000056],
    [34.52 + 27.261239 * kk, 0.000047],
    [207.19 + 0.121824 * kk, 0.000042],
    [291.34 + 1.844379 * kk, 0.00004],
    [161.72 + 24.198154 * kk, 0.000037],
    [239.56 + 25.513099 * kk, 0.000035],
    [331.55 + 3.592518 * kk, 0.000023],
  ]
  for (const [arg, coef] of A) jde += coef * sin(RAD * arg)
  return jde
}

const DELTA_T = 70 / 86400 // TT minus UT for the 2020s, in days

export interface PhaseEvent {
  kind: PhaseKind
  time: number
}

/** The principal phases whose instants fall in [from, to]. */
export function phasesBetween(from: number, to: number): PhaseEvent[] {
  const yearFrac = 1970 + from / (365.2425 * DAY)
  let k = Math.floor((yearFrac - 2000) * 12.3685) - 1
  const out: PhaseEvent[] = []
  for (let guard = 0; guard < 2000; guard++, k++) {
    for (let q = 0; q < 4; q++) {
      const t = fromJulian(phaseJDE(k, q) - DELTA_T)
      if (t > to) return out
      if (t >= from) out.push({ kind: KINDS[q], time: t })
    }
  }
  return out
}

/** Last new moon at or before `t`, and the next one after it. */
export function lunation(t: number) {
  const events = phasesBetween(t - 32 * DAY, t + 32 * DAY).filter((e) => e.kind === 'new')
  let prev = events[0]
  let next = events[events.length - 1]
  for (const e of events) {
    if (e.time <= t) prev = e
    else {
      next = e
      break
    }
  }
  return { prevNew: prev.time, nextNew: next.time, age: (t - prev.time) / DAY }
}

export function nearestPhase(t: number) {
  const list = phasesBetween(t - 9 * DAY, t + 9 * DAY)
  let best = list[0]
  for (const e of list) if (Math.abs(e.time - t) < Math.abs(best.time - t)) best = e
  return best
}

export type PhaseName =
  | 'New moon'
  | 'Waxing crescent'
  | 'First quarter'
  | 'Waxing gibbous'
  | 'Full moon'
  | 'Waning gibbous'
  | 'Last quarter'
  | 'Waning crescent'

export function phaseName(t: number): PhaseName {
  const near = nearestPhase(t)
  if (Math.abs(near.time - t) < 0.9 * DAY) {
    return ({ new: 'New moon', first: 'First quarter', full: 'Full moon', last: 'Last quarter' } as const)[
      near.kind
    ]
  }
  const { fraction, waxing } = moonIllumination(t)
  if (waxing) return fraction < 0.5 ? 'Waxing crescent' : 'Waxing gibbous'
  return fraction < 0.5 ? 'Waning crescent' : 'Waning gibbous'
}

/**
 * Tide range from the moon alone. Spring tides (জো) follow new and full moon
 * by a day or two in the Bay of Bengal; neap tides (মরা গোন) follow the quarters.
 */
export function tideRange(t: number): { kind: 'spring' | 'neap' | 'between'; days: number } {
  const list = phasesBetween(t - 10 * DAY, t + 10 * DAY)
  let best = list[0]
  let bestGap = Infinity
  for (const e of list) {
    const gap = Math.abs(t - (e.time + 1.5 * DAY))
    if (gap < bestGap) {
      bestGap = gap
      best = e
    }
  }
  const days = bestGap / DAY
  if (days > 2.2) return { kind: 'between', days }
  return { kind: best.kind === 'new' || best.kind === 'full' ? 'spring' : 'neap', days }
}

// Bangladesh civil time helpers.
export function bdMidnight(t: number) {
  const local = t + BD_OFFSET
  return local - (((local % DAY) + DAY) % DAY) - BD_OFFSET
}

export function bdParts(t: number) {
  const d = new Date(t + BD_OFFSET)
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    weekday: d.getUTCDay(),
  }
}

/** Parses "YYYY-MM-DD" and "HH:MM" as Bangladesh time. */
export function fromBd(date: string, time = '00:00'): number | null {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const tm = /^(\d{1,2}):(\d{2})$/.exec(time)
  if (!dm || !tm) return null
  const t = Date.UTC(+dm[1], +dm[2] - 1, +dm[3], +tm[1], +tm[2]) - BD_OFFSET
  return Number.isFinite(t) ? t : null
}

export function toBdInput(t: number) {
  const p = bdParts(t)
  const pad = (v: number) => String(v).padStart(2, '0')
  return { date: `${p.year}-${pad(p.month)}-${pad(p.day)}`, time: `${pad(p.hour)}:${pad(p.minute)}` }
}

export interface SkyReading {
  sunAlt: number
  moonAlt: number
  fraction: number
  waxing: boolean
  light: 'day' | 'twilight' | 'bright-moon' | 'some-moon' | 'thin-moon' | 'no-moon'
}

/** How much natural light there was at one moment and place. */
export function sky(t: number, lat: number, lng: number): SkyReading {
  const sunAlt = sunPosition(t, lat, lng).altitude / RAD
  const moonAlt = moonPosition(t, lat, lng).altitude / RAD
  const { fraction, waxing } = moonIllumination(t)
  let light: SkyReading['light']
  if (sunAlt > -0.833) light = 'day'
  else if (sunAlt > -6) light = 'twilight'
  else if (moonAlt <= 0) light = 'no-moon'
  else if (fraction >= 0.5 && moonAlt > 10) light = 'bright-moon'
  else if (fraction >= 0.15) light = 'some-moon'
  else light = 'thin-moon'
  return { sunAlt, moonAlt, fraction, waxing, light }
}

/** Approximate Hijri date. Bangladesh sights the moon locally, so it can differ by a day. */
export function hijri(t: number): string | null {
  try {
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Dhaka',
    })
    const parts = fmt.formatToParts(new Date(t))
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
    const day = get('day')
    const month = get('month')
    const year = get('year').replace(/\D/g, '')
    if (!day || !month || !year) return null
    return `${day} ${month} ${year} AH`
  } catch {
    return null
  }
}
