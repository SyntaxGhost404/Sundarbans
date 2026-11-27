export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed'

/** Copies text, trying the modern API first and an old fallback second. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}

/** Opens the system share sheet when there is one, otherwise copies. */
export async function shareText(title: string, text: string): Promise<ShareResult> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text })
      return 'shared'
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
      // Some browsers refuse plain text or block sharing in frames. Copy instead.
    }
  }
  return (await copyText(text)) ? 'copied' : 'failed'
}
