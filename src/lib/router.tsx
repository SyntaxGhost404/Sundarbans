import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react'

// Hash routing keeps the build portable: it runs from any folder or host.

export interface Location {
  path: string
  parts: string[]
  query: URLSearchParams
  href: string
}

function read(): Location {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [pathPart, queryPart = ''] = raw.split('?')
  const path = ('/' + pathPart.replace(/^\/+/, '')).replace(/\/+$/, '') || '/'
  return {
    path,
    parts: path.split('/').filter(Boolean).map(decodeURIComponent),
    query: new URLSearchParams(queryPart),
    href: raw,
  }
}

let current = read()
const listeners = new Set<() => void>()
const scrollMemory = new Map<string, number>()
let popped = false

function emit() {
  const next = read()
  if (next.href === current.href) return
  scrollMemory.set(current.href, window.scrollY)
  const sameScreen = next.path === current.path
  current = next
  listeners.forEach((l) => l())
  const restore = popped ? (scrollMemory.get(next.href) ?? 0) : 0
  popped = false
  if (!sameScreen) {
    requestAnimationFrame(() => window.scrollTo({ top: restore, behavior: 'instant' }))
  }
}

if (typeof window !== 'undefined') {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.addEventListener('popstate', () => {
    popped = true
    emit()
  })
  window.addEventListener('hashchange', emit)
}

// Each in-app push records its depth, so Back knows whether the previous
// entry belongs to this app or to whatever page came before it.
const depth = () => (history.state && typeof history.state.idx === 'number' ? history.state.idx : 0)

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  const url = '#' + (to.startsWith('/') ? to : '/' + to)
  if (url === window.location.hash) return
  if (opts.replace) history.replaceState({ idx: depth() }, '', url)
  else history.pushState({ idx: depth() + 1 }, '', url)
  emit()
}

export function back(fallback = '/') {
  if (depth() > 0) history.back()
  else navigate(fallback, { replace: true })
}

export function useLocation(): Location {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => current,
  )
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; replace?: boolean }

export function Link({ to, replace, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return
    e.preventDefault()
    navigate(to, { replace })
  }
  return <a href={'#' + to} onClick={handle} {...rest} />
}

export function withQuery(path: string, params: Record<string, string | undefined>) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v)
  const s = q.toString()
  return s ? `${path}?${s}` : path
}
