# VANKH

An interactive reader for a sci-fi story. Prose is the centrepiece — named entities (characters, places, factions, concepts) glow as you read, and clicking one opens a modal with art and backstory. Readers consume; they don't edit. All content is authored in the repo.

## Stack

- **SvelteKit 2 + Svelte 5 (runes)** — `$state`, `$derived`, `$effect`, `onclick` throughout
- **Tailwind 4**
- **adapter-static** — ships as a client-only SPA (`ssr = false`, `prerender = false`); a `200.html` fallback handles deep links

No server, no database, no persisted user state beyond reading progress (localStorage key `vankh:progress:v1`).

## Commands

```bash
npm install
npm run dev          # Vite dev server
npm run dev -- --open
npm run build        # -> ./build
npm run preview      # preview production build
```

No test, lint, or format tooling.

## Content

### Chapters — `src/lib/content/chapters.js`

Markdown files in `info/Vankh/_Published/*.md` are pulled in at build time via `import.meta.glob`. Each file's `# Chapter X.Y: Title` heading drives its slug and title. Obsidian markup (`[[links]]`, `#tags`, frontmatter, emphasis) is stripped automatically. To publish a chapter, drop a `.md` file in that folder.

### Lore codex — `src/lib/content/lore.js`

Each entry: `{ id, term, aliases[], category, tagline, image, reveals[] }`.

- `term` + `aliases` — surface forms matched in prose (case-insensitive, word-boundary)
- `category` — `Character` | `Faction` | `Place` | `Concept`
- `tagline` — always visible; must be spoiler-free
- `image` — path under `static/lore/` (null → painted placeholder)
- `reveals` — progressive-disclosure tiers: `[{ at: "1-3", text: "..." }]`; a tier is shown only after the reader reaches that chapter

### Spoiler gating

`src/lib/progress.js` tracks `furthestChapter` (chapter index, mirrored to localStorage). `LoreModal` gates reveals by comparing `chapterIndex(reveal.at) <= $furthestChapter`. Deeper tiers show a "🔒 N more truths sealed" note.

## Engine

`src/lib/conceptParser.js` — pure ESM, no dependencies.

- `findConcepts(text, entries)` — non-overlapping longest-match-wins scan; returns match positions tagged with entry id
- `buildSegments(text, entries)` — splits text into `{ text, conceptId }` segments for the prose renderer

Spot-check: `node --input-type=module < somefile.js`

## Routes

| Route | Purpose |
|---|---|
| `/` | Cover + chapter index; shows read state per chapter; hero button resumes next unread |
| `/read/[slug]` | Paginated reader (~1500-char pages, never splits a paragraph); arrow-key navigation; ember progress bar; chapter hand-off on last page |
| `/codex` | Browse all lore entries grouped by category |

## Look & feel — Impasto Expressionism

Dark painterly gallery aesthetic. Key CSS in `app.css`:

- `body` — deep umber `#14100c`
- `.gallery` — warm vignette + fixed canvas-grain overlay
- `.impasto` — fake palette-knife paint (layered gradients, raised-paint inset shadows, knife-stroke striations, grain); tinted per category via `paintVars()` in `src/lib/ui.js`
- `.frame` — gilded gallery frame
- Font: **Montserrat**
- Accent: gilt/amber
- Category oils: Character=cadmium red, Faction=ochre, Place=viridian, Concept=ultramarine

Real portrait PNGs go in `static/lore/<id>.png`; setting `image` on the lore entry replaces the placeholder with no other code change. Generation prompts live in `info/Vankh/_Portraits/`.

## Motion

- **Route transitions** — "burning paper" ash-and-ember veil in `+layout.svelte`, driven by SvelteKit `onNavigate`. The veil covers the screen; the DOM swap happens underneath it; then it lifts. Avoids the `{#key}` + SvelteKit outgoing-page pitfall.
- **Page turns** — light `ember` transition (in-only) from `src/lib/transitions.js` on `{#key pageNum}`.
- **Lore modal** — `scale` + `fade`.
- All motion respects `prefers-reduced-motion`.

## `info/` directory

`info/Vankh/` holds the full worldbuilding corpus — character notes, place notes, drafts V1–V3, final draft, published chapters. Only `_Published/*.md` is wired into the app. The rest is canon source material for writing lore entries and future chapters.
