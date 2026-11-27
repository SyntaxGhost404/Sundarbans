import {
  lunation,
  moonIllumination,
  moonTimes,
  phaseName,
  sky,
  sunTimes,
  tideRange,
  type SkyReading,
} from './astro'
import { bdTime } from './format'

export interface Tonight {
  fraction: number
  waxing: boolean
  phase: string
  age: number
  moonrise: number | null
  moonset: number | null
  sunrise: number
  sunset: number
  dusk: number
  tide: ReturnType<typeof tideRange>
  line: string
}

/**
 * A plain-language summary of one night's sky at one place. Before sunrise
 * "tonight" still means the night in progress, so it starts from yesterday.
 */
export function tonight(now: number, lat: number, lng: number): Tonight {
  const DAY = 86400000
  const morning = now < sunTimes(now, lat, lng).sunrise
  const t = morning ? now - DAY : now
  const ill = moonIllumination(now)
  const sun = sunTimes(t, lat, lng)
  const today = moonTimes(t, lat, lng)
  const tomorrow = moonTimes(t + DAY, lat, lng)
  // The night runs from sunset to the next sunrise, so look across midnight.
  const after = (xs: (number | null)[]) => xs.find((x): x is number => !!x && x > sun.sunset) ?? null
  const setTonight = after([today.set, tomorrow.set])
  const riseTonight = after([today.rise, tomorrow.rise])
  const upAtDusk = sky(sun.dusk, lat, lng).moonAlt > 0
  const nextSunrise = sunTimes(t + DAY, lat, lng).sunrise
  let line: string
  if (ill.fraction < 0.04) line = 'No moon worth the name. Dark from dusk to dawn.'
  else if (upAtDusk && setTonight && setTonight < nextSunrise)
    line = `Moonlight from dusk until about ${bdTime(setTonight)}. Dark after that.`
  else if (upAtDusk) line = 'The moon is up all night.'
  else if (riseTonight && riseTonight < nextSunrise)
    line = `Dark after dusk until the moon rises at about ${bdTime(riseTonight)}.`
  else line = 'The moon stays below the horizon tonight.'
  return {
    fraction: ill.fraction,
    waxing: ill.waxing,
    phase: phaseName(now),
    age: lunation(now).age,
    moonrise: riseTonight,
    moonset: setTonight,
    sunrise: nextSunrise,
    sunset: sun.sunset,
    dusk: sun.dusk,
    tide: tideRange(now),
    line,
  }
}

/** "02:26", or "02:26 next day" when it falls after midnight of the reference day. */
export function nightTime(t: number | null, ref: number) {
  if (!t) return 'none'
  const day = (x: number) => Math.floor((x + 6 * 3600000) / 86400000)
  return day(t) > day(ref) ? `${bdTime(t)} next day` : bdTime(t)
}

export function tideText(tide: ReturnType<typeof tideRange>) {
  if (tide.kind === 'spring') return { title: 'Spring tide', bn: 'জো', note: 'Big range. High water runs higher and the low chars go under at dusk.' }
  if (tide.kind === 'neap') return { title: 'Neap tide', bn: 'মরা গোন', note: 'Small range. The water barely climbs the banks.' }
  return { title: 'Between', bn: '', note: 'Neither spring nor neap. The range is moving toward the next one.' }
}

export function skyVerdict(
  r: SkyReading,
  present = false,
): { title: string; tone: 'dark' | 'lit' | 'day'; note: string } {
  const lit = Math.round(r.fraction * 100)
  const was = present ? 'is' : 'was'
  const moon =
    r.moonAlt > 0
      ? `The moon ${was} up, ${lit}% lit, ${Math.round(r.moonAlt)}° above the horizon.`
      : `The moon ${was} below the horizon${lit > 2 ? ` (${lit}% lit)` : ''}.`
  switch (r.light) {
    case 'day':
      return { title: 'Daylight', tone: 'day', note: present ? 'The sun is up.' : 'The sun was still up.' }
    case 'twilight':
      return {
        title: 'Twilight',
        tone: 'lit',
        note: `${present ? 'The sun has set and' : 'The sun had just set and'} some light ${was} left in the sky. ${moon}`,
      }
    case 'bright-moon':
      return { title: 'Bright moonlight', tone: 'lit', note: `${moon} Enough to see a figure on a mudbank.` }
    case 'some-moon':
      return { title: 'Some moonlight', tone: 'lit', note: `${moon} Shapes, not faces.` }
    case 'thin-moon':
      return { title: 'Almost dark', tone: 'dark', note: `${moon} A thin moon gives very little light.` }
    default:
      return { title: 'Dark', tone: 'dark', note: `${moon} No moonlight at all.` }
  }
}
