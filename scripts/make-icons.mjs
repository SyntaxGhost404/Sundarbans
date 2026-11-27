// Renders the app icons from public/favicon.svg and public/icons/maskable.svg.
// Usage: node scripts/make-icons.mjs   (needs Playwright with Chromium)
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const root = new URL('../public/', import.meta.url)
const favicon = readFileSync(new URL('favicon.svg', root), 'utf8')
const maskable = readFileSync(new URL('icons/maskable.svg', root), 'utf8')

const jobs = [
  { svg: favicon, size: 192, out: 'icons/icon-192.png', transparent: true },
  { svg: favicon, size: 512, out: 'icons/icon-512.png', transparent: true },
  { svg: maskable, size: 512, out: 'icons/maskable-512.png', transparent: false },
  { svg: maskable, size: 180, out: 'icons/apple-touch-icon.png', transparent: false },
]

const browser = await chromium.launch()
const page = await browser.newPage({ deviceScaleFactor: 1 })
for (const j of jobs) {
  await page.setViewportSize({ width: j.size, height: j.size })
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${j.svg.replace('<svg ', `<svg width="${j.size}" height="${j.size}" `)}</body></html>`,
  )
  await page.screenshot({ path: new URL(j.out, root).pathname, omitBackground: j.transparent })
  console.log('wrote', j.out)
}
await browser.close()
