import { Sq } from '../lib/Sq'
import { photoSrc, type MemberId } from '../content/team'

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`

export function Avatar({
  id,
  size = 40,
  name,
  ring,
}: {
  id: MemberId
  size?: number
  name: string
  ring?: boolean
}) {
  const px = size <= 48 ? 160 : size <= 120 ? 320 : 640
  return (
    <Sq
      r={Math.round(size * 0.3)}
      edge={!!ring}
      className={`avatar${ring ? ' has-ring' : ''}`}
      style={{ width: size, height: size }}
    >
      <img
        src={asset(photoSrc(id, px))}
        srcSet={`${asset(photoSrc(id, px))} 1x, ${asset(photoSrc(id, Math.min(640, px * 2)))} 2x`}
        width={size}
        height={size}
        alt={name}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </Sq>
  )
}

export function AvatarStack({ ids, size = 28, names }: { ids: MemberId[]; size?: number; names: Record<string, string> }) {
  return (
    <span className="avatar-stack" aria-label={ids.map((i) => names[i]).join(', ')}>
      {ids.map((i) => (
        <Avatar key={i} id={i} size={size} name="" ring />
      ))}
    </span>
  )
}

export { asset }
