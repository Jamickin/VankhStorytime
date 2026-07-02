# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**VANKH** is an **interactive reader** for the author's sci-fi story. The prose is the centrepiece; named entities (characters, places, factions, concepts) glow as you read, and clicking one opens a modal with art + backstory. It is a *reading experience*, not an authoring tool — readers consume, they don't edit. All content is authored in the repo.

(History note: this started as a concept-substitution "theme swapper," briefly became a localStorage authoring tool, then pivoted to this reader. If you find references to themes/stories/localStorage CRUD, they are gone — don't reintroduce them.)

## Commands

```bash
npm run dev          # Vite dev server (add -- --open)
npm run build        # -> ./build (static SPA via adapter-static)
npm run preview      # preview the production build
```

No test/lint/format tooling. `conceptParser.js` is pure ESM and can be spot-checked with `node --input-type=module`.

## Architecture

SvelteKit 2 + Svelte 5 (runes) + Tailwind 4, shipped as a **client-only static SPA** (`+layout.js`: `ssr = false`, `prerender = false`; adapter-static emits a `200.html` fallback). There is no server, database, or persisted user state — every reader sees the same authored content.

### Content (the source of truth) — `src/lib/content/`
- **`chapters.js`** — the story. Chapters live in `info/Vankh/_Published/*.md` and are pulled in at build time via `import.meta.glob`, cleaned of Obsidian markup (`[[links]]`, `#tags`, `---`, headings, emphasis), and exposed as ordered `{ slug, number, title, paragraphs[] }`. To add a chapter, drop a markdown file in that folder (heading `# Chapter X.Y: Title` drives slug/title).
- **`lore.js`** — the codex. Entries `{ id, term, aliases[], category, tagline, image, reveals[] }`. `term` + `aliases` are the surface forms matched in the prose; `category` is Character/Faction/Place/Concept; `image` is an optional path under `static/lore/` (null → painted placeholder); `tagline` is **always shown and must be spoiler-free**. `reveals` is the progressive-disclosure tier list — see below. Bodies are seeded from `info/Vankh/` and the chapters; they are canon — edit freely. **Image paths point to `.webp` files** (originals retained alongside).
- **`storyGraph.js`** — the branching layer. `FORKS` object maps chapter slug → `{ choices: [{ to, label, canon, hint }] }`. Only chapters that diverge from the linear spine need an entry; all others continue by `linearNext()`. Canon is always preserved: `canon: true` marks the original path. Branch chapter slugs use sub-decimal numbering (`1.2.3`, `2.1.4`, etc.) so they sort correctly between their fork and the next main chapter.

### Spoiler gating (progressive disclosure)
Each lore entry's `reveals` is an ordered list of `{ at, text }`, where `at` is a chapter slug (`"1-1"`, `"1-3"`, …). A reveal is shown only once the reader has `visited` that chapter slug. The modal always shows the portrait, name, and tagline, then the unlocked reveals, then a sealed note if any remain.

### Reading progress — `src/lib/progress.js`
This is the **only persisted state**. It now tracks a full branching journey rather than a single furthest-chapter index:

- `journey` — writable, ordered list of visited chapter slugs; persisted at `vankh:progress:v2`. Migrates from old v1 (single furthest-index) automatically.
- `visited` — derived `Set` of all slugs in `journey`; used to gate codex reveals and home-page chapter state.
- `completed` — writable `Set` of slugs where the reader reached the last page; persisted at `vankh:completed:v1`. Set by the read page's last-page trigger.
- `pageProgress` — writable `Map<slug, pageNum>`; persisted at `vankh:pages:v1`. Restores the reader's position within a chapter when they return.
- `loreRecords` — writable array of `{ id, firstChapter, lastChapter }` objects; persisted at `vankh:lore:v2`. Tracks which lore entries the reader has ever opened, and in which chapters.
- `openedLore` — derived from `loreRecords`; just the ordered IDs (backward compat).
- `currentReadingSlug` — writable, set by the read page so lore clicks know which chapter they're in.
- `visit(slug)` — call on chapter open; extends `journey`.
- `complete(slug)` — call on last page; extends `completed`.
- `savePageNum(slug, n)` / `getSavedPageNum(slug)` — page position helpers.
- `recordLoreOpen(id, chapterSlug)` — upserts a lore record; updates `lastChapter` on re-open.

### Engine — `src/lib/conceptParser.js` (pure)
`findConcepts(text, entries)` matches each entry's surface forms (word-boundary, case-insensitive) and returns **non-overlapping** matches (longest-match-wins) tagged with the entry id. `buildSegments(text, entries, mappings={})` turns text into ordered `{ text, conceptId }` segments; the reader calls it with **empty mappings**, so text is never rewritten — `conceptId` just marks what's clickable. (The `mappings` param is a vestige of the old theme-swapper; harmless, leave it.)

Alias gotcha: surface forms are matched case-insensitively, so don't add an alias that collides with a common verb/word (e.g. bare "Pulse" would match the verb "pulsed"). Use distinctive phrases ("the Pulse") instead.

### UI
- `routes/+page.svelte` — cover + chapter index. Shows per-chapter **read state** from `visited`/`completed`; hero button resumes at the next unread chapter.
- `routes/read/[slug]/+page.svelte` — the reader. **Paginates** the chapter (`paginate()` in `chapters.js`, ~1500-char pages, never splits a paragraph); `pageNum` is `$state`, restored from `pageProgress` on slug change. Arrow keys turn pages; a slim ember progress bar shows position; the last page reveals choices from `choicesFor()` (or → Codex at the end). Sets `currentReadingSlug` in an `$effect` so lore clicks are attributed to the chapter.
- `routes/codex/+page.svelte` — browse all entries, grouped by category. Shows discovered vs. undiscovered state.
- `routes/codex/[id]/+page.svelte` — **new** full lore entry profile page. Full-bleed portrait image, all unlocked reveals gated by `visited`, Pro's first-person section for the protagonist entry. `src/routes/codex/[id]/+page.js` sets `ssr = false` / `prerender = false`.
- `components/FloatingSidebar.svelte` — an always-48px icon rail on the left edge. Four icons open contextual drawers: **Home** (CTA), **Chapters** (chapter list with read state), **Codex** (last 3 discovered entries from `recentLore` in `lorePanel.js`), **Read** (current + prev/next chapter). Drawers slide in with spring ease; a bridge zone between rail and drawer prevents mouse-travel close.
- `components/StoryTimeline.svelte` — visual chapter graph. Part dividers are collision-checked against node positions (pushed ≥38px clear). **Nodes are draggable** via pointer capture; positions persist at `vankh:layout:v1` in localStorage. A reset button restores the default layout.

### Lore store — `src/lib/stores/lorePanel.js`
- `loreEntry` — writable, the currently-open lore entry (null = closed).
- `recentLore` — writable `string[]`, last 10 opened lore IDs (most-recent last). Used by FloatingSidebar's Codex drawer to show the last 3. **Distinct from `progress.js`'s `openedLore`** (which is the full discovery list with chapter metadata).
- `openLore(idOrEntry)` — sets `loreEntry`, updates `recentLore`, and calls `recordLoreOpen()` from `progress.js` to persist discovery.
- `closeLore()` — clears `loreEntry`.

### Motion
- **Route changes** ("burning paper"): a full-screen **ash-and-ember veil** in `+layout.svelte`, driven by SvelteKit `onNavigate`. An opaque ash sheet sweeps up to cover the screen; the DOM swap happens *under* the veil; then it lifts. The fire transition now includes: large slow gray **ash particles**, a **screen shake** at cover peak, and an **afterglow radial gradient** on reveal end.
- **Splash screen**: runs a 700ms ember particle animation on first session load (sessionStorage-gated), dismissed with a fire-sweep. `prefers-reduced-motion` gets an instant dismiss.
- **Page turns** (pagination within a chapter): light/quick — `ember` (in-only) from `src/lib/transitions.js` on `{#key pageNum}`.
- **Lore modal**: `scale`+`fade`. **Ambient**: faint always-on `.embers` drift.
- All motion is gated by `prefers-reduced-motion` (the veil is `display:none`, transitions return `duration:0`).
- `components/ProseReader.svelte` — paragraphs with clickable lore terms. Links read as **plain prose and only glow on hover/focus** (a deliberate discovery mechanic); `.lore-link` styling lives here.
- `components/LoreModal.svelte` — the entry modal (framed painted header + chip + tagline + unlocked reveals + sealed note). Controlled via `entry`/`onclose`; reads `visited` from `progress.js` to gate reveals.
- `components/LoreImage.svelte` — entry image, or an **impasto** painted placeholder (`.impasto` class) tinted per category via `paintVars()` when `image` is null.
- `src/lib/ui.js` — per-category oil palette: `categoryStyle` (chip + glyph), `paintVars` (the `--c1/--c2/--c3` for `.impasto`), `initials()`.

### Look & feel — Impasto Expressionism
The aesthetic is a **dark painterly gallery** (the author will create impasto/expressionist portraits + landscapes for the real `image`s). Implemented in `app.css`: `body` is deep umber (`#14100c`), the `.gallery` wrapper adds a warm vignette + fixed canvas-grain overlay; `.impasto` fakes palette-knife paint (layered gradients + raised-paint inset shadows + knife-stroke striations + grain); `.frame` is a gilded gallery frame. Font is **Montserrat** (loaded in `app.html`). Accent is gilt/amber; category oils: Character=cadmium red, Faction=ochre, Place=viridian, Concept=ultramarine (`ui.js`).

### Conventions
- Svelte 5 runes (`$props`, `$state`, `$derived`, `$effect`) and `onclick={...}` handlers throughout — match this.
- Real artwork goes in `static/lore/<id>.webp` (convert to WebP before committing; originals may be kept alongside). Reference from the entry's `image` field as `/lore/<id>.webp`. The `.impasto` placeholder renders automatically when `image` is null.

### Content
The story is a **branching narrative**. The canon spine is always walkable; branch chapters use sub-decimal slugs. Current chapter tree includes:

- **Parts 1–4 canon spine**: chapters 1-1 through 4-2
- **Branch chapters**: 1-2-1, 1-2-2, 1-2-3 (dead-end), 1-3-1, 1-3-2, 2-1-1, 2-1-2, 2-1-3, 2-1-4 (dead-end), 2-2-1, 2-2-2, 3-1-1, 3-1-2, 3-1-3 (reconnects to 3-2), 3-2-1, 3-3-1, 3-3-2, 3-4-1, 4-1-1, 4-1-2, 4-1-3 (reconnects to 4-2)

When adding new branch chapters: create the `.md` in `_Published/`, add fork entries to `storyGraph.js`, and add any new lore `reveals` to `lore.js` gated at the appropriate chapter slug.

## `info/` directory
`info/Vankh/` is the full worldbuilding + manuscript corpus (characters, places, drafts V1–V3, final draft, published chapters). Only `_Published/*.md` is wired into the app (as chapters); the character/place notes are the canonical source the `lore.js` bodies are written from. The rest is raw material for future chapters and entries.

`info/Vankh/_Portraits/` holds the **image-generation prompts** for the codex art (impasto/expressionist style). Each keeps a shared verbatim STYLE BLOCK so the gallery reads as one painter's hand. Workflow: generate square 1:1 → convert to WebP → save as `static/lore/<id>.webp` → set `image: "/lore/<id>.webp"` on the matching `lore.js` entry. The `.impasto` placeholder is replaced with no other code change.
