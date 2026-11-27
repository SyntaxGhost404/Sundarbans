# Most Lights

Case files, evidence and field tools from five brothers who look for the person behind the light.

This branch holds only the website. The story lives on the storyline branch, and the site copies its chapters in at build time.

## Run it

```bash
npm install
npm run dev        # local server with hot reload
npm run build      # checks, type check, then a production build in dist/
npm run preview    # serve dist/ locally
```

The build uses relative paths and hash routes, so `dist/` runs from any folder or subpath: GitHub Pages, Netlify, a USB stick.

### Deploy to GitHub Pages

1. `npm run build`
2. Publish the contents of `dist/` to a `gh-pages` branch, or point Pages at a folder that holds them.

## What is in it

| Screen | What it does |
|---|---|
| Desk | Tonight's moon and tide for a chosen place, reading progress, the two cases, pinned clues |
| Cases | Both case files with overview, day by day timeline (each day's moon computed), people, what was explained, and the route |
| Board | 27 clues with filters and search. Press and hold, or tap the pin, to keep a clue on the Desk |
| Unexplained | The Calling and the Doyani Lights, with both nights drawn minute by minute |
| Read | The full Bangla story, 16 chapters, with saved position and reading settings |
| Team | The five of us, and who calls whom what |
| Field tools | Moon and tide (with witness check), Districts (Fakhru's rule), Field kit, Report a light |
| Settings | Theme, haptic feedback, reduce motion, spoilers, reading, clear data |

Spoilers wait behind a press and hold, and open by themselves once that chapter has been read.

## How it is built

- Vite, React 19, TypeScript, Motion for gestures and layout animation, Zustand for state saved on the device.
- Squircles everywhere: native CSS `corner-shape: squircle` where the browser supports it, otherwise a Figma-style smoothed path applied as a clip, with the border drawn as an SVG edge (`src/lib/squircle.ts`, `src/lib/Sq.tsx`). Add `?sq=js` to the URL to force the fallback.
- Sun and moon come from published formulas computed on the device: SunCalc for positions, rise and set; Meeus for phase times (`src/lib/astro.ts`). All times are Bangladesh time.
- Haptics use the Vibration API, with the native switch tick on iOS 18 and later (`src/lib/haptics.ts`). Settings has the toggle.
- Works offline after the first visit (`public/sw.js`).

## Content

- `src/content/*.ts`: cases, clues, people, the unexplained, districts, kit lists.
- `src/content/story/*.json`: the chapters, copied from the storyline branch by `npm run sync:story`. Em and en dashes are converted on the way in, since the site does not use them.
- `public/photos/`: grayscale crops of our 2025 photos, made by `scripts/process-photos.py`.
- `public/icons/`: rendered from `public/favicon.svg` by `npm run icons`.

## House rules, checked on every build

`npm run check` fails the build if it finds an em dash, en dash or spaced hyphen in the text, any emoji, or a colour in the pink, purple, violet, blue, orange or brown range.
