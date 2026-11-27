import { Sq } from '../lib/Sq'

/**
 * The lit part of the moon as seen from Bangladesh: lit on the right while
 * waxing, on the left while waning. Always drawn on a night tile so it reads
 * as a moon in both themes.
 */
export function MoonGlyph({
  fraction,
  waxing,
  size = 56,
  tile = true,
  label,
}: {
  fraction: number
  waxing: boolean
  size?: number
  tile?: boolean
  label?: string
}) {
  const r = 10
  const cx = 12
  const cy = 12
  const k = Math.max(0, Math.min(1, fraction))
  const rx = Math.abs(1 - 2 * k) * r
  const gibbous = k > 0.5
  // Limb arc on the lit side, then the terminator back to the top.
  const limbSweep = waxing ? 1 : 0
  const termSweep = waxing ? (gibbous ? 1 : 0) : gibbous ? 0 : 1
  const d =
    k < 0.005
      ? ''
      : k > 0.995
        ? `M${cx} ${cy - r}a${r} ${r} 0 1 1 0 ${2 * r}a${r} ${r} 0 1 1 0 ${-2 * r}z`
        : `M${cx} ${cy - r}A${r} ${r} 0 0 ${limbSweep} ${cx} ${cy + r}A${rx.toFixed(3)} ${r} 0 0 ${termSweep} ${cx} ${cy - r}z`

  const svg = (
    <svg
      viewBox="0 0 24 24"
      width={tile ? size * 0.64 : size}
      height={tile ? size * 0.64 : size}
      className="moon-svg"
      role="img"
      aria-label={label ?? `Moon ${Math.round(k * 100)} percent lit`}
    >
      <circle cx={cx} cy={cy} r={r} className="moon-dark" />
      {d && <path d={d} className="moon-lit" />}
      <circle cx={cx} cy={cy} r={r - 0.4} className="moon-rim" />
    </svg>
  )
  if (!tile) return svg
  return (
    <Sq r={Math.round(size * 0.28)} edge={false} className="night-tile" style={{ width: size, height: size }}>
      {svg}
    </Sq>
  )
}
