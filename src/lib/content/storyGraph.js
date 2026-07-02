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
	3: "Polarity",
	4: "Causality",
};

// Authored forks. Only chapters that diverge need an entry here.
//   "<slug>": { choices: [ { to, label, canon, hint? }, … ] }
// `label` is the text on the choice card; `hint` is optional sub-text. Targets
// must be real chapter slugs (a .md in _Published). Branch chapters use sub-
// decimal numbering (1.3.1, 1.3.2) so they sort between the fork and Part 2.
const FORKS = {
	// Nexus Station depth — fork at 1.2. Pro has delivered the medicine; three
	// paths open from the station's hidden infrastructure.
	"1-2": {
		choices: [
			{
				to: "1-2-1",
				label: "The maintenance corridors. Something about this station's skeleton doesn't match its skin.",
				canon: true,
				hint: "Beneath three factional architectures, one original engineer's hand.",
			},
			{
				to: "1-2-2",
				label: "Stay with the Mechanic. She has more to say about the proximity incident reports.",
				canon: false,
				hint: "Fourteen workers who saw something they weren't supposed to. Every account the same.",
			},
			{
				to: "1-2-3",
				label: "Use the Mechanic's data chip. Three of the incident reports are accessible at your clearance.",
				canon: false,
				hint: "Eleven Vankh-Setts of identical testimony. They couldn't describe it — but they all felt seen.",
			},
		],
	},
	"1-2-1": {
		choices: [{ to: "1-3", label: null, canon: true }],
	},
	// 1-2-2 → linearNext = "1-3" ✓
	// 1-2-3 → linearNext = "1-3" ✓

	// End of Part 1 — first RPG fork. Pro has seen through the illusion; the Eye
	// has noticed him. Two paths open from that moment of recognition.
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
	// Nexus Station cargo and contacts — four-way fork at 2.1.
	"2-1": {
		choices: [
			{
				to: "2-1-1",
				label: "The cargo hold atmosphere system. The seal on one crate is damaged — and the contents are wrong.",
				canon: true,
				hint: "Pre-Consolidation archive chips from Helix. The kind the Church has been destroying.",
			},
			{
				to: "2-1-2",
				label: "The captain has a job. A retired Cicillian engineer who has been listening to the secondary harmonic for twenty Vankh-Setts.",
				canon: false,
				hint: "He stopped looking because he got old. He gave his archive to the next person who wasn't.",
			},
			{
				to: "2-1-3",
				label: "Gress found you. She processes resource allocation data that shows the same precision as your drive readings.",
				canon: false,
				hint: "Different instrument. Same impossible precision. She noticed you close the display.",
			},
			{
				to: "2-1-4",
				label: "The Mechanic mentioned three sub-levels below the maintenance corridors. Same construction signature all the way down.",
				canon: false,
				hint: "She said she preferred you to have the context before you went looking.",
			},
		],
	},
	"2-1-1": {
		choices: [{ to: "2-2", label: null, canon: true }],
	},
	"2-1-2": {
		choices: [{ to: "2-2", label: null, canon: true }],
	},
	// 2-1-3 → linearNext = "2-2" ✓
	// 2-1-4 → linearNext = "2-2" ✓

	// End of Part 2 — second fork. The harmonic has answered; two paths open from
	// that first moment of deliberate contact.
	"2-2": {
		choices: [
			{
				to: "2-2-1",
				label: "Push the scanner past its limits. Listen for what answers.",
				canon: true,
				hint: "The secondary harmonic has been patient. It will be patient a little longer.",
			},
			{
				to: "2-2-2",
				label: "Find the Prophet's original testimony. Compare what he saw with what you measured.",
				canon: false,
				hint: "A maintenance override. The confiscated stacks. One hour.",
			},
		],
	},
	// Both branches converge at Part 3.
	"2-2-1": {
		choices: [{ to: "3-1", label: null, canon: true }],
	},
	"2-2-2": {
		choices: [{ to: "3-1", label: null, canon: true }],
	},
	// Helix Habitat depth — fork at 3.1. Pro has visited his parents; three paths
	// open from what he finds in the habitat's hidden infrastructure.
	"3-1": {
		choices: [
			{
				to: "3-1-1",
				label: "Go with Father to the maintenance level. There's an extraction in progress.",
				canon: true,
				hint: "A former Cicillian data specialist who kept the same records for twenty years. They never changed.",
			},
			{
				to: "3-1-2",
				label: "A mandatory gathering has been called. You can't leave without drawing enforcement attention.",
				canon: false,
				hint: "The Church's Rhythm Communion. You'll understand what you're fighting from the inside of it.",
			},
			{
				to: "3-1-3",
				label: "Stay with Mother. Father said she'll have a clear window.",
				canon: false,
				hint: "The temporal stabilizers give her back to herself for a while. She has something to tell you that instruments can't measure.",
			},
		],
	},
	"3-1-1": {
		choices: [{ to: "3-2", label: null, canon: true }],
	},
	// 3-1-2 → linearNext = "3-2" ✓
	// 3-1-3 → linearNext = "3-2" ✓ (reconnects to canon at 3-2)

	// Crystal archive deep dive — fork at 3.2. The demographic impossibilities are
	// visible; a deeper layer of the archive waits.
	"3-2": {
		choices: [
			{
				to: "3-3",
				label: null,
				canon: true,
			},
			{
				to: "3-2-1",
				label: "Dig into the oldest records. Before the factions. Before the official history.",
				canon: false,
				hint: "Pre-corporate. Pre-Church. A record of the ones-who-were-placed. Including you.",
			},
		],
	},
	// 3-2-1 → linearNext = "3-3" ✓

	// End of Part 3 — third fork. Pro has seen the Vankh'Ari at Relay Station One;
	// two paths open from that moment of suppressed contact.
	"3-3": {
		choices: [
			{
				to: "3-3-1",
				label: "Say nothing. File no report. Whatever you just saw, you can't afford to have seen it.",
				canon: true,
				hint: "The biometric telemetry already logged it. But the transmission — that is yours alone.",
			},
			{
				to: "3-3-2",
				label: "Your diagnostic equipment is running. The data will survive even if you don't report it.",
				canon: false,
				hint: "The resonance readings are fragmentary. They will be enough.",
			},
		],
	},
	// Both 3.3 branches route through 3.4 (The Extraction) before Part 4.
	"3-3-1": {
		choices: [{ to: "3-4", label: null, canon: true }],
	},
	"3-3-2": {
		choices: [{ to: "3-4", label: null, canon: true }],
	},
	// Extraction fork at 3.4 — Pro has tried to coordinate his parents' exit; two
	// paths open from that moment of near-exposure.
	"3-4": {
		choices: [
			{
				to: "4-1",
				label: null,
				canon: true,
			},
			{
				to: "3-4-1",
				label: "Contact the captain directly. His network doesn't exist in Lin's oversight queue.",
				canon: false,
				hint: "Independent relay. No corporate manifest. No Lin between you and your parents.",
			},
		],
	},
	// 3-4-1 → linearNext = "4-1" ✓

	// End of Part 4 — fourth fork. Pro has discovered Lin's trajectory; two pulses
	// remain before impact with the third Vankh sphere. Four paths from this moment.
	"4-1": {
		choices: [
			{
				to: "4-2",
				label: "Hold the third breathing pattern. You are the witness this moment required.",
				canon: true,
				hint: "The secondary harmonic is fully present. It has been waiting for exactly this.",
			},
			{
				to: "4-1-1",
				label: "Go aft. The eight passengers don't know what they're part of. Tell them.",
				canon: false,
				hint: "They heard the secondary harmonic too. Through the silence where their augmentations used to be.",
			},
			{
				to: "4-1-2",
				label: "Transmit everything. Before the impact. Someone outside this vessel needs to know.",
				canon: false,
				hint: "Your mother. The Mechanic. The independent network. The record can survive even if you don't.",
			},
			{
				to: "4-1-3",
				label: "Override the navigation. There has to be a way to divert this vessel.",
				canon: false,
				hint: "You have maintenance credentials. The override panel is right there. You have to try.",
			},
		],
	},
	// All four paths converge at the threshold.
	"4-1-1": {
		choices: [{ to: "4-2", label: null, canon: true }],
	},
	"4-1-2": {
		choices: [{ to: "4-2", label: null, canon: true }],
	},
	"4-1-3": {
		choices: [{ to: "4-2", label: null, canon: true }],
	},
	// 4-2 is the ending — no choices, isEnding() returns true.
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
