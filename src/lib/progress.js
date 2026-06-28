// Reading progress — the only persisted state in the app. In a branching story
// "how far" is no longer a single number but a PATH: the chapters the reader has
// actually reached. `journey` is that path in visit order; `visited` is the set
// form used to unlock codex reveals and to reveal chapters on the home page.
// This is reader experience, not content.

import {
	writable,
	derived,
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
