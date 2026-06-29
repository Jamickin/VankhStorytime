<script>
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { findConcepts } from "$lib/conceptParser.js";
	import {
		lore,
		loreById,
	} from "$lib/content/lore.js";
	import LoreImage from "./LoreImage.svelte";
	import LoreModal from "./LoreModal.svelte";
	import {
		chapters,
		getChapter,
	} from "$lib/content/chapters.js";
	import {
		START,
		choicesFor,
		canonNext,
		isBranchPoint,
		partOf,
		partLabel,
	} from "$lib/content/storyGraph.js";
	import { visited } from "$lib/progress.js";

	// ── Layout constants ────────────────────────────────────────────────────
	const CX = 260; // spine center x in viewBox coords
	const VBOX_W = 520;
	const Y_START = 72;
	const Y_STEP = 118; // vertical step for spine nodes
	const Y_BRANCH = 168; // extra step height when a fork occurs
	const BRANCH_X = 176; // ± offset from center for branch nodes
	const BRANCH_T = 0.52; // where in [0,1] the branch node sits

	// ── Build layout from story graph ───────────────────────────────────────
	const nodePos = new Map();
	const edges = [];
	let totalH = Y_START;

	{
		let y = Y_START;
		let cur = START;
		const done = new Set();

		while (cur && !done.has(cur)) {
			done.add(cur);
			const choices = choicesFor(cur);
			const nonCanon = choices.filter(
				(c) => !c.canon
			);
			const canon =
				choices.find((c) => c.canon) ??
				choices[0];

			nodePos.set(cur, {
				x: CX,
				y,
				isBranch: false,
			});

			const step =
				nonCanon.length > 0
					? Y_BRANCH
					: Y_STEP;
			const nextY = y + step;
			const branchY = y + step * BRANCH_T;

			const bxOpts =
				nonCanon.length === 1
					? [CX - BRANCH_X]
					: [CX - BRANCH_X, CX + BRANCH_X];

			nonCanon.forEach((ch, i) => {
				const bx =
					bxOpts[i] ?? CX - BRANCH_X;
				nodePos.set(ch.to, {
					x: bx,
					y: branchY,
					isBranch: true,
				});
				edges.push({
					from: cur,
					to: ch.to,
					canon: false,
				});
				if (canon)
					edges.push({
						from: ch.to,
						to: canon.to,
						canon: false,
					});
			});

			if (canon && !done.has(canon.to)) {
				edges.push({
					from: cur,
					to: canon.to,
					canon: true,
				});
			}

			y = nextY;
			if (!canon) break;
			cur = canon.to;
		}

		totalH = y + 52;
	}

	// Predecessors map: slug → Set of slugs that link TO it
	const predecessors = new Map();
	for (const e of edges) {
		if (!predecessors.has(e.to)) predecessors.set(e.to, new Set());
		predecessors.get(e.to).add(e.from);
	}

	// ── Mystery / frontier derived from visited ─────────────────────────────
	let frontier = $derived(() => {
		const f = new Set();
		for (const slug of $visited) {
			for (const c of choicesFor(slug)) {
				if (!$visited.has(c.to)) f.add(c.to);
			}
		}
		return f;
	});

	let mystery = $derived(() => {
		const m = new Set();
		const f = frontier();
		for (const slug of f) {
			for (const c of choicesFor(slug)) {
				if (!$visited.has(c.to) && !f.has(c.to)) m.add(c.to);
			}
		}
		return m;
	});

	// ── Seeded RNG for stable satellite positions ────────────────────────────
	function seededRng(seed) {
		let s = Math.abs(seed) | 0;
		return () => {
			s = (s * 1664525 + 1013904223) & 0x7fffffff;
			return s / 0x7fffffff;
		};
	}
	function slugSeed(slug) {
		let h = 5381;
		for (const c of slug) h = ((h << 5) + h + c.charCodeAt(0)) & 0x7fffffff;
		return h;
	}
	function satOffsets(slug, count, nodeRadius) {
		const rng = seededRng(slugSeed(slug));
		return Array.from({ length: count }, (_, i) => {
			const spread = count === 1 ? 0 : (i / (count - 1) - 0.5) * 1.1;
			const baseAngle = -Math.PI / 2 + spread;
			const angle = baseAngle + (rng() - 0.5) * 0.35;
			const r = nodeRadius + 18 + rng() * 18;
			return { dx: Math.cos(angle) * r, dy: Math.sin(angle) * r };
		});
	}

	// ── Ambient drift ────────────────────────────────────────────────────────
	let driftT = $state(0);
	let driftRaf;

	onMount(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		let prev;
		function loop(ts) {
			if (prev !== undefined) driftT += (ts - prev) * 0.001;
			prev = ts;
			driftRaf = requestAnimationFrame(loop);
		}
		driftRaf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(driftRaf);
	});

	function nodePhase(slug) {
		let h = 0;
		for (const c of slug) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
		return (h % 628) / 100;
	}
	function driftX(slug) {
		return 7 * Math.sin(((2 * Math.PI) * driftT) / 18 + nodePhase(slug));
	}

	// ── SVG path generation ─────────────────────────────────────────────────
	function spineD(x1, y1, x2, y2) {
		const dy = y2 - y1;
		const ph = Math.sin(y1 * 0.041) * 27;
		return `M ${x1} ${y1} C ${x1 + ph} ${y1 + dy * 0.37}, ${x2 - ph} ${y1 + dy * 0.63}, ${x2} ${y2}`;
	}

	function branchOutD(x1, y1, x2, y2) {
		const dx = x2 - x1;
		const dy = y2 - y1;
		const cx1 = x1 + dx * 0.58 + (dx < 0 ? -28 : 28);
		const cy1 = y1 + dy * 0.08;
		const cx2 = x2 + dx * 0.21;
		const cy2 = y2 - dy * 0.28;
		return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
	}

	function branchInD(x1, y1, x2, y2) {
		const dx = x2 - x1;
		const dy = y2 - y1;
		const flare = x1 < CX ? -24 : 24;
		const cx1 = x1 + flare;
		const cy1 = y1 + dy * 0.38;
		const cx2 = x2 - dx * 0.29;
		const cy2 = y2 - dy * 0.18;
		return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
	}

	// Edges use driftX so strings visually follow their nodes
	function edgeD(fromSlug, toSlug) {
		const f = nodePos.get(fromSlug);
		const t = nodePos.get(toSlug);
		if (!f || !t) return "";
		const fx = f.x + driftX(fromSlug);
		const tx = t.x + driftX(toSlug);
		if (!f.isBranch && t.isBranch)
			return branchOutD(fx, f.y, tx, t.y);
		if (f.isBranch && !t.isBranch)
			return branchInD(fx, f.y, tx, t.y);
		return spineD(fx, f.y, tx, t.y);
	}

	// ── Lore per chapter ────────────────────────────────────────────────────
	const CAT_ORDER = {
		Character: 0,
		Place: 1,
		Faction: 2,
		Concept: 3,
	};
	const lorePerChapter = new Map();
	for (const ch of chapters) {
		const text = ch.paragraphs.join(" ");
		const seen = new Set();
		const entries = [];
		for (const m of findConcepts(text, lore)) {
			if (!seen.has(m.conceptId)) {
				seen.add(m.conceptId);
				const e = loreById.get(m.conceptId);
				if (e) entries.push(e);
			}
		}
		entries.sort(
			(a, b) =>
				(CAT_ORDER[a.category] ?? 4) -
				(CAT_ORDER[b.category] ?? 4)
		);
		lorePerChapter.set(
			ch.slug,
			entries.slice(0, 3)
		);
	}

	// Precompute stable satellite offsets once at init
	const satOffsetsCache = new Map();
	for (const [slug] of nodePos.entries()) {
		const sats = lorePerChapter.get(slug) ?? [];
		if (sats.length > 0) {
			satOffsetsCache.set(
				slug,
				satOffsets(slug, sats.length, isBranchPoint(slug) ? 10 : 8)
			);
		}
	}

	function chapterSnippet(slug) {
		const c = getChapter(slug);
		if (!c) return "";
		const p = c.paragraphs[0] ?? "";
		return p.length > 172
			? p.slice(0, 169) + "…"
			: p;
	}

	function trimTitle(t, max = 24) {
		return t.length > max
			? t.slice(0, max) + "…"
			: t;
	}

	// ── Part-change dividers ────────────────────────────────────────────────
	const partDividers = [];
	{
		const byY = [...nodePos.entries()].sort(
			(a, b) => a[1].y - b[1].y
		);
		let prev = null;
		for (const [slug, pos] of byY) {
			const p = partOf(slug);
			if (p !== null && prev !== null && p !== prev) {
				partDividers.push({
					y: pos.y - 20,
					part: p,
					label: partLabel(p),
				});
			}
			if (p !== null) prev = p;
		}
	}

	// ── Hover / tooltip ─────────────────────────────────────────────────────
	let container = $state(null);
	let svgEl = $state(null);
	let hovered = $state(null); // { slug, x, y } container-px
	let hoveredSat = $state(null); // { entry, px, py } container-px
	let selectedLore = $state(null);

	function onEnter(slug) {
		if (hoveredSat) return;
		if (hovered?.slug === slug) return;
		const pos = nodePos.get(slug);
		if (!pos || !svgEl || !container) return;
		const ctm = svgEl.getScreenCTM();
		if (!ctm) return;
		const pt = svgEl.createSVGPoint();
		pt.x = pos.x + driftX(slug);
		pt.y = pos.y;
		const sc = pt.matrixTransform(ctm);
		const cr = container.getBoundingClientRect();
		hovered = {
			slug,
			x: sc.x - cr.left,
			y: sc.y - cr.top,
		};
	}

	function enterSat(entry, event) {
		if (!container) return;
		const cr = container.getBoundingClientRect();
		hoveredSat = {
			entry,
			px: event.clientX - cr.left,
			py: event.clientY - cr.top,
		};
		hovered = null;
	}

	// ── Helpers ─────────────────────────────────────────────────────────────
	function isLit(a, b) {
		return $visited.has(a) && $visited.has(b);
	}
	function nodeR(slug) {
		return isBranchPoint(slug) ? 10 : 8;
	}
</script>

<div bind:this={container} class="relative">
	<svg
		bind:this={svgEl}
		viewBox="0 0 {VBOX_W} {totalH}"
		class="w-full"
		preserveAspectRatio="xMidYMin meet"
		aria-label="Story timeline"
	>
		<!-- Part I label (always at top) -->
		<text
			x="32"
			y="52"
			font-size="7.5"
			font-family="Montserrat,sans-serif"
			letter-spacing="3"
			font-weight="600"
			fill="rgba(214,163,72,0.3)"
		>PART I · RHYTHM</text>

		<!-- Part-change dividers -->
		{#each partDividers as d}
			<line
				x1="32"
				y1={d.y + 15}
				x2={VBOX_W - 32}
				y2={d.y + 15}
				stroke="rgba(180,100,30,0.14)"
				stroke-dasharray="3 9"
				stroke-width="1"
			/>
			<text
				x={CX}
				y={d.y + 11}
				text-anchor="middle"
				font-size="7.5"
				font-family="Montserrat,sans-serif"
				letter-spacing="3"
				font-weight="600"
				fill="rgba(214,163,72,0.28)"
			>PART {d.part} · {d.label?.toUpperCase() ?? ""}</text>
		{/each}

		<!-- Edges (strings follow drifting nodes) -->
		{#each edges as e}
			{@const lit = isLit(e.from, e.to)}
			<path
				d={edgeD(e.from, e.to)}
				fill="none"
				stroke={lit
					? e.canon
						? "#92400e"
						: "#78350f"
					: e.canon
						? "#2d2118"
						: "#1e1810"}
				stroke-width={e.canon
					? lit ? 1.8 : 1.5
					: lit ? 1.3 : 1}
				stroke-dasharray={!e.canon && !lit
					? "4 8"
					: undefined}
				stroke-linecap="round"
				opacity={lit
					? 0.9
					: e.canon ? 0.55 : 0.38}
			/>
		{/each}

		<!-- Nodes -->
		{#each [...nodePos.entries()] as [slug, pos]}
			{@const ch = getChapter(slug)}
			{@const vis = $visited.has(slug)}
			{@const inFrontier = frontier().has(slug)}
			{@const inMystery = mystery().has(slug)}
			{@const hot = hovered?.slug === slug}
			{@const fork = isBranchPoint(slug)}
			{@const sats = vis ? (lorePerChapter.get(slug) ?? []) : []}
			{@const offsets = satOffsetsCache.get(slug) ?? []}
			{#if ch}
				<g
					style="cursor:{inMystery ? 'default' : 'pointer'}"
					onmouseenter={() => onEnter(slug)}
					onmousemove={() => { if (!hoveredSat) onEnter(slug); }}
					onmouseleave={() => { hovered = null; }}
					onclick={() => { if (!inMystery) goto('/read/' + slug); }}
					onkeydown={(e) => { if (e.key === 'Enter' && !inMystery) goto('/read/' + slug); }}
					role="button"
					tabindex="0"
					aria-label="Chapter {ch.number}{inMystery ? '' : ': ' + ch.title}"
					onfocus={() => onEnter(slug)}
					onblur={() => { hovered = null; }}
				>
					<!-- Invisible hit-area stays at original (undrifted) position -->
					<circle
						cx={pos.x}
						cy={pos.y}
						r="22"
						fill="transparent"
					/>

					<!-- All visuals drift together -->
					<g transform="translate({driftX(slug)}, 0)">
						<!-- Satellite lore nodes (visited chapters only) -->
						{#if sats.length > 0}
							{#each sats as entry, i}
								{@const off = offsets[i] ?? { dx: 0, dy: -24 }}
								{@const satHot = hoveredSat?.entry?.id === entry.id}
								<line
									x1={pos.x}
									y1={pos.y}
									x2={pos.x + off.dx}
									y2={pos.y + off.dy}
									stroke="rgba(180,100,30,0.15)"
									stroke-width="0.5"
								/>
								<circle
									cx={pos.x + off.dx}
									cy={pos.y + off.dy}
									r="4.5"
									fill={satHot ? "#92400e" : "#2a1f14"}
									stroke={satHot ? "#fbbf24" : "rgba(180,100,30,0.5)"}
									stroke-width="1"
									style="cursor:pointer"
									onmouseenter={(e) => { e.stopPropagation(); enterSat(entry, e); }}
									onmouseleave={(e) => { e.stopPropagation(); hoveredSat = null; }}
									onclick={(e) => { e.stopPropagation(); selectedLore = entry; }}
									onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectedLore = entry; } }}
									role="button"
									aria-label={entry.term}
									tabindex="0"
								/>
							{/each}
						{/if}

						<!-- Outer glow (visited or hovered) -->
						{#if vis || hot}
							<circle
								class={vis ? 'node-pulse' : ''}
								cx={pos.x}
								cy={pos.y}
								r={nodeR(slug) + (hot ? 9 : 7)}
								fill="none"
								stroke={hot
									? "rgba(251,191,36,0.35)"
									: "rgba(180,83,9,0.2)"}
								stroke-width="1.5"
							/>
						{/if}

						<!-- Fork outer ring (dashed) -->
						{#if fork}
							<circle
								cx={pos.x}
								cy={pos.y}
								r={nodeR(slug) + 5}
								fill="none"
								stroke={vis
									? "rgba(251,191,36,0.4)"
									: "rgba(100,80,60,0.28)"}
								stroke-width="1"
								stroke-dasharray="3 5"
							/>
						{/if}

						<!-- Main node circle -->
						<circle
							cx={pos.x}
							cy={pos.y}
							r={nodeR(slug)}
							fill={vis ? "#92400e" : inMystery ? "#1a1208" : "#14100c"}
							stroke={vis
								? "#fbbf24"
								: hot
									? "#78716c"
									: inMystery
										? "rgba(60,47,34,0.6)"
										: "#3c2f22"}
							stroke-width={vis ? 2 : inMystery ? 1 : 1.5}
							opacity={inMystery ? 0.5 : 1}
						/>

						<!-- Mystery: sealed glyph -->
						{#if inMystery}
							<text
								x={pos.x + nodeR(slug) + 10}
								y={pos.y}
								dominant-baseline="middle"
								font-size="8"
								font-family="Montserrat,sans-serif"
								fill="rgba(74,64,53,0.5)"
								letter-spacing="0.3"
							>· · ·</text>

						<!-- Label: spine nodes right-side; branch nodes same-side -->
						{:else if !pos.isBranch}
							<text
								x={pos.x + nodeR(slug) + 10}
								y={pos.y}
								dominant-baseline="middle"
								font-size="9.5"
								font-family="Montserrat,sans-serif"
								fill={vis
									? "#fcd34d"
									: hot ? "#a8a29e" : "#4a4035"}
								letter-spacing="0.4"
							>
								{ch.number} · {trimTitle(ch.title)}
							</text>
						{:else}
							{@const isLeft = pos.x < CX}
							<text
								x={isLeft
									? pos.x - nodeR(slug) - 8
									: pos.x + nodeR(slug) + 8}
								y={pos.y}
								dominant-baseline="middle"
								text-anchor={isLeft ? "end" : "start"}
								font-size="8"
								font-family="Montserrat,sans-serif"
								fill={vis
									? "#fcd34d"
									: hot ? "#a8a29e" : "#3a3228"}
							>
								{ch.number}
							</text>
						{/if}
					</g>
				</g>
			{/if}
		{/each}
	</svg>

	<!-- Chapter hover tooltip -->
	{#if hovered && !hoveredSat}
		{@const ch = getChapter(hovered.slug)}
		{@const inMystery = mystery().has(hovered.slug)}
		{@const entries =
			lorePerChapter.get(hovered.slug) ?? []}
		{#if ch && !inMystery}
			{@const TW = 260}
			{@const cW = container?.clientWidth ?? 520}
			{@const tx =
				hovered.x + 26 + TW > cW
					? hovered.x - TW - 18
					: hovered.x + 26}
			{@const ty = Math.max(
				8,
				hovered.y - 68
			)}
			<div
				class="pointer-events-none absolute z-20 rounded-xl border border-amber-900/30 bg-[#1a1108]/95 p-4 shadow-2xl backdrop-blur"
				style="left:{tx}px;top:{ty}px;width:{TW}px;"
			>
				<p
					class="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-500/60"
				>
					Chapter {ch.number}
				</p>
				<p
					class="mt-0.5 text-[13px] font-semibold text-stone-100"
				>
					{ch.title}
				</p>
				<p
					class="tooltip-snippet mt-2 text-[11px] leading-relaxed text-stone-400"
				>
					{chapterSnippet(hovered.slug)}
				</p>
				{#if entries.length > 0}
					<div class="mt-3 flex gap-2.5">
						{#each entries as entry}
							<div
								class="lore-thumb flex flex-col items-center gap-1"
							>
								<div
									class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-sm"
								>
									<LoreImage {entry} />
								</div>
								<span
									class="max-w-[48px] truncate text-center text-[9px] leading-tight text-stone-500"
								>
									{entry.term}
								</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{:else if ch && inMystery}
			{@const TW = 180}
			{@const cW = container?.clientWidth ?? 520}
			{@const tx =
				hovered.x + 26 + TW > cW
					? hovered.x - TW - 18
					: hovered.x + 26}
			{@const ty = Math.max(8, hovered.y - 40)}
			<div
				class="pointer-events-none absolute z-20 rounded-xl border border-stone-800/40 bg-[#1a1108]/90 p-3 shadow-2xl backdrop-blur"
				style="left:{tx}px;top:{ty}px;width:{TW}px;"
			>
				<p class="text-[11px] italic text-stone-600">
					🔒 This chapter's story is still sealed.
				</p>
			</div>
		{/if}
	{/if}

	<!-- Satellite hover tooltip -->
	{#if hoveredSat}
		{@const e = hoveredSat.entry}
		{@const TW = 170}
		{@const cW = container?.clientWidth ?? 520}
		{@const tx =
			hoveredSat.px + 12 + TW > cW
				? hoveredSat.px - TW - 8
				: hoveredSat.px + 12}
		{@const ty = Math.max(4, hoveredSat.py - 58)}
		<div
			class="pointer-events-none absolute z-20 rounded-lg border border-amber-900/30 bg-[#1a1108]/96 px-3 py-2.5 shadow-xl backdrop-blur"
			style="left:{tx}px;top:{ty}px;width:{TW}px;"
		>
			<p class="font-mono text-[9px] uppercase tracking-widest text-amber-500/60">{e.category}</p>
			<p class="mt-0.5 text-[12px] font-semibold leading-tight text-stone-100">{e.term}</p>
			<p class="mt-1 text-[10px] italic leading-relaxed text-stone-400">{e.tagline}</p>
		</div>
	{/if}

	<!-- Lore modal (opened from satellite nodes) -->
	<LoreModal
		entry={selectedLore}
		onclose={() => (selectedLore = null)}
	/>
</div>

<style>
	:global(.lore-thumb .impasto span) {
		font-size: 1.3rem !important;
		letter-spacing: 0.05em;
	}

	.tooltip-snippet {
		display: -webkit-box;
		-webkit-line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	@keyframes node-pulse {
		0%, 100% { opacity: 0.18; }
		50% { opacity: 0.38; }
	}
	.node-pulse {
		animation: node-pulse 4s ease-in-out infinite;
	}
	@media (prefers-reduced-motion: reduce) {
		.node-pulse { animation: none; }
	}
</style>
