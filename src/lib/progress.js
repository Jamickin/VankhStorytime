// Reading progress — the only persisted state in the app. In a branching story
// "how far" is no longer a single number but a PATH: the chapters the reader has
// actually reached. `journey` is that path in visit order; `visited` is the set
// form used to unlock codex reveals and to reveal chapters on the home page.
// This is reader experience, not content.

import {
	writable,
	derived,
	get,
} from "svelte/store";
import { browser } from "$app/environment";
import { chapters } from "./content/chapters.js";

const KEY = "vankh:progress:v2";
const LEGACY_KEY = "vankh:progress:v1"; // old furthest-index model

function load() {
	if (!browser) return [];
	// New model: ordered list of visited chapter slugs.
	const raw = localStorage.getItem(KEY);
	if (raw) {
		try {
			const arr = JSON.parse(raw);
			if (Array.isArray(arr))
				return arr.filter(
					(s) => typeof s === "string"
				);
		} catch {
			/* fall through to migration */
		}
	}
	// Migrate the old single index: seed the journey with the canon spine up to
	// and including the furthest chapter the reader had reached.
	const legacy =
		localStorage.getItem(LEGACY_KEY);
	if (legacy != null) {
		const n = parseInt(legacy, 10);
		if (Number.isFinite(n) && n >= 0)
			return chapters
				.slice(0, n + 1)
				.map((c) => c.slug);
	}
	return [];
}

// Ordered, de-duplicated list of chapter slugs the reader has reached.
export const journey = writable(load());

// Set form for quick membership tests (codex gating, home-page reveal).
export const visited = derived(
	journey,
	($j) => new Set($j)
);

if (browser) {
	journey.subscribe((j) =>
		localStorage.setItem(
			KEY,
			JSON.stringify(j)
		)
	);
}

// Call when a chapter is opened; only ever extends the journey.
export function visit(slug) {
	if (!slug) return;
	journey.update((j) =>
		j.includes(slug) ? j : [...j, slug]
	);
}

// ─── Page position persistence ────────────────────────────────────────────────

const PAGE_KEY = "vankh:pages:v1";

function loadPageMap() {
	if (!browser) return new Map();
	try {
		const raw = localStorage.getItem(PAGE_KEY);
		if (raw) return new Map(JSON.parse(raw));
	} catch { /* ignore */ }
	return new Map();
}

export const pageProgress = writable(loadPageMap());

if (browser) {
	pageProgress.subscribe(m =>
		localStorage.setItem(PAGE_KEY, JSON.stringify([...m]))
	);
}

export function savePageNum(slug, n) {
	pageProgress.update(m => { const copy = new Map(m); copy.set(slug, n); return copy; });
}

export function getSavedPageNum(slug) {
	let v = 0;
	const unsub = pageProgress.subscribe(m => { v = m.get(slug) ?? 0; });
	unsub();
	return v;
}

// ─── Chapter completion tracking ──────────────────────────────────────────────

const COMPLETED_KEY = "vankh:completed:v1";

function loadCompleted() {
	if (!browser) return new Set();
	try {
		const raw = localStorage.getItem(COMPLETED_KEY);
		if (raw) return new Set(JSON.parse(raw));
	} catch { /* ignore */ }
	return new Set();
}

export const completed = writable(loadCompleted());

if (browser) {
	completed.subscribe(s =>
		localStorage.setItem(COMPLETED_KEY, JSON.stringify([...s]))
	);
}

export function complete(slug) {
	if (!slug) return;
	completed.update(s => { const copy = new Set(s); copy.add(slug); return copy; });
}

// ─── Extended lore discovery tracking ────────────────────────────────────────

const LORE_KEY = "vankh:lore:v2";
const LORE_LEGACY_KEY = "vankh:lore:v1";

// Each record: { id: string, firstChapter: string|null, lastChapter: string|null }
function loadLoreRecords() {
	if (!browser) return [];
	try {
		// Try new format
		const raw = localStorage.getItem(LORE_KEY);
		if (raw) {
			const arr = JSON.parse(raw);
			if (Array.isArray(arr) && arr[0]?.id) return arr;
		}
		// Migrate from v1 (plain string array)
		const legacy = localStorage.getItem(LORE_LEGACY_KEY);
		if (legacy) {
			const ids = JSON.parse(legacy);
			if (Array.isArray(ids)) return ids.map(id => ({ id, firstChapter: null, lastChapter: null }));
		}
	} catch { /* ignore */ }
	return [];
}

export const loreRecords = writable(loadLoreRecords());

// Derived: just the IDs in order (for backward compat)
export const openedLore = derived(loreRecords, $r => $r.map(r => r.id));

if (browser) {
	loreRecords.subscribe(records =>
		localStorage.setItem(LORE_KEY, JSON.stringify(records))
	);
}

// currentReadingSlug: updated by the read page so lore clicks know which chapter they're in
export const currentReadingSlug = writable(null);

export function recordLoreOpen(id, chapterSlug = null) {
	if (!id) return;
	loreRecords.update(records => {
		const existing = records.find(r => r.id === id);
		if (existing) {
			// Update lastChapter if this is a new (later) chapter
			if (chapterSlug && chapterSlug !== existing.lastChapter) {
				existing.lastChapter = chapterSlug;
			}
			return [...records]; // trigger reactivity
		}
		return [...records, { id, firstChapter: chapterSlug, lastChapter: chapterSlug }];
	});
}

export function getLoreRecord(id) {
	let record = null;
	const unsub = loreRecords.subscribe(r => { record = r.find(x => x.id === id) ?? null; });
	unsub();
	return record;
}
