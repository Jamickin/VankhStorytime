// The branching layer over the linear chapters. Prose lives in the .md files
// (chapters.js); lore lives in lore.js; the SHAPE of the story — which chapter
// leads where, and where the reader is offered a choice — lives here.
//
// Canon is preserved by default: any chapter without an explicit fork simply
// continues to the next chapter in order via a single { canon: true } edge, so
// the original 1.1 → … spine is always walkable. A chapter only branches when it
// is given a `choices` array of 2+ edges, and `canon: true` always marks the
// original path on a fork — so the author's spine can never be lost, only added to.

/**
 * @typedef {{ to: string, label: string|null, canon?: boolean, hint?: string }} Choice
 * @typedef {{ choices: Choice[] }} Fork
 */

import {
	chapters,
	getChapter,
	chapterIndex,
} from "./chapters.js";
import { findConcepts } from '../conceptParser.js';
import { lore, loreById } from './lore.js';

export const START =
	chapters[0]?.slug ?? "1-1";

// The Hermetic principle each Part is built on (its epigraph + its name).
const PART_LABELS = {
	1: "Rhythm",
	2: "Correspondence",
};

// Authored forks. Only chapters that diverge need an entry here.
//   "<slug>": { choices: [ { to, label, canon, hint? }, … ] }
// `label` is the text on the choice card; `hint` is optional sub-text. Targets
// must be real chapter slugs (a .md in _Published). Branch chapters use sub-
// decimal numbering (1.3.1, 1.3.2) so they sort between the fork and Part 2.
const FORKS = {
	// End of Part 1 — first RPG fork. Pro has seen through the illusion; the Eye
	// has noticed him. Three paths open from that moment of recognition.
	"1-3": {
		choices: [
			{
				to: "1-3-1",
				label: "Read the crystal. Before anything else.",
				canon: true,
				hint: "Some knowledge won't keep.",
			},
			{
				to: "1-3-2",
				label: "The Prophet saw something real. Find his people.",
				canon: false,
				hint: "Orange corridors. Dangerous territory for a technician.",
			},
		],
	},
	// Branch chapters converge back to the canon spine at 2-1.
	"1-3-1": {
		choices: [{ to: "2-1", label: null, canon: true }],
	},
	"1-3-2": {
		choices: [{ to: "2-1", label: null, canon: true }],
	},
};

// In development, warn about any FORKS target that isn't a real chapter.
if (import.meta.env.DEV) {
	for (const [from, fork] of Object.entries(FORKS)) {
		for (const ch of fork.choices ?? []) {
			if (!chapters.find(c => c.slug === ch.to)) {
				console.warn(`[storyGraph] FORKS["${from}"] → "${ch.to}" is not a published chapter slug.`);
			}
		}
	}
}

// Next chapter in canonical (slug) order, or null at the very end.
function linearNext(slug) {
	const i = chapterIndex(slug);
	return i >= 0 && i < chapters.length - 1
		? chapters[i + 1].slug
		: null;
}

// Which Part a chapter belongs to (1, 2, …), parsed from "2.1" → 2.
export function partOf(slug) {
	const c = getChapter(slug);
	return c
		? parseInt(c.number, 10) || null
		: null;
}

export function partLabel(part) {
	return PART_LABELS[part] ?? null;
}

// The choices offered at the end of a chapter: one canonical "continue" by
// default, 2+ when the chapter is an authored fork, empty at a true ending.
// A default edge carries `label: null` so the reader can render the next
// chapter's title; an authored edge carries its own label.
export function choicesFor(slug) {
	const fork = FORKS[slug];
	if (fork?.choices?.length)
		return fork.choices;
	const to = linearNext(slug);
	return to
		? [{ to, label: null, canon: true }]
		: [];
}

// The single canonical continuation (the original story's next step), or null.
export function canonNext(slug) {
	const choices = choicesFor(slug);
	return (
		(
			choices.find((c) => c.canon) ??
			choices[0]
		)?.to ?? null
	);
}

export function isBranchPoint(slug) {
	return choicesFor(slug).length > 1;
}

// True when the canonical next chapter belongs to a different Part (or there is
// none) — drives the "End of Part N: <Label>" hand-off.
export function isPartEnd(slug) {
	const to = canonNext(slug);
	return (
		!to || partOf(to) !== partOf(slug)
	);
}

// True at a leaf of the tree — nowhere canonical left to go.
export function isEnding(slug) {
	return choicesFor(slug).length === 0;
}

// ── Lore per chapter (precomputed at module load, used by StoryTimeline) ──
const CAT_ORDER = { Character: 0, Place: 1, Faction: 2, Concept: 3 };

export const lorePerChapter = new Map();
for (const ch of chapters) {
	const text = ch.paragraphs.join(' ');
	const seen = new Set();
	const entries = [];
	for (const m of findConcepts(text, lore)) {
		if (!seen.has(m.conceptId)) {
			seen.add(m.conceptId);
			const e = loreById.get(m.conceptId);
			if (e) entries.push(e);
		}
	}
	entries.sort((a, b) => (CAT_ORDER[a.category] ?? 4) - (CAT_ORDER[b.category] ?? 4));
	lorePerChapter.set(ch.slug, entries.slice(0, 3));
}

// Entries whose FIRST REVEAL is at this chapter — what this chapter introduces.
// Satellite thumbnails use this so each chapter shows unique characters/concepts.
export const introPerChapter = new Map();
for (const ch of chapters) {
	const entries = lore.filter(e => e.reveals[0]?.at === ch.slug);
	entries.sort((a, b) => (CAT_ORDER[a.category] ?? 4) - (CAT_ORDER[b.category] ?? 4));
	introPerChapter.set(
		ch.slug,
		entries.length > 0 ? entries.slice(0, 3) : (lorePerChapter.get(ch.slug) ?? []).slice(0, 2)
	);
}
