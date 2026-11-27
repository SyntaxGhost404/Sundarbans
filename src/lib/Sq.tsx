import {
  createElement,
  useCallback,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type Ref,
} from 'react'
import { squircleMode, squirclePath, type Radii } from './squircle'

// One shared observer keeps every JS-mode squircle in step with its box.
type Entry = { draw: (w: number, h: number) => void }
const entries = new WeakMap<Element, Entry>()
let observer: ResizeObserver | null = null

function observe(el: Element, entry: Entry) {
  if (!observer) {
    observer = new ResizeObserver((records) => {
      for (const rec of records) {
        const box = rec.borderBoxSize?.[0]
        const w = box ? box.inlineSize : (rec.target as HTMLElement).offsetWidth
        const h = box ? box.blockSize : (rec.target as HTMLElement).offsetHeight
        entries.get(rec.target)?.draw(w, h)
      }
    })
  }
  entries.set(el, entry)
  observer.observe(el, { box: 'border-box' })
}

function unobserve(el: Element) {
  entries.delete(el)
  observer?.unobserve(el)
}

const radiusVar = (r: Radii): CSSProperties => {
  if (Array.isArray(r)) {
    return {
      ['--r-tl' as string]: `${r[0]}px`,
      ['--r-tr' as string]: `${r[1]}px`,
      ['--r-br' as string]: `${r[2]}px`,
      ['--r-bl' as string]: `${r[3]}px`,
    }
  }
  return { ['--r' as string]: `${r}px` }
}

/**
 * Applies the squircle to a DOM node. In native mode CSS does everything and
 * this is a no-op. In JS mode the node is clipped and an edge path is updated.
 */
export function useSquircle<T extends Element>(radius: Radii, enabled = true) {
  const nodeRef = useRef<T | null>(null)
  const edgeRef = useRef<SVGPathElement | null>(null)
  const key = Array.isArray(radius) ? radius.join(',') : String(radius)

  useLayoutEffect(() => {
    const el = nodeRef.current as unknown as HTMLElement | null
    if (!el || squircleMode === 'native' || !enabled) return
    const r: Radii = key.includes(',') ? (key.split(',').map(Number) as Radii) : Number(key)
    const draw = (w: number, h: number) => {
      const d = squirclePath(w, h, r)
      el.style.clipPath = d ? `path('${d}')` : ''
      edgeRef.current?.setAttribute('d', d)
    }
    draw(el.offsetWidth, el.offsetHeight)
    observe(el, { draw })
    return () => {
      unobserve(el)
      el.style.clipPath = ''
    }
  }, [key, enabled])

  return { nodeRef, edgeRef }
}

/** Edge stroke for JS mode. CSS colours it per component and state. */
export function SqEdge({ edgeRef }: { edgeRef: Ref<SVGPathElement> }) {
  if (squircleMode === 'native') return null
  return (
    <svg className="sq-edge" aria-hidden="true" focusable="false">
      <path ref={edgeRef} />
    </svg>
  )
}

type SqProps = {
  as?: ElementType
  r?: Radii
  className?: string
  style?: CSSProperties
  children?: ReactNode
  edge?: boolean
  ref?: Ref<HTMLElement>
  // Any other prop goes straight to the rendered element.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (value: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(value)
      else if (ref && typeof ref === 'object') (ref as { current: T | null }).current = value
    }
  }
}

/** A squircle surface. `r` is the design radius in px; `edge` draws the border. */
export function Sq({ as = 'div', r = 14, className, style, children, edge = true, ref, ...rest }: SqProps) {
  const { nodeRef, edgeRef } = useSquircle<HTMLElement>(r as Radii)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setRef = useCallback(mergeRefs<HTMLElement>(nodeRef, ref), [ref])
  return createElement(
    as,
    {
      ...rest,
      ref: setRef,
      className: className ? `sq ${className}` : 'sq',
      style: { ...radiusVar(r as Radii), ...(style as CSSProperties) },
    },
    children,
    edge ? <SqEdge edgeRef={edgeRef} /> : null,
  )
}
