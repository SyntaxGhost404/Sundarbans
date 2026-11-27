// Continuous-curvature rounded rectangles (the iOS icon shape).
// Port of the Figma corner-smoothing construction: each corner is a circular
// arc eased into the straight edges by two cubic curves, so curvature ramps up
// instead of jumping. Used as a clip-path where CSS corner-shape is missing.

export type Radii = number | [tl: number, tr: number, br: number, bl: number]

interface Corner {
  r: number
  budget: number
}

interface Params {
  a: number
  b: number
  c: number
  d: number
  p: number
  arc: number
  r: number
}

const RAD = Math.PI / 180
const n = (v: number) => (Math.round(v * 100) / 100).toString()

function cornerParams(r: number, smoothing: number, budget: number): Params {
  let p = (1 + smoothing) * r
  const arcMeasure = 90 * (1 - smoothing)
  const arc = Math.sin((arcMeasure / 2) * RAD) * r * Math.SQRT2
  const alpha = (90 - arcMeasure) / 2
  const p3ToP4 = r * Math.tan((alpha / 2) * RAD)
  const beta = 45 * smoothing
  const c = p3ToP4 * Math.cos(beta * RAD)
  const d = c * Math.tan(beta * RAD)
  let b = (p - arc - c - d) / 3
  let a = 2 * b
  // Keep the smoothing but squeeze the easing curves when space runs out.
  if (p > budget) {
    const room = budget - d - arc - c
    const minA = room / 6
    const maxB = room - minA
    b = Math.min(b, maxB)
    a = room - b
    p = Math.min(p, budget)
  }
  return { a, b, c, d, p, arc, r }
}

// Splits the available edge length between neighbouring corners, largest first.
function distribute(w: number, h: number, radii: [number, number, number, number]) {
  const keys = ['tl', 'tr', 'br', 'bl'] as const
  type K = (typeof keys)[number]
  const radius: Record<K, number> = { tl: radii[0], tr: radii[1], br: radii[2], bl: radii[3] }
  const budget: Record<K, number> = { tl: -1, tr: -1, br: -1, bl: -1 }
  const adj: Record<K, [K, number][]> = {
    tl: [['tr', w], ['bl', h]],
    tr: [['tl', w], ['br', h]],
    br: [['bl', w], ['tr', h]],
    bl: [['br', w], ['tl', h]],
  }
  const order = [...keys].sort((x, y) => radius[y] - radius[x])
  for (const k of order) {
    const r = radius[k]
    const limit = Math.min(
      ...adj[k].map(([other, side]) => {
        const ro = radius[other]
        if (r === 0 && ro === 0) return 0
        if (budget[other] >= 0) return side - budget[other]
        return (r / (r + ro)) * side
      }),
    )
    budget[k] = limit
    radius[k] = Math.min(r, limit)
  }
  const out = (k: K): Corner => ({ r: radius[k], budget: budget[k] })
  return { tl: out('tl'), tr: out('tr'), br: out('br'), bl: out('bl') }
}

export function squirclePath(w: number, h: number, radii: Radii, smoothing = 0.6): string {
  if (w <= 0 || h <= 0) return ''
  const list: [number, number, number, number] = Array.isArray(radii)
    ? radii
    : [radii, radii, radii, radii]
  const c = distribute(w, h, list)
  const tl = cornerParams(c.tl.r, smoothing, c.tl.budget)
  const tr = cornerParams(c.tr.r, smoothing, c.tr.budget)
  const br = cornerParams(c.br.r, smoothing, c.br.budget)
  const bl = cornerParams(c.bl.r, smoothing, c.bl.budget)

  const parts: string[] = [`M${n(w - tr.p)} 0`]
  if (tr.r) {
    parts.push(
      `c${n(tr.a)} 0 ${n(tr.a + tr.b)} 0 ${n(tr.a + tr.b + tr.c)} ${n(tr.d)}`,
      `a${n(tr.r)} ${n(tr.r)} 0 0 1 ${n(tr.arc)} ${n(tr.arc)}`,
      `c${n(tr.d)} ${n(tr.c)} ${n(tr.d)} ${n(tr.b + tr.c)} ${n(tr.d)} ${n(tr.a + tr.b + tr.c)}`,
    )
  } else parts.push(`l${n(tr.p)} 0`)
  parts.push(`L${n(w)} ${n(h - br.p)}`)
  if (br.r) {
    parts.push(
      `c0 ${n(br.a)} 0 ${n(br.a + br.b)} ${n(-br.d)} ${n(br.a + br.b + br.c)}`,
      `a${n(br.r)} ${n(br.r)} 0 0 1 ${n(-br.arc)} ${n(br.arc)}`,
      `c${n(-br.c)} ${n(br.d)} ${n(-(br.b + br.c))} ${n(br.d)} ${n(-(br.a + br.b + br.c))} ${n(br.d)}`,
    )
  } else parts.push(`l0 ${n(br.p)}`)
  parts.push(`L${n(bl.p)} ${n(h)}`)
  if (bl.r) {
    parts.push(
      `c${n(-bl.a)} 0 ${n(-(bl.a + bl.b))} 0 ${n(-(bl.a + bl.b + bl.c))} ${n(-bl.d)}`,
      `a${n(bl.r)} ${n(bl.r)} 0 0 1 ${n(-bl.arc)} ${n(-bl.arc)}`,
      `c${n(-bl.d)} ${n(-bl.c)} ${n(-bl.d)} ${n(-(bl.b + bl.c))} ${n(-bl.d)} ${n(-(bl.a + bl.b + bl.c))}`,
    )
  } else parts.push(`l${n(-bl.p)} 0`)
  parts.push(`L0 ${n(tl.p)}`)
  if (tl.r) {
    parts.push(
      `c0 ${n(-tl.a)} 0 ${n(-(tl.a + tl.b))} ${n(tl.d)} ${n(-(tl.a + tl.b + tl.c))}`,
      `a${n(tl.r)} ${n(tl.r)} 0 0 1 ${n(tl.arc)} ${n(-tl.arc)}`,
      `c${n(tl.c)} ${n(-tl.d)} ${n(tl.b + tl.c)} ${n(-tl.d)} ${n(tl.a + tl.b + tl.c)} ${n(-tl.d)}`,
    )
  } else parts.push(`l0 ${n(-tl.p)}`)
  parts.push('Z')
  return parts.join('')
}

// Rendering mode is decided once, before first paint, by index.html.
export const squircleMode: 'native' | 'js' =
  typeof document !== 'undefined' && document.documentElement.classList.contains('sq-native')
    ? 'native'
    : 'js'
