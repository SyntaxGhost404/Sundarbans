// Builds a copy of the site shaped for an HTML preview host: fonts linked from
// Google Fonts, no service worker or manifest, and the page body without its
// own <html>/<head>/<body> wrapper (the host adds one).
// Usage: node scripts/build-preview.mjs  ->  dist-preview/
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'

execFileSync('npx', ['vite', 'build', '--mode', 'preview-host'], { stdio: 'inherit' })
const dir = new URL('../dist-preview/', import.meta.url)
let html = readFileSync(new URL('index.html', dir), 'utf8')
const fonts =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Noto+Sans+Bengali:wght@400..700&family=Noto+Serif+Bengali:wght@400..700&display=swap">\n'
html = html
  .replace(/<!doctype html>\s*/i, '')
  .replace(/<html[^>]*>\s*/i, '')
  .replace(/<\/html>\s*/i, '')
  .replace(/<head>\s*/i, '')
  .replace(/<\/head>\s*/i, '')
  .replace(/<body>\s*/i, '')
  .replace(/<\/body>\s*/i, '')
  .replace(/\s*<link rel="manifest"[^>]*>/i, '')
  .replace(/<meta charset="UTF-8" \/>\s*/i, '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, '')
// Keep the title first, then the fonts.
html = html.replace(/(<title>[^<]*<\/title>)/, `$1\n${fonts}`)
writeFileSync(new URL('index.html', dir), html)
rmSync(new URL('sw.js', dir), { force: true })
rmSync(new URL('manifest.webmanifest', dir), { force: true })
console.log('dist-preview/index.html ready')
