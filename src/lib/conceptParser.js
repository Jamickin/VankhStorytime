// Key concepts that can be transformed between themes
const KEY_CONCEPTS = [
	"shuttle",
	"spaceship",
	"FTL",
	"neural implants",
	"enhancements",
	"drive coupling",
	"diagnostic tools",
	"biometric scanners",
	"holographic displays",
	"chrome implants",
	"Vankh spheres",
	"corporate scanner",
	"Cicillian Industries",
	"Church of Purity",
	"corporate space",
	"Purist territory",
	"Nexus Station",
	"Drive Coupling Specialist",
	"technician",
	"corporate citizen",
	"Purist adherent",
	"The Prophet",
	"Vankh pulse",
	"breathing techniques",
	"Dilation Hysteria",
	"augmentation",
	"corporate badge",
	"temporal stabilizers",
	"anti-aircraft batteries",
	"maintenance tunnels",
	"FTL transition",
	"reality distortion",
];

export function findConcepts(
	storyText
) {
	const found = [];

	KEY_CONCEPTS.forEach(
		(concept) => {
			// Escape special regex characters and create word boundary regex
			const escapedConcept =
				concept.replace(
					/[.*+?^${}()|[\]\\]/g,
					"\\$&"
				);
			const regex =
				new RegExp(
					`\\b${escapedConcept}\\b`,
					"gi"
				);
			let match;

			while (
				(match =
					regex.exec(
						storyText
					)) !== null
			) {
				found.push({
					concept:
						concept.toLowerCase(),
					originalText:
						match[0], // preserves original case
					start: match.index,
					end:
						match.index +
						match[0]
							.length,
					id: `${concept.toLowerCase()}-${
						match.index
					}`, // unique ID for each instance
				});
			}
		}
	);

	return found.sort(
		(a, b) =>
			a.start - b.start
	);
}

export function createConceptMappings(
	foundConcepts
) {
	// Create a mapping object for theme transformations
	const mappings = {};

	foundConcepts.forEach(
		(item) => {
			if (
				!mappings[
					item.concept
				]
			) {
				mappings[
					item.concept
				] = item.concept; // default to original
			}
		}
	);

	return mappings;
}

export function applyConceptMappings(
	storyText,
	mappings,
	foundConcepts
) {
	// Apply mappings to transform the story
	let transformedText =
		storyText;

	// Sort concepts by position (reverse order to maintain correct indices)
	const sortedConcepts = [
		...foundConcepts,
	].sort(
		(a, b) =>
			b.start - a.start
	);

	sortedConcepts.forEach(
		(concept) => {
			const replacement =
				mappings[
					concept.concept
				] ||
				concept.originalText;
			transformedText =
				transformedText.slice(
					0,
					concept.start
				) +
				replacement +
				transformedText.slice(
					concept.end
				);
		}
	);

	return transformedText;
}
