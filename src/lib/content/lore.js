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
		image: "/lore/pro.webp",
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
		image: "/lore/gress.webp",
		tagline: "Stationary Specialist",
		reveals: [
			{
				at: "1-2",
				text: "A Cicillian executive, designation G-R-E-S-S-6-3-1, unused to anything less than luxury transport. On her first raw crossing she nearly succumbs to Dilation Hysteria, and is pulled back only by the rhythm Pro taps out against the deck plates.",
			},
			{
				at: "2-1",
				text: "She disembarks at Nexus Station shaken and out of her depth — a corporate executive adrift in the in-between. Pro steers her toward the concourses where her augmentations are safest, blue for Cicillian and never the orange, and parts from her at the threshold between his world and hers.",
			},
			{
				at: "2-1-3",
				text: "She tracked Pro down through the contractor registry — not helpless, not shaken. She is a Stationary Specialist who processes resource allocation data for a Cicillian administrative division, and she noticed Pro close his diagnostic display in a way that meant he had found something. Her allocation figures show the same anomaly: distribution curves of impossible precision that no actual market produces. She had assumed a modeling error. She has stopped assuming that.",
			},
		],
	},
	{
		id: "lin",
		term: "Lin",
		aliases: [
			"L-I-N-3-8-2",
			"Supervisor Lin",
		],
		category: "Character",
		image: "/lore/lin.webp",
		tagline:
			"Corporate oversight, down to the decimal",
		reveals: [
			{
				at: "2-1",
				text: "A Cicillian administrator threaded with mathematical enhancements — grid-like patterns of precision modification beneath her skin, calculation arrays that brighten at her temples whenever she speaks. Under a new corporate policy she has been set to oversee every independent contractor in the sector, and she takes a close, analytical interest in Pro's non-standard tools and the irregular methods behind them.",
			},
			{
				at: "3-2",
				text: "She conducts what she calls an administrative oversight visit to Pro's quarters. She registers the data crystal immediately — her enhancement arrays catalogue everything in the room — and files it under \"academic curiosity.\" Then she offers him the Sector 7 Relay Station assignment, framed as a career milestone. The enhancement patterns under her skin run in a configuration Pro is beginning to read: flat, resolved, a decision already made before she sat down.",
			},
			{
				at: "4-1",
				text: "She arranged it. The manifest described eight passengers as \"transit evaluation, non-specialist.\" They were not. The trajectory she logged for CCLLIAN-ROUTE-9-ALPHA does not decelerate at Relay Station One. She has moved through the entire relationship — oversight, observation, manipulation, elimination — with mathematical precision. Not malice. Something colder. The certainty that a destabilizing element, once identified, must be solved.",
			},
		],
	},
	{
		id: "the-mechanic",
		term: "the Mechanic",
		aliases: [
			"Mechanic",
			"A-U-G-I-1-1-2",
		],
		category: "Character",
		image: "/lore/the_mechanic.webp",
		tagline:
			"Augmentations — official, and otherwise",
		reveals: [
			{
				at: "1-1",
				text: "An augmentation specialist who works out of Nexus Station behind the front of a nutrition dispensary. From her Pro buys his mother's black-market medicine — the anti-rejection compounds the Church of Purity has put beyond legal reach. A master of her trade, modified so far past her origins that little of her first face remains.",
			},
			{
				at: "1-2-2",
				text: "She has access to corporate proximity incident reports most technicians never hear about — fourteen workers across three decades who experienced anomalous perception near Vankh spheres after breathing protocol deviation. Every account classifies as Dilation Hysteria. Every phenomenological description is the same: something at the other end of the Vankh pulse, aware of the same boundary condition from its side. She gives Pro reference codes for the accessible ones and the classified ones both. She stops short of conclusions. She is precise about exactly where she stops.",
			},
			{
				at: "2-2",
				text: "She trades in information as readily as in flesh, an augur of things half-known. \"The universe operates on many rhythms, technician,\" she tells Pro as she seals his package. \"The Vankh pulse is merely the most obvious.\" A heresy spoken so lightly he nearly misses how vast it is.",
			},
			{
				at: "3-4",
				text: "She is part of the extraction network. Pro reaches her when the independent channels need medical expertise — she connects him to transit operators who move people without corporate manifests. She operates at the intersection of every faction without belonging to any of them, and her survival depends on everyone believing she is indispensable. So far, she is right.",
			},
		],
	},
	{
		id: "the-prophet",
		term: "The Prophet",
		aliases: ["Prophet"],
		category: "Character",
		image: "/lore/the_prophet.webp",
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
			{
				at: "2-2-2",
				text: "His original transit log survives in confiscated Purist materials — and it shows the secondary harmonic, naked and undeniable, in the data of a failing coupling. He encountered the same phenomenon Pro measured. He was too frightened, too unequipped, to read it as anything but divine. One true experience. One catastrophically wrong conclusion. An entire movement built on the mistranslation.",
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
			{
				at: "2-2-2",
				text: "The Church was built on a real experience misread. The Prophet's founding revelation was genuine contact with the secondary harmonic — the same phenomenon Pro's instruments confirmed. Reject technology to hear the divine pulse more clearly: a spiritually coherent conclusion from the wrong premise. The Church and Cicillian are symmetrically opposite responses to the same stimulus, neither of them right.",
			},
			{
				at: "3-1-2",
				text: "The Rhythm Communion — mandatory assembly for all habitat residents — is a counter-rhythm ceremony: congregants breathe deliberately out of phase with the Vankh pulse as an act of purification. True believers, reluctant compliers, and a small number watching the exits the way Father watches corridors. Seeing it from inside, the pattern is clear: the Church and Cicillian are not opposites but the same mechanism wearing different clothes. One harvests compliance through the promise of enhancement; the other through the fear of it. Both avoid the actual question. Both count on their subjects not comparing notes.",
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
			{
				at: "2-1",
				text: "Its grip tightens. A new policy puts every independent contractor under direct oversight — mathematical supervisors like Lin assigned to catalogue each off-books job, each non-standard tool, each deviation from procedure. Quality assurance, they call it; it reads more like a net being drawn slowly closed.",
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
			{
				at: "1-2-1",
				text: "Three sub-levels down, the factional architecture vanishes. The maintenance corridors beneath the Cicillian concourse and the Purist enclave and the independent section are built from the same materials in the same construction methodology, bearing the marks of the same engineering hand. The ideological divisions are surface — a renovation. The skeleton beneath is unified and old, built as a single structure before anyone decided it should be divided. The oxygen recyclers hum at the Vankh pulse's undertone. Pro asked the Mechanic if they were tuned to it. She said: self-corrects when she tries to retune it. That was her answer.",
			},
			{
				at: "2-1",
				text: "Seen up close, the station's body is an argument in metal and stone: Cicillian sections that gleam and seem to flow, independent additions bolted on at hard utilitarian angles, Purist enclaves left deliberately dim and rough. Beneath the public concourses runs a maintenance underworld of conduit and exposed infrastructure — the hidden labour that holds the seamless world above aloft, which both factions lean on while pretending it isn't there.",
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
			{
				at: "2-1-2",
				text: "A retired Cicillian engineer named Ren spent twenty Vankh-Setts running passive scans of the secondary harmonic from a pre-standardization coupling. His archive shows it is not noise. It has scheduled adjustments — corrective maintenance, a tolerance range, a calendar. The Vankh pulse is not something that happened to the universe. It is something being done to it, on a schedule, by something that has been maintaining it since before the factions existed.",
			},
		],
	},
	{
		id: "vankh-spheres",
		term: "Vankh spheres",
		aliases: ["Vankhs", "Vankh's Eye"],
		category: "Concept",
		image: "/lore/vankh.webp",
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
			{
				at: "2-2-1",
				text: "Pushed past its specification ceiling, Pro's scanner reveals that the secondary harmonic is not passive broadcast but active response — it tracks attention, changes when focused, returns to baseline when ignored. Whatever lies behind the Vankh's Eye is not merely watching. It is watching back, with something close to patience.",
			},
			{
				at: "3-3",
				text: "At seventeen kilometers from the third sphere, in standard breathing, it is evident what the reverse protocol suppresses: the Vankh'Ari cluster at the sphere's surface, and the sphere itself radiates frequencies that belong to no catalogued physical phenomenon. It does not merely hold the Pulse. It is observing what the Pulse moves through.",
			},
			{
				at: "4-1",
				text: "The third Vankh sphere is also the target. CCLLIAN-ROUTE-9-ALPHA's trajectory is not an approach but a collision course, four pulses from impact. At the threshold of impact, with the secondary harmonic fully present for the first time, Pro understands what the sphere actually is: not a prison, not infrastructure, not a relay. A threshold mechanism. It has been waiting for exactly this configuration of consciousness, from exactly the right direction, at exactly this moment in the cycle.",
			},
		],
	},
	{
		id: "correspondence",
		term: "Correspondence",
		aliases: [],
		category: "Concept",
		image: null,
		tagline:
			"As above, so below; as below, so above",
		reveals: [
			{
				at: "2-1",
				text: "The principle Pro begins to read in everything: that the pattern at the smallest scale and the pattern at the largest are the same pattern. An old hull says it plainly — uniform mineral signatures, sub-light impact angles, the meteorite wounds of a single small region of space where the flight logs claim light-years. The scale of their civilization is a fiction. Something has drawn a small box around them and painted the inside of it to look like the sky.",
			},
			{
				at: "2-2-2",
				text: "Cicillian and the Church of Purity: two opposing institutions, both shaped by encounter with the same phenomenon, both wrong in symmetrically opposite directions. The experiment arranged this. Two reactions to the same stimulus, carefully separated, watched from a distance sufficient to yield clean data. Correspondence reads in institutions as readily as in hull metal: the pattern at the scale of a civilization and the pattern at the scale of a coupling are the same pattern.",
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
			{
				at: "2-2-2",
				text: "The Prophet's founding vision was a Dilation Hysteria event during a coupling failure — every buffering layer stripped away, the secondary harmonic exposed at full strength with no instruments between him and it. Not hallucination. Unfiltered contact. The same experience Pro approached deliberately with a scanner, the Prophet survived unprotected and unprepared. What the terror made of the truth became the Church of Purity.",
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
			{
				at: "2-1",
				text: "The scarred hull turns the hint to near-certainty: uniform mineral signatures and sub-light impact angles, damage that belongs to one small neighbourhood of space rather than the light-years the logs record. Whatever FTL truly is, it is not carrying them nearly as far as they have been told.",
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
			"third breathing sequence",
			"third breathing pattern",
		],
		category: "Concept",
		image: "/lore/breathing_pattern.webp",
		tagline:
			"Left lung. Right lung. Pause. Reverse.",
		reveals: [
			{
				at: "1-1",
				text: "The breathwork every passenger performs to ease the body into the rhythm that carries it safely through the Pulse. Whispered aloud across a cabin it becomes a quiet chorus — a ritual as fundamental to human existence as speech itself.",
			},
			{
				at: "3-3",
				text: "The Vankh proximity protocol — reverse breathing, counter-rhythm, deliberate desynchronization — was not designed to protect workers from radiation or temporal distortion. It was designed to suppress perception of whatever clusters around the spheres. Two techniques are in every certification program. The third one exists nowhere in corporate documentation. Pro's mother showed it to him once, not in words, but in the rhythm of her own breathing during a moment of clarity: left lung, right lung, both equal, in phase with the Pulse rather than synchronized to it or counter-phased against it.",
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
		image: "/lore/pro_mother.webp",
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
			{
				at: "3-1",
				text: "She tested the secondary harmonic herself, through her failing arrays — and confirmed what Pro would later measure: that it tracks attention, changes when focused. She had been trying to communicate with what lay behind it, alone, with degrading tools. Her instruction to Pro is the most precise thing anyone has told him: try it without instruments. Give it something to respond to.",
			},
			{
				at: "4-2",
				text: "The shift in the Pulse that follows the formation of the fourth sphere is audible to her — the secondary harmonic integrating into the primary rhythm, present beneath every VVVVVANKH now rather than only in the quiet intervals. She receives Pro's transmission through her medical archive tag. She reads the crystal data in his notation, understands that it reached him at the right time, and understands what the shift in the Pulse means. She does not grieve. She had believed he could carry it to where it needed to go. She had been right.",
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
			{
				at: "3-2",
				text: "When Pro finally opens it, the archive holds four hundred and twelve data structures — his mother's career-long work as a Cicillian data specialist. What he finds inside is not conspiracy theory. It is impossibility: demographic records that show no net change after wars and plagues that the historical narratives confirm killed thousands. Before and after. Identical. Three mutually hostile data sources, incompatible methodologies, pointing at the same numbers. The population figures are not malfunctioning. They are consistent. They are consistent in a way that requires design.",
			},
			{
				at: "3-2-1",
				text: "The oldest records in the archive — pre-factional, pre-Consolidation — refer to the Vankh spheres as karreth: \"the walls of what is permitted,\" \"the seam between what has been built and what lies beyond the building.\" A fragmented deep record reads: \"The counting of the ones-who-were-placed continues as it has always continued. The intake cycles proceed. We remain.\" Pro runs his own designation: intake date, placement location, no birth, no prior existence. His mother's entry is the same structure. He does not open his father's record. He sits in the dark the rest of that cycle.",
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
			{
				at: "3-1",
				text: "Church enforcement now runs checkpoints at the disembarkation threshold — identity wands, enhancement inventories, secondary processing for the augmented. Pro's father runs a hidden rescue network beneath the maintenance level, moving people whose enhancement rejection would otherwise earn them forced purification. The habitat wears its contested governance in its hull: Cicillian polymer, Purist stone, and the bare bolted steel of people making do.",
			},
		],
	},
	{
		id: "pros-father",
		term: "Pro's Father",
		aliases: ["K-H-U-9-9-8"],
		category: "Character",
		image: null,
		tagline:
			"Engineer turned keeper of the lost",
		reveals: [
			{
				at: "1-1",
				text: "A former Cicillian maintenance engineer, \"retired\" early when his Motion Enhancer made him efficiency-compromised in the corporation's assessment. He built Pro's love of drive systems by bringing home technical manuals from the maintenance facility. At Pro's Academy departure, he tapped his damaged leg and said: \"You'll have more opportunities than I did.\"",
			},
			{
				at: "3-1",
				text: "In the Helix Habitat under Church occupation, he runs a quiet rescue network — sheltering those whose enhancement rejection has classified them for forced purification. He does it with the same economy of motion he taught Pro to use on a coupling: no wasted action, no announcement, just the work that needs doing. He asks nothing from his son except that he come back.",
			},
			{
				at: "3-1-1",
				text: "The network is larger than Pro knew: not one family at a time, but dozens in transit through the Helix maintenance infrastructure simultaneously. He opened a pre-standard conduit for them with his coupling credentials — something Father's people couldn't crack. Father's instruction before Pro left: \"If the assessment cycle escalates, don't come back here for me. Do what you came to do.\" He said it the way he said everything that mattered: once, without elaboration.",
			},
			{
				at: "3-4",
				text: "When the assessment cycle moved forward and Pro tried to route an extraction, the message came back plain and brief in Father's hand code: \"Assessment postponed. We're stable. Don't use this channel again.\" He pulled back to protect the network — and to protect Pro. The extraction was assessed as a risk and deliberately not completed. The dozens of people still moving through the maintenance levels beneath Helix were his priority. This is not surprising, and it is the heaviest thing Pro has ever been told without being told.",
			},
		],
	},
	{
		id: "vankhari",
		term: "Vankh'Ari",
		aliases: ["Vankh'Ari"],
		category: "Character",
		image: null,
		tagline: "Remnants of unmade realities",
		reveals: [
			{
				at: "3-3",
				text: "They appear when standard breathing replaces the proximity protocol near a Vankh sphere: tall, slender figures with light-absorbing skin and featureless black eyes, clustering at the sphere's surface. They do not move into view. They are simply there when perception shifts. They are not ghosts in any spiritual sense — they are structural remnants, purposeless presences from realities that ended before this one began. Corporate protocol was built specifically to prevent workers from seeing them.",
			},
			{
				at: "4-1",
				text: "One of them transmitted something directly to Pro in the coupling bay at Relay Station One — not through instruments, not through language, but through the same channel the secondary harmonic travels. Old and patient. Something carried a long way in time. Pro understood it, in the transit moments before the third Vankh sphere filled the forward viewport at impact velocity, as a warning he had received too late to avoid and exactly on time to use.",
			},
		],
	},
	{
		id: "sector-seven",
		term: "Sector 7",
		aliases: ["Relay Station One"],
		category: "Place",
		image: null,
		tagline: "The oldest proximity site",
		reveals: [
			{
				at: "3-3",
				text: "The sector containing the third Vankh sphere, and within it Relay Station One: the oldest Vankh-proximity monitoring installation still in operational use. Built before the second expansion, when researchers approached the spheres with notepads rather than corporate procedure manuals. The original coupling architecture was designed to understand the Pulse, not merely to use it. At seventeen kilometers from the sphere's surface, the primary pulse does not travel through ears but through the chest cavity.",
			},
		],
	},
	{
		id: "nankhu",
		term: "Nankh'U",
		aliases: ["Nunkh-U"],
		category: "Character",
		image: null,
		tagline: "The architect of what contains you",
		reveals: [
			{
				at: "3-2",
				text: "A name that surfaces in the deepest layers of Pro's mother's archive — in the oldest records, predating any corporate or religious classification. Listed as the originator of the Vankh network. Not its designer in the engineering sense, but in the sense of a consciousness that created physical laws and laid the boundary conditions. Neither faction names him; neither needs to. The network that makes civilization possible is his work. The experiment that civilization doesn't know it's running is his design.",
			},
			{
				at: "4-2",
				text: "The habitable zone he built expands only at the threshold moment — when a consciousness reaches the sphere with sufficient precision of attention to complete integration rather than fragmentation. The Vankh network was not designed to be static. It was designed to grow. Each sphere formed in this way extends the boundary by the measure of one consciousness that made it through. Nankh'U built the mechanism. What fills it is provided by the cycle.",
			},
		],
	},
	{
		id: "maldra",
		term: "Mald'Ra",
		aliases: ["Mald'Ra"],
		category: "Character",
		image: null,
		tagline: "The destroyer the spheres were built to hold",
		reveals: [
			{
				at: "3-2",
				text: "In the archive's mythology layer — older than the Church, older than Cicillian, in records that have no institutional fingerprint — Mald'Ra appears as the counterpart to Nankh'U. Where he structured and contained, she manifested and unmade. The Vankh spheres, the archive suggests, were built as prisons for something vast. The fear of her return is what both factions carry without naming it: the Church calls it the corruption of technology, Cicillian calls it systemic risk. Both are circling the same void.",
			},
			{
				at: "4-2",
				text: "The Prime Vankh was built to contain her. At the threshold moment, Pro discovers what it actually contains: nothing. Mald'Ra ceased to exist when the original boundary was established — not imprisoned, but completed, her function fulfilled. The mythology of her imprisonment is the control mechanism: the fear of a destroyer that no longer exists maintains the boundaries that keep the experiment stable. What the Church fears is an absence. What Cicillian guards against is a story.",
			},
		],
	},
	{
		id: "fae",
		term: "Fae",
		aliases: [],
		category: "Character",
		image: null,
		tagline: "The observer outside the experiment",
		reveals: [
			{
				at: "4-2",
				text: "Outside the boundary — outside the Pulse, outside the secondary harmonic, outside all the instruments with which the inhabitants of Experiment 2 have measured what they're living inside — something observed the outcome: a threshold condition met, the fourth sphere formed, integration rather than fragmentation. The data was recorded. The parameters for the next iteration adjusted accordingly. She has no moral framework for this outcome. She has only the unprecedented result: a consciousness that arrived at the threshold in the right language, from the right direction, and completed the crossing. This had not happened before.",
			},
		],
	},
	{
		id: "the-captain",
		term: "the Captain",
		aliases: ["captain", "independent captain"],
		category: "Character",
		image: null,
		tagline: "The pilot who remembers favors",
		reveals: [
			{
				at: "1-1",
				text: "The pilot of the independent shuttle Pro repairs during the transit — grizzled, operating in the margins of corporate oversight where people pay premium rates for untraceable transport. He said: \"We remember the ones who help.\" He meant it as a practical statement. It turns out to be a structural one.",
			},
			{
				at: "2-1-2",
				text: "The captain surfaces as a connector — he leads Pro to Ren, a retired Cicillian engineer in the Purist enclave with twenty Vankh-Setts of secondary harmonic data. The captain's network runs on reciprocity: favors owed, favors paid. He keeps no accounts because he doesn't need to. The accounts keep themselves.",
			},
			{
				at: "3-4-1",
				text: "He routes the extraction through a freight coordinator's mining-supply loop: no corporate manifest, no Lin. One question — \"Will they trust a stranger's ship?\" — and then the logistics work begins. When Pro's Father pulls back to protect the network, the captain's routes remain intact and unused. He receives the message and says nothing about it. He has had this conversation with many people and he knows what silence after a cancelled extraction means. He keeps the route open.",
			},
		],
	},
	{
		id: "proto-humans",
		term: "Proto-Human",
		aliases: ["Proto-Humans"],
		category: "Faction",
		image: null,
		tagline: "The inhabitants of the experiment",
		reveals: [
			{
				at: "1-1",
				text: "The species that inhabits settled space — bi-pupiled eyes adapted to FTL travel, elongated fingers for precision work in machinery, strengthened muscles and tendons for exposure to the varying gravities and radiations of different environments. They structure their culture, time, and technology around the Vankh pulse.",
			},
			{
				at: "4-1-1",
				text: "There are no birth records. Pro's mother's archive holds four hundred and twelve data structures spanning generations — and not one of them is a birth certificate, an intake registration for a newborn, a record of origin for any individual before their Academy designation. The census numbers never change because they cannot change. Proto-Humans do not reproduce. They are placed. The system that needs them at the threshold places them in the right configurations and leaves the rest to the mechanics of civilization.",
			},
		],
	},
];

export const loreById = new Map(
	lore.map((e) => [e.id, e])
);
