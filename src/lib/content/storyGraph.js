// The branching layer over the linear chapters. Prose lives in the .md files
// (chapters.js); lore lives in lore.js; the SHAPE of the story — which chapter
// leads where, and where the reader is offered a choice — lives here.
//
// Canon is preserved by default: any chapter without an explicit fork simply
// continues to the next chapter in order via a single { canon: true } edge, so
// the original 1.1 → … spine is always walkable. A chapter only branches when it
// is given a `choices` array of 2+ edges, and `canon: true` always marks the
// original path on a fork — so the author's spine can never be lost, only added to.

import {
	chapters,
	getChapter,
	chapterIndex,
} from "./chapters.js";

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
// must be real chapter slugs (a .md in _Published). Phase 2 fills this in from
// the alternate drafts in info/Vankh/{V1,V2,V3,Original}.
const FORKS = {
	// Example shape (left here as the template for the first real fork):
	// "2-2": { choices: [
	// 	{ to: "3-1",     label: "Report to Supervisor Lin as ordered", canon: true },
	// 	{ to: "3-1-run", label: "Take the captain's offer and disappear", canon: false,
	// 	  hint: "Leave corporate space behind for good." },
	// ] },
};

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
