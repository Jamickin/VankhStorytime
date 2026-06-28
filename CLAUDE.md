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
- **`lore.js`** — the codex. Entries `{ id, term, aliases[], category, tagline, image, reveals[] }`. `term` + `aliases` are the surface forms matched in the prose; `category` is Character/Faction/Place/Concept; `image` is an optional path under `static/lore/` (null → painted placeholder); `tagline` is **always shown and must be spoiler-free**. `reveals` is the progressive-disclosure tier list — see below. Bodies are seeded from `info/Vankh/` and the chapters; they are canon — edit freely.

### Spoiler gating (progressive disclosure)
Each lore entry's `reveals` is an ordered list of `{ at, text }`, where `at` is a chapter slug (`"1-1"`, `"1-3"`, …). A reveal is shown only once the reader has reached that chapter; deeper tiers stay **sealed** until earned. The modal always shows the portrait, name, and tagline, then the unlocked reveals, then a "🔒 N more truths sealed" note if any remain.
- Reading progress is the **only persisted state**: `src/lib/progress.js` holds `furthestChapter` (a writable mirrored to localStorage key `vankh:progress:v1`, `-1` = unread). `routes/read/[slug]` calls `reachChapter(idx)` in an `$effect` on view.
- `LoreModal` computes unlocked tiers via `chapterIndex(reveal.at) <= $furthestChapter`. When you add a reveal, pick the chapter where that fact first becomes known in the prose.

### Engine — `src/lib/conceptParser.js` (pure)
`findConcepts(text, entries)` matches each entry's surface forms (word-boundary, case-insensitive) and returns **non-overlapping** matches (longest-match-wins) tagged with the entry id. `buildSegments(text, entries, mappings={})` turns text into ordered `{ text, conceptId }` segments; the reader calls it with **empty mappings**, so text is never rewritten — `conceptId` just marks what's clickable. (The `mappings` param is a vestige of the old theme-swapper; harmless, leave it.)

Alias gotcha: surface forms are matched case-insensitively, so don't add an alias that collides with a common verb/word (e.g. bare "Pulse" would match the verb "pulsed"). Use distinctive phrases ("the Pulse") instead.

### UI
- `routes/+page.svelte` — cover + chapter index. Shows per-chapter **read state** (`✦ read` / `up next`) from `furthestChapter`; hero button resumes at the next unread chapter.
- `routes/read/[slug]/+page.svelte` — the reader. **Paginates** the chapter (`paginate()` in `chapters.js`, ~1500-char pages, never splits a paragraph); `pageNum` is `$state`, reset via `$effect` on slug change. Arrow keys turn pages; a slim ember progress bar (not a per-page index) shows position; the last page reveals a "Continue → next chapter" hand-off (or → Codex at the end). Holds the selected-lore `$state` + lore modal.
- `routes/codex/+page.svelte` — browse all entries, grouped by category.

### Motion
- **Route changes** ("burning paper"): a full-screen **ash-and-ember veil** in `+layout.svelte`, driven by SvelteKit `onNavigate`. An opaque ash sheet (`.veil` / `.veil-sheet` in `app.css`, glowing ember leading edge + canvas grain) sweeps up to cover the screen; the callback returns a promise so the DOM swap happens *under* the veil (`await navigation.complete`); then it lifts away to reveal the new page. This avoids the `{#key}`+SvelteKit pitfall where outgoing page content is replaced before it can animate, which caused overlapping text — **don't go back to a content-level out: transition for routes.**
- **Page turns** (pagination within a chapter): light/quick — `ember` (in-only) from `src/lib/transitions.js` on `{#key pageNum}`. No heavy effect here; the drama is reserved for route/chapter changes.
- **Lore modal**: `scale`+`fade`. **Ambient**: faint always-on `.embers` drift.
- All motion is gated by `prefers-reduced-motion` (the veil is `display:none`, transitions return `duration:0`).
- `components/ProseReader.svelte` — paragraphs with clickable lore terms. Links read as **plain prose and only glow on hover/focus** (a deliberate discovery mechanic); `.lore-link` styling lives here.
- `components/LoreModal.svelte` — the entry modal (framed painted header + chip + tagline + unlocked reveals + sealed note). Controlled via `entry`/`onclose`; reads `furthestChapter` to gate reveals.
- `components/LoreImage.svelte` — entry image, or an **impasto** painted placeholder (`.impasto` class) tinted per category via `paintVars()` when `image` is null.
- `src/lib/ui.js` — per-category oil palette: `categoryStyle` (chip + glyph), `paintVars` (the `--c1/--c2/--c3` for `.impasto`), `initials()`.

### Look & feel — Impasto Expressionism
The aesthetic is a **dark painterly gallery** (the author will create impasto/expressionist portraits + landscapes for the real `image`s). Implemented in `app.css`: `body` is deep umber (`#14100c`), the `.gallery` wrapper adds a warm vignette + fixed canvas-grain overlay; `.impasto` fakes palette-knife paint (layered gradients + raised-paint inset shadows + knife-stroke striations + grain); `.frame` is a gilded gallery frame. Font is **Montserrat** (loaded in `app.html`). Accent is gilt/amber; category oils: Character=cadmium red, Faction=ochre, Place=viridian, Concept=ultramarine (`ui.js`).

### Conventions
- Svelte 5 runes (`$props`, `$state`, `$derived`, `$effect`) and `onclick={...}` handlers throughout — match this.
- Real artwork goes in `static/lore/<id>.png` (Gemini outputs PNG), referenced from the entry's `image` field; until then the `.impasto` placeholder renders automatically. Real paintings will replace the placeholders with no other code change.

## `info/` directory
`info/Vankh/` is the full worldbuilding + manuscript corpus (characters, places, drafts V1–V3, final draft, published chapters). Only `_Published/*.md` is wired into the app (as chapters); the character/place notes are the canonical source the `lore.js` bodies are written from. The rest is raw material for future chapters and entries.

`info/Vankh/_Portraits/` holds the **image-generation prompts** for the codex art (impasto/expressionist style). Each keeps a shared verbatim STYLE BLOCK so the gallery reads as one painter's hand. Workflow: generate square 1:1 → save the PNG to `static/lore/<id>.png` → set `image` on the matching `lore.js` entry. The `.impasto` placeholder is replaced with no other code change.
