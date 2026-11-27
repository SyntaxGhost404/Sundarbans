import {
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import { motion } from 'motion/react'
import { Sq } from '../lib/Sq'
import { Link } from '../lib/router'
import { haptic, type HapticKind } from '../lib/haptics'
import { useCalm } from '../lib/hooks'
import { Icon, type IconName } from './Icon'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const BTN_R: Record<Size, number> = { sm: 10, md: 14, lg: 14 }

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  variant?: Variant
  size?: Size
  icon?: IconName
  iconRight?: IconName
  to?: string
  block?: boolean
  feel?: HapticKind | false
  type?: 'button' | 'submit'
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  to,
  block,
  feel = 'tap',
  className = '',
  children,
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) {
  const cls = `btn btn-${variant} btn-${size}${block ? ' btn-block' : ''}${children ? '' : ' btn-icon-only'} ${className}`
  const body = (
    <>
      {icon && <Icon name={icon} size={size === 'sm' ? 18 : 20} />}
      {children && <span className="btn-label">{children}</span>}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 16 : 18} />}
    </>
  )
  if (to) {
    return (
      <Sq
        as={Link}
        to={to}
        r={BTN_R[size]}
        className={cls}
        onClick={() => feel && haptic(feel)}
        aria-label={rest['aria-label']}
      >
        {body}
      </Sq>
    )
  }
  return (
    <Sq
      as="button"
      type={type}
      r={BTN_R[size]}
      className={cls}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (feel) haptic(feel)
        onClick?.(e)
      }}
      {...rest}
    >
      {body}
    </Sq>
  )
}

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  icon: IconName
  label: string
  to?: string
  feel?: HapticKind | false
  active?: boolean
  size?: 'sm' | 'md'
}

export function IconButton({
  icon,
  label,
  to,
  feel = 'tap',
  active,
  size = 'md',
  className = '',
  onClick,
  ...rest
}: IconButtonProps) {
  const cls = `icon-btn icon-btn-${size}${active ? ' is-active' : ''} ${className}`
  const r = size === 'sm' ? 10 : 12
  if (to) {
    return (
      <Sq as={Link} to={to} r={r} className={cls} aria-label={label} title={label} onClick={() => feel && haptic(feel)}>
        <Icon name={icon} size={size === 'sm' ? 18 : 22} />
      </Sq>
    )
  }
  return (
    <Sq
      as="button"
      type="button"
      r={r}
      className={cls}
      aria-label={label}
      title={label}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (feel) haptic(feel)
        onClick?.(e)
      }}
      {...rest}
    >
      <Icon name={icon} size={size === 'sm' ? 18 : 22} />
    </Sq>
  )
}

export interface SegOption<T extends string> {
  value: T
  label: ReactNode
  icon?: IconName
  aria?: string
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  block,
}: {
  options: SegOption<T>[]
  value: T
  onChange: (v: T) => void
  label: string
  size?: 'sm' | 'md'
  block?: boolean
}) {
  const id = useId()
  const calm = useCalm()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const index = Math.max(0, options.findIndex((o) => o.value === value))

  const onKey = (e: KeyboardEvent) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    const jump = e.key === 'Home' ? 0 : e.key === 'End' ? options.length - 1 : -1
    if (!dir && jump < 0) return
    e.preventDefault()
    const next = jump >= 0 ? jump : (index + dir + options.length) % options.length
    onChange(options[next].value)
    haptic('select')
    refs.current[next]?.focus()
  }

  return (
    <Sq
      r={size === 'sm' ? 10 : 14}
      className={`seg seg-${size}${block ? ' seg-block' : ''}`}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKey}
    >
      {options.map((o, i) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={o.aria}
            tabIndex={on ? 0 : -1}
            className={`seg-item${on ? ' is-on' : ''}`}
            onClick={() => {
              if (!on) {
                haptic('select')
                onChange(o.value)
              }
            }}
          >
            {on && (
              <motion.span
                layoutId={`seg-${id}`}
                className="seg-thumb-wrap"
                transition={calm ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 40 }}
              >
                <Sq r={size === 'sm' ? 7 : 11} className="seg-thumb" />
              </motion.span>
            )}
            <span className="seg-label">
              {o.icon && <Icon name={o.icon} size={18} />}
              {o.label}
            </span>
          </button>
        )
      })}
    </Sq>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <Sq
      as="button"
      type="button"
      role="switch"
      r={10}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`toggle${checked ? ' is-on' : ''}`}
      onClick={() => {
        haptic('toggle', true)
        onChange(!checked)
      }}
    >
      <Sq r={7} edge={false} className="toggle-knob" />
    </Sq>
  )
}

export function Check({
  checked,
  onChange,
  label,
  children,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  children?: ReactNode
  hint?: ReactNode
}) {
  return (
    <label className={`check-row${checked ? ' is-on' : ''}`}>
      <input
        type="checkbox"
        className="vh"
        checked={checked}
        aria-label={label}
        onChange={(e) => {
          haptic(e.target.checked ? 'select' : 'tap')
          onChange(e.target.checked)
        }}
      />
      <Sq r={6} className="check-box" aria-hidden="true">
        <Icon name="check" size={16} />
      </Sq>
      {(children || hint) && (
        <span className="check-text">
          {children && <span className="check-label">{children}</span>}
          {hint && <span className="check-hint">{hint}</span>}
        </span>
      )}
    </label>
  )
}

export function Chip({
  on,
  onClick,
  icon,
  children,
  count,
}: {
  on?: boolean
  onClick?: () => void
  icon?: IconName
  children: ReactNode
  count?: number
}) {
  return (
    <Sq
      as="button"
      type="button"
      r={10}
      aria-pressed={on}
      className={`chip${on ? ' is-on' : ''}`}
      onClick={() => {
        haptic('select')
        onClick?.()
      }}
    >
      {icon && <Icon name={icon} size={16} />}
      <span>{children}</span>
      {count !== undefined && <span className="chip-count">{count}</span>}
    </Sq>
  )
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: ReactNode
  error?: string
  icon?: IconName
  trailing?: ReactNode
}

export function Field({ label, hint, error, icon, trailing, id, className = '', ...rest }: FieldProps) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <div className={`field-wrap ${className}`}>
      {label && (
        <label className="field-label" htmlFor={fid}>
          {label}
        </label>
      )}
      <Sq r={14} className={`field${error ? ' has-error' : ''}`}>
        {icon && <Icon name={icon} size={20} className="field-icon" />}
        <input
          id={fid}
          className="field-input"
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${fid}-note` : undefined}
          {...rest}
        />
        {trailing}
      </Sq>
      {(error || hint) && (
        <p id={`${fid}-note`} className={error ? 'field-error' : 'field-hint'}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}

export function TextArea({
  label,
  hint,
  id,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: ReactNode }) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <div className="field-wrap">
      {label && (
        <label className="field-label" htmlFor={fid}>
          {label}
        </label>
      )}
      <Sq r={14} className="field field-area">
        <textarea id={fid} className="field-input" aria-describedby={hint ? `${fid}-note` : undefined} {...rest} />
      </Sq>
      {hint && (
        <p id={`${fid}-note`} className="field-hint">
          {hint}
        </p>
      )}
    </div>
  )
}

export function Badge({
  tone = 'neutral',
  children,
  icon,
}: {
  tone?: 'neutral' | 'accent' | 'warn' | 'danger' | 'quiet'
  children: ReactNode
  icon?: IconName
}) {
  return (
    <Sq as="span" r={6} edge={tone === 'quiet'} className={`badge badge-${tone}`}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </Sq>
  )
}

export function Card({
  children,
  className = '',
  to,
  onClick,
  r = 20,
  as,
  ...rest
}: {
  children: ReactNode
  className?: string
  to?: string
  onClick?: () => void
  r?: number
  as?: 'section' | 'article' | 'div' | 'li'
  [key: string]: unknown
}) {
  if (to) {
    return (
      <Sq as={Link} to={to} r={r} className={`card card-link ${className}`} onClick={() => haptic('tap')} {...rest}>
        {children}
      </Sq>
    )
  }
  if (onClick) {
    return (
      <Sq
        as="button"
        type="button"
        r={r}
        className={`card card-link ${className}`}
        onClick={() => {
          haptic('tap')
          onClick()
        }}
        {...rest}
      >
        {children}
      </Sq>
    )
  }
  return (
    <Sq as={as ?? 'div'} r={r} className={`card ${className}`} {...rest}>
      {children}
    </Sq>
  )
}

export function SectionHead({
  title,
  action,
  id,
  sub,
}: {
  title: ReactNode
  action?: ReactNode
  id?: string
  sub?: ReactNode
}) {
  return (
    <div className="section-head">
      <div>
        <h2 id={id} className="section-title">
          {title}
        </h2>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function Empty({ icon, title, children }: { icon: IconName; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <Sq r={14} className="empty-icon">
        <Icon name={icon} size={24} />
      </Sq>
      <p className="empty-title">{title}</p>
      {children && <div className="empty-body">{children}</div>}
    </div>
  )
}

export function Meter({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(1, value))
  return (
    <Sq
      r={2}
      edge={false}
      className="meter"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
    >
      <span className="meter-fill" style={{ transform: `scaleX(${v})` }} />
    </Sq>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>
}
