// Checks the site against its own rules before shipping:
//  1. No em dash, en dash, figure dash, horizontal bar or minus sign in any text.
//  2. No spaced hyphen used as punctuation (" - ") in strings or markup.
//  3. No emoji or pictographs.
//  4. No banned accent hues (pink, purple, violet, blue, orange, brown) in colours.
// Usage: npm run check
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const targets = ['src', 'public', 'index.html']
const textExt = new Set(['.ts', '.tsx', '.css', '.html', '.json', '.svg', '.webmanifest', '.js', '.mjs'])

const files = []
const walk = (p) => {
  const st = statSync(p)
  if (st.isDirectory()) readdirSync(p).forEach((f) => walk(join(p, f)))
  else if (textExt.has(extname(p))) files.push(p)
}
targets.forEach((t) => walk(join(root, t)))

const problems = []
const report = (file, line, msg) => problems.push(`${relative(root, file)}:${line}  ${msg}`)

const DASHES = /[‒–—―−﹘﹣－]/
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u
// A spaced hyphen inside a quoted string or JSX text, but not in code like "a - b".
const SPACED_HYPHEN = /(['"`>][^'"`<>]*\s-\s[^'"`<>]*['"`<])/

function hue(hex) {
  let h = hex.replace('#', '')
  if (h.length === 3) h = [...h].map((c) => c + c).join('')
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  const l = (max + min) / 2
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  let H = 0
  if (d) {
    if (max === r) H = ((g - b) / d) % 6
    else if (max === g) H = (b - r) / d + 2
    else H = (r - g) / d + 4
    H *= 60
    if (H < 0) H += 360
  }
  return { H, s, l }
}

// Allowed: neutrals (low saturation), reds (danger), yellows, yellow-greens and greens.
function banned(hex) {
  const { H, s, l } = hue(hex)
  if (s < 0.12 || l < 0.06 || l > 0.97) return null
  if (H >= 345 || H < 12) return null // red
  if (H >= 12 && H < 45) return 'orange or brown'
  if (H >= 45 && H < 165) return null // yellow to green
  if (H >= 165 && H < 260) return 'blue or teal'
  if (H >= 260 && H < 300) return 'violet or purple'
  return 'pink or magenta'
}

for (const file of files) {
  const rel = relative(root, file)
  const isCode = /\.(tsx?|m?js)$/.test(file)
  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    const n = i + 1
    if (DASHES.test(line)) report(file, n, 'dash character')
    if (EMOJI.test(line)) report(file, n, 'emoji or pictograph')
    if ((isCode || rel.endsWith('.html')) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
      // Template expressions are code, so arithmetic inside ${...} is fine.
      const text = line.replace(/\$\{[^}]*\}/g, '')
      if (SPACED_HYPHEN.test(text)) report(file, n, `spaced hyphen: ${line.trim().slice(0, 80)}`)
    }
    for (const m of line.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)) {
      const why = banned(m[0])
      if (why) report(file, n, `${m[0]} reads as ${why}`)
    }
  })
}

if (problems.length) {
  console.error(`Found ${problems.length} problem(s):\n` + problems.join('\n'))
  process.exit(1)
}
console.log(`Checked ${files.length} files: no dashes, emoji or banned colours.`)
