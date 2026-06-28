// Reading progress — the only persisted state in the app. Tracks the furthest
// chapter index the reader has reached (0-based), so the codex can gate spoilers
// to how far they've actually read. This is reader experience, not content.

import { writable } from "svelte/store";
import { browser } from "$app/environment";

const KEY = "vankh:progress:v1";

function load() {
	if (!browser) return -1;
	const raw = localStorage.getItem(KEY);
	const n = raw == null ? -1 : parseInt(raw, 10);
	return Number.isFinite(n) ? n : -1;
}

// -1 = hasn't started reading.
export const furthestChapter =
	writable(load());

if (browser) {
	furthestChapter.subscribe((v) => {
		localStorage.setItem(
			KEY,
			String(v)
		);
	});
}

// Call when a chapter is opened; only ever advances.
export function reachChapter(index) {
	if (index < 0) return;
	furthestChapter.update((f) =>
		Math.max(f, index)
	);
}
