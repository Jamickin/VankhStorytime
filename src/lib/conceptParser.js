// Concept-substitution engine. Theme-agnostic and pure: it knows nothing about
// storage, stories, or themes — it operates on a string plus a concept list.
//
// A concept is: { id, term, aliases?: string[] }
//   - `term` is the canonical surface form shown in the "Original" theme.
//   - `aliases` are extra surface forms that should also be matched (e.g.
//     "FTL" matching "faster-than-light").
//
// A `mappings` object maps concept id -> replacement string. A missing id means
// "leave this concept as the text that was actually matched".

function escapeRegExp(value) {
	return value.replace(
		/[.*+?^${}()|[\]\\]/g,
		"\\$&"
	);
}

// All surface forms for a concept, longest first so the regex prefers the most
// specific alias at a given position.
function surfaceForms(concept) {
	return [
		concept.term,
		...(concept.aliases || []),
	]
		.map((form) => form.trim())
		.filter(Boolean)
		.sort(
			(a, b) => b.length - a.length
		);
}

// Find every occurrence of every concept's surface forms in `text`.
// Returns non-overlapping matches sorted by position (longest-match-wins),
// each tagged with the concept id that produced it.
export function findConcepts(
	text,
	concepts
) {
	const found = [];

	for (const concept of concepts ||
		[]) {
		const forms =
			surfaceForms(concept);
		if (forms.length === 0) continue;

		const pattern = forms
			.map(escapeRegExp)
			.join("|");
		const regex = new RegExp(
			`\\b(?:${pattern})\\b`,
			"gi"
		);

		let match;
		while (
			(match = regex.exec(text)) !==
			null
		) {
			found.push({
				conceptId: concept.id,
				originalText: match[0],
				start: match.index,
				end:
					match.index +
					match[0].length,
			});
		}
	}

	// Sort by start, then longest first, so the most specific match wins.
	found.sort(
		(a, b) =>
			a.start - b.start ||
			b.end -
				b.start -
				(a.end - a.start)
	);

	// Drop overlaps — two concepts must never cover the same span, otherwise
	// rendering/replacement would double-process it.
	const deduped = [];
	let lastEnd = -1;
	for (const m of found) {
		if (m.start >= lastEnd) {
			deduped.push(m);
			lastEnd = m.end;
		}
	}

	return deduped;
}

// Split `text` into ordered render segments. Plain text gets `conceptId: null`;
// matched concepts carry their id plus the display value for the active theme.
export function buildSegments(
	text,
	concepts,
	mappings = {}
) {
	const found = findConcepts(
		text,
		concepts
	);
	const segments = [];
	let cursor = 0;

	for (const m of found) {
		if (m.start > cursor) {
			segments.push({
				text: text.slice(
					cursor,
					m.start
				),
				conceptId: null,
			});
		}

		segments.push({
			text:
				mappings[m.conceptId] ??
				m.originalText,
			conceptId: m.conceptId,
		});

		cursor = m.end;
	}

	if (cursor < text.length) {
		segments.push({
			text: text.slice(cursor),
			conceptId: null,
		});
	}

	return segments;
}

// Flatten the segments back into a plain string — used for export/copy.
export function renderText(
	text,
	concepts,
	mappings = {}
) {
	return buildSegments(
		text,
		concepts,
		mappings
	)
		.map((s) => s.text)
		.join("");
}

// Count how many times each concept appears in `text`. Returns a Map of
// conceptId -> count, handy for the concept management UI.
export function conceptCounts(
	text,
	concepts
) {
	const counts = new Map();
	for (const m of findConcepts(
		text,
		concepts
	)) {
		counts.set(
			m.conceptId,
			(counts.get(m.conceptId) || 0) +
				1
		);
	}
	return counts;
}
