// The VANKH codex. Each entry annotates a term in the prose.
//
//   term + aliases : surface forms matched in the text (word-boundary, case-
//                    insensitive). Avoid aliases that collide with common words
//                    (a bare "Pulse" would match the verb "pulsed").
//   category       : Character | Faction | Place | Concept
//   tagline        : ALWAYS shown — must be spoiler-free.
//   image          : optional path under static/lore/ (null -> painted placeholder)
//   reveals        : ordered knowledge tiers. `at` is the chapter slug at which a
//                    tier becomes known; the reader only sees tiers they've read
//                    far enough to unlock. Deeper truths stay sealed until earned.
//
// Bodies are seeded from info/Vankh/ and the published chapters — your canon.

export const lore = [
	{
		id: "pro",
		term: "Pro",
		aliases: [
			"P-R-O-4-7-9",
			"P-R-0-4-7-9",
		],
		category: "Character",
		image: "/lore/pro.png",
		tagline: "Drive Coupling Specialist",
		reveals: [
			{
				at: "1-1",
				text: "A dead-average Proto-Human with no special abilities, designation P-R-O-4-7-9, assigned by the Academy to the narrow discipline of drive coupling. He is divided against himself — sympathetic to the Purists, who hold that altering one's biology is heresy, yet bound to Cicillian, because he hates what the Purists have done to his homeworld. His deep love for his parents drives nearly everything he does.",
			},
			{
				at: "1-2",
				text: "Aboard an independent shuttle he steadies a panicking passenger through the edge of Dilation Hysteria — and begins to sense a secondary harmonic, an echo in the drive and in the void, that should not exist.",
			},
			{
				at: "1-3",
				text: "His scans reveal impossible mathematical precision beneath the Pulse. He starts to grasp that their reality may be authored — that his mother's \"delusions\" were truth — and that something behind the Vankh's Eye has noticed him in return. He has become the story's Cosmic Witness.",
			},
		],
	},
	{
		id: "gress",
		term: "Gress",
		aliases: [
			"G-R-E-S-S-6-3-1",
			"Stationary Specialist Gress",
		],
		category: "Character",
		image: "/lore/gress.png",
		tagline: "Stationary Specialist",
		reveals: [
			{
				at: "1-2",
				text: "A Cicillian executive, designation G-R-E-S-S-6-3-1, unused to anything less than luxury transport. On her first raw crossing she nearly succumbs to Dilation Hysteria, and is pulled back only by the rhythm Pro taps out against the deck plates.",
			},
		],
	},
	{
		id: "the-prophet",
		term: "The Prophet",
		aliases: ["Prophet"],
		category: "Character",
		image: null,
		tagline:
			"Leader of the Church of Purity",
		reveals: [
			{
				at: "1-1",
				text: "Spoken of long before he is seen. His followers attack augmented travellers and down the shuttles that carry them; to the Church, all enhancement is heresy.",
			},
			{
				at: "1-3",
				text: "Once a maintenance worker, he was remade by a revelation during an FTL transit malfunction — a Dilation Hysteria that granted him partial perception of reality's true nature. He claims the Vankh pulse is a divine rhythm corrupted by technology, and he is partially correct. As leader of the Church he implements the \"Final Purification\": the forced removal of implants, without anesthesia.",
			},
		],
	},
	{
		id: "purists",
		term: "Purist adherent",
		aliases: [
			"Purist adherents",
			"Purists",
			"Purist",
		],
		category: "Faction",
		image: null,
		tagline:
			"Those who would unmake technology",
		reveals: [
			{
				at: "1-1",
				text: "A conservative faction that would rid the universe of technology, led by The Prophet. They bear the marks and scars of augmentations removed — willingly or by force — and stand in direct opposition to Cicillian.",
			},
			{
				at: "1-3",
				text: "Their purpose is brittle: they ban technology yet still rely on it, and so hold little expertise of their own. Pro begins to wonder whether their rejection is an unconscious rebellion against whatever is using humanity for its own ends.",
			},
		],
	},
	{
		id: "church-of-purity",
		term: "Church of Purity",
		aliases: ["the Church"],
		category: "Faction",
		image: null,
		tagline:
			"The faith that calls enhancement heresy",
		reveals: [
			{
				at: "1-1",
				text: "It declares all technological assistance a \"tainting of the flesh.\" Where it holds power, as in the Helix Habitat, it demands \"spiritual certification\" before the sick may receive treatment — a barrier between people and their medicine.",
			},
			{
				at: "1-3",
				text: "Its \"purification centers\" forcibly strip enhancements away. Pro comes to suspect that the Church and Cicillian, for all their enmity, may serve the same hidden agenda — opposite experiments run on the same subjects.",
			},
		],
	},
	{
		id: "cicillian",
		term: "Cicillian Industries",
		aliases: [
			"Cicillian",
			"Cicillian Corp",
		],
		category: "Faction",
		image: null,
		tagline:
			"The corporation of integration",
		reveals: [
			{
				at: "1-1",
				text: "The corporate power that promotes the seamless integration of technology and flesh — runner of the Academy, the drive fleets, and the hub at Nexus Station. Its creed: \"Those who Travel, Earn. Those who Earn, Survive.\" Its risk algorithms quietly decide careers, sometimes on nothing but hereditary association.",
			},
			{
				at: "1-3",
				text: "Pro comes to suspect its relentless push for enhancement is something colder than progress — a harvest, every implant quietly reporting data to destinations no one names.",
			},
		],
	},
	{
		id: "nexus-station",
		term: "Nexus Station",
		aliases: ["Nexus"],
		category: "Place",
		image: null,
		tagline: "The in-between hub",
		reveals: [
			{
				at: "1-1",
				text: "The neutral hub between Cicillian and Purist space, its concourses colour-marked so a traveller knows where they are safest — orange for the Purists, blue for Cicillian. Pro frequents it between official and off-the-books work, buys his mother's medicine here, and knows it as the home and workplace of The Mechanic.",
			},
		],
	},
	{
		id: "vankh-pulse",
		term: "Vankh pulse",
		aliases: ["the Pulse"],
		category: "Concept",
		image: null,
		tagline:
			"The rhythm the whole culture is built around",
		reveals: [
			{
				at: "1-1",
				text: "The phenomenon of the pitch-black spheres — an enormous sound and a rattling shockwave that travels with its coming. FTL is impossible without it, and Proto-Humans have shaped their bodies, their time, and their culture around its rhythm.",
			},
			{
				at: "1-3",
				text: "Pro's readings suggest the Pulse is not natural at all but engineered precision disguised as nature — a rhythm composed by an intelligence that stays hidden behind the perfect black spheres.",
			},
		],
	},
	{
		id: "vankh-spheres",
		term: "Vankh spheres",
		aliases: ["Vankhs", "Vankh's Eye"],
		category: "Concept",
		image: null,
		tagline:
			"Perfect black orbs in settled space",
		reveals: [
			{
				at: "1-2",
				text: "Perfect black orbs that dot settled space, emitting the pulses that make FTL possible. Drive workers call the void at the centre of a transit aperture the Vankh's Eye, and say staring too long into it reveals other realities — or madness.",
			},
			{
				at: "1-3",
				text: "The Eye begins to seem less an absence than a presence: something that watches, calculates, and answers Pro's scans with a recognition signal — an acknowledgment that he has begun to see.",
			},
		],
	},
	{
		id: "dilation-hysteria",
		term: "Dilation Hysteria",
		aliases: [],
		category: "Concept",
		image: null,
		tagline:
			"When perception comes apart in transit",
		reveals: [
			{
				at: "1-2",
				text: "The breakdown that takes unprepared minds during FTL transition. Past and present blur, the visual cortex floods with temporal echoes, and it ends in the violent Snap-Back, which can leave permanent neural damage.",
			},
			{
				at: "1-3",
				text: "Pro begins to suspect that what is named degradation may be its opposite — failing systems perceiving the patterns that ordinary consciousness is built to ignore.",
			},
		],
	},
	{
		id: "ftl",
		term: "FTL",
		aliases: [
			"faster-than-light",
			"FTL travel",
			"FTL transition",
			"FTL transit",
		],
		category: "Concept",
		image: null,
		tagline:
			"Travel that violates causality",
		reveals: [
			{
				at: "1-1",
				text: "Faster-than-light travel, possible only by riding the Vankh pulse. Passengers synchronise their breathing to survive the crossing; corporate vessels dampen the worst of it, while independent ships run raw.",
			},
			{
				at: "1-3",
				text: "The readings hint the true distances are a fiction — the journeys far more constrained and controlled than any corporate specification admits.",
			},
		],
	},
	{
		id: "drive-coupling",
		term: "drive coupling",
		aliases: [
			"Drive Coupling Specialist",
			"coupling",
		],
		category: "Concept",
		image: null,
		tagline: "Pro's discipline",
		reveals: [
			{
				at: "1-1",
				text: "The drive component Pro is certified to service. A coupling must be calibrated to a precise dissonance, opposing the natural Vankh resonance to carry a vessel across impossible distances.",
			},
			{
				at: "1-3",
				text: "Under close scan the couplings show impossible perfection — golden-ratio harmonics across seventeen bands, Fibonacci thermals — precision no chaotic mechanical system should ever hold.",
			},
		],
	},
	{
		id: "breath-synchronization",
		term: "breathing pattern",
		aliases: [
			"breathing techniques",
			"breathing technique",
			"pulse synchronization",
			"respiratory ritual",
		],
		category: "Concept",
		image: null,
		tagline:
			"Left lung. Right lung. Pause. Reverse.",
		reveals: [
			{
				at: "1-1",
				text: "The breathwork every passenger performs to ease the body into the rhythm that carries it safely through the Pulse. Whispered aloud across a cabin it becomes a quiet chorus — a ritual as fundamental to human existence as speech itself.",
			},
		],
	},
	{
		id: "vankh-sett",
		term: "Vankh-Sett",
		aliases: ["Vankh-Setts", "Vankh Sett"],
		category: "Concept",
		image: null,
		tagline: "A unit of time",
		reveals: [
			{
				at: "1-1",
				text: "A measure of time equal to one full rotation of the Vankhs — the cadence by which Proto-Humans reckon work, wages, and the safe limits of transit.",
			},
		],
	},
	{
		id: "pros-mother",
		term: "Pro's Mother",
		aliases: [],
		category: "Character",
		image: null,
		tagline:
			"Keeper of suppressed histories",
		reveals: [
			{
				at: "1-1",
				text: "She pressed a data crystal into Pro's hands with wild eyes, speaking of \"suppressed histories\" and \"cosmic experiments,\" insisting he needed to understand what was really happening with the Vankh network. In the Helix Habitat, her neural implants are failing.",
			},
			{
				at: "1-3",
				text: "Her \"paranoid delusions\" prove to be insight. The archives don't match, she told him — the records, the timelines, all of it \"too perfect, too controlled, too authored.\" Her failing implants were not degrading; they were letting her perceive the truth. She was right about everything.",
			},
		],
	},
	{
		id: "data-crystal",
		term: "data crystal",
		aliases: ["data crystals"],
		category: "Concept",
		image: null,
		tagline:
			"A purple glow behind reinforced shielding",
		reveals: [
			{
				at: "1-1",
				text: "Given to Pro by his mother, it sits unexamined in his tool bag's secure compartment, its purple glow hidden behind shielding. He took it only to humor her.",
			},
			{
				at: "1-3",
				text: "It begins to feel like a weight of enormous significance — said to hold evidence of the experiment's true scope, classified and suppressed to preserve the illusion of natural history.",
			},
		],
	},
	{
		id: "helix-habitat",
		term: "Helix Habitat",
		aliases: ["Helix"],
		category: "Place",
		image: null,
		tagline:
			"Pro's homeworld, under the Church's grip",
		reveals: [
			{
				at: "1-1",
				text: "Home to Pro's parents. Here the Church of Purity has tightened its hold on medical supplies — banning enhancements and demanding \"spiritual certification\" before the sick can be treated.",
			},
		],
	},
];

export const loreById = new Map(
	lore.map((e) => [e.id, e])
);
