// The story itself. Chapters are authored in info/Vankh/_Published/*.md and
// pulled in at build time, cleaned of Obsidian markup, and exposed as ordered
// chapters of plain paragraphs for the reader.

const files = import.meta.glob(
	"/info/Vankh/_Published/*.md",
	{
		query: "?raw",
		import: "default",
		eager: true,
	}
);

function clean(raw) {
	let text = raw
		// [[Link|Alias]] -> Alias, [[Link]] -> Link
		.replace(
			/\[\[([^\]|]+)\|([^\]]+)\]\]/g,
			"$2"
		)
		.replace(
			/\[\[([^\]]+)\]\]/g,
			"$1"
		);

	const lines = text
		.split("\n")
		.filter((line) => {
			const t = line.trim();
			if (/^#\s/.test(t)) return false; // headings
			if (/^#[a-z]/i.test(t))
				return false; // #tags
			if (/^-{3,}$/.test(t))
				return false; // rules
			if (
				/^_?\[?\s*(to be continued|end of part)/i.test(
					t
				)
			)
				return false; // footer
			return true;
		});

	return lines
		.join("\n")
		.replace(/\*\*(.+?)\*\*/g, "$1")
		.replace(
			/(^|\W)_(.+?)_(\W|$)/g,
			"$1$2$3"
		)
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

function meta(path, raw) {
	const heading = raw.match(
		/^#\s+(.+)$/m
	);
	const fullTitle = heading
		? heading[1].trim()
		: path;
	// "Chapter 1.1: The Departure" -> number "1.1", title "The Departure"
	const m = fullTitle.match(
		/^Chapter\s+([\d.]+)\s*:?\s*(.*)$/i
	);
	const number = m ? m[1] : "";
	const title = m
		? m[2].trim()
		: fullTitle;
	const slug = number
		? number.replace(/\./g, "-")
		: path
				.split("/")
				.pop()
				.replace(/\.md$/, "");
	return {
		slug,
		number,
		title,
		fullTitle,
	};
}

export const chapters = Object.entries(
	files
)
	.map(([path, raw]) => {
		const { slug, number, title } =
			meta(path, raw);
		const body = clean(raw);
		return {
			slug,
			number,
			title,
			paragraphs: body
				.split(/\n{2,}/)
				.map((p) => p.trim())
				.filter(Boolean),
		};
	})
	.sort((a, b) =>
		a.slug.localeCompare(b.slug, "en", {
			numeric: true,
		})
	);

export function getChapter(slug) {
	return chapters.find(
		(c) => c.slug === slug
	);
}

export function chapterIndex(slug) {
	return chapters.findIndex(
		(c) => c.slug === slug
	);
}

// Split a chapter's paragraphs into roughly even pages without ever breaking a
// paragraph. `budget` is the soft character target per page.
export function paginate(
	paragraphs,
	budget = 1500
) {
	const pages = [];
	let current = [];
	let count = 0;

	for (const p of paragraphs) {
		if (
			current.length &&
			count + p.length > budget
		) {
			pages.push(current);
			current = [];
			count = 0;
		}
		current.push(p);
		count += p.length;
	}
	if (current.length)
		pages.push(current);

	return pages.length ? pages : [[]];
}
