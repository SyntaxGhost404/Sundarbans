import { useStore } from './store'

// Short, quiet patterns. Each one means one thing everywhere in the app.
const patterns = {
  tap: 8,
  select: 6,
  toggle: 10,
  success: [10, 40, 14],
  warning: [16, 50, 16],
  error: [24, 60, 24, 60, 24],
} as const

export type HapticKind = keyof typeof patterns

const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
const isIOS =
  typeof navigator !== 'undefined' &&
  (/iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

// iOS Safari has no vibrate API. Since iOS 18, flipping a native switch
// control plays the system tick, so a hidden switch stands in for it.
let iosLabel: HTMLLabelElement | null = null
function iosTick() {
  if (!iosLabel) {
    iosLabel = document.createElement('label')
    iosLabel.setAttribute('aria-hidden', 'true')
    iosLabel.style.cssText =
      'position:fixed;left:-100px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.setAttribute('switch', '')
    input.tabIndex = -1
    iosLabel.appendChild(input)
    document.body.appendChild(iosLabel)
  }
  iosLabel.click()
}

export const hapticsSupport: 'vibrate' | 'ios' | 'none' = canVibrate
  ? 'vibrate'
  : isIOS
    ? 'ios'
    : 'none'

export function haptic(kind: HapticKind = 'tap', force = false) {
  if (!force && !useStore.getState().haptics) return
  try {
    if (canVibrate) navigator.vibrate(patterns[kind] as number | number[])
    else if (isIOS) iosTick()
  } catch {
    /* some browsers throw outside a user gesture; haptics are optional */
  }
}
