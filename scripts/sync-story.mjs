// Copies the Sundarbans chapters from the storyline branch into the site.
// Usage: npm run sync:story   (STORY_REF overrides the source ref)
// The site bans em and en dashes, so interrupted speech becomes an ellipsis
// and a spaced dash becomes a colon. The storyline branch is never touched.
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

const ref = process.env.STORY_REF || 'origin/ccr-6369fa6b-s8haxr'
const outDir = new URL('../src/content/story/', import.meta.url)
mkdirSync(outDir, { recursive: true })

const clean = (s) =>
  s
    .replace(/"—/g, '"…')
    .replace(/—"/g, '…"')
    .replace(/\s+—\s+/g, ': ')
    .replace(/—/g, '…')
    .replace(/–/g, '-')
    .replace(/[ \t]+/g, ' ')
    .trim()

const index = []
for (let n = 1; n <= 16; n++) {
  const file = `story/chapters/ch${String(n).padStart(2, '0')}.md`
  const md = execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8' })
  const paras = md
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !/^##\s/.test(p))
    .map(clean)
  const words = paras.join(' ').split(/\s+/).filter(Boolean).length
  writeFileSync(new URL(`ch${String(n).padStart(2, '0')}.json`, outDir), JSON.stringify({ n, words, paras }))
  index.push({ n, words })
  console.log(`ch${n}: ${paras.length} paragraphs, ${words} words`)
}
writeFileSync(new URL('index.json', outDir), JSON.stringify(index))
