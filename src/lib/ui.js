// Per-category styling for codex entries, tuned to an expressionist oil palette.
// `colors` feed the impasto placeholder (--c1/--c2/--c3); `chip` styles the
// category label; `glyph` tints the placeholder initials.

const STYLES = {
	Character: {
		// cadmium red / burnt sienna / ochre — portrait warmth
		colors: ["#c0392b", "#5b1e16", "#d99f56"],
		chip: "bg-red-500/15 text-red-200 ring-red-400/30",
		glyph: "text-amber-50",
	},
	Faction: {
		// ochre / umber / gold
		colors: ["#c98a1e", "#4a3212", "#e9c46a"],
		chip: "bg-amber-500/15 text-amber-200 ring-amber-400/30",
		glyph: "text-amber-50",
	},
	Place: {
		// viridian / deep olive / sap green
		colors: ["#1f7a6b", "#143d2e", "#7fae6a"],
		chip: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
		glyph: "text-emerald-50",
	},
	Concept: {
		// ultramarine / indigo / violet
		colors: ["#3b3fb6", "#1e1b4b", "#7c5cc4"],
		chip: "bg-indigo-500/15 text-indigo-200 ring-indigo-400/30",
		glyph: "text-indigo-50",
	},
};

const FALLBACK = STYLES.Concept;

export function categoryStyle(category) {
	return STYLES[category] || FALLBACK;
}

// `--c1/--c2/--c3` custom properties for the .impasto placeholder.
export function paintVars(category) {
	const [c1, c2, c3] =
		categoryStyle(category).colors;
	return `--c1:${c1};--c2:${c2};--c3:${c3};`;
}

// Initials for the placeholder (e.g. "Nexus Station" -> "NS").
export function initials(term) {
	return term
		.split(/\s+/)
		.slice(0, 2)
		.map((w) => w[0])
		.join("")
		.toUpperCase();
}
