<script>
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { findConcepts } from "$lib/conceptParser.js";
	import {
		lore,
		loreById,
	} from "$lib/content/lore.js";
	import LoreImage from "./LoreImage.svelte";
	import { openLore } from "$lib/stores/lorePanel.js";
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
		introPerChapter,
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
		const sats = introPerChapter.get(slug) ?? [];
		if (sats.length > 0) {
			// Pass a larger effective radius so the 28px thumbnail orbit clears the node
			satOffsetsCache.set(
				slug,
				satOffsets(slug, sats.length, (isBranchPoint(slug) ? 11 : 9) + 16)
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
		return isBranchPoint(slug) ? 11 : 9;
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
			fill="rgba(214,163,72,0.4)"
		>PART I · RHYTHM</text>

		<!-- Part-change dividers -->
		{#each partDividers as d}
			<line
				x1="32"
				y1={d.y + 15}
				x2={VBOX_W - 32}
				y2={d.y + 15}
				stroke="rgba(180,100,30,0.22)"
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
				fill="rgba(214,163,72,0.4)"
			>PART {d.part} · {d.label?.toUpperCase() ?? ""}</text>
		{/each}

		<!-- Edges (strings follow drifting nodes) -->
		{#each edges as e}
			{@const lit = isLit(e.from, e.to)}
			{#if lit}
				<path
					d={edgeD(e.from, e.to)}
					fill="none"
					stroke="rgba(160,70,10,0.09)"
					stroke-width="9"
					stroke-linecap="round"
				/>
			{/if}
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
			{@const sats = vis ? (introPerChapter.get(slug) ?? []) : []}
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
						<!-- Satellite lore thumbnails (foreignObject HTML inside SVG transform) -->
						{#if sats.length > 0}
							{#each sats as entry, i (entry.id)}
								{@const off = offsets[i] ?? { dx: 0, dy: -36 }}
								{@const satHot = hoveredSat?.entry?.id === entry.id}
								<!-- Tether line: dotted, subtle -->
								<line
									x1={pos.x}
									y1={pos.y}
									x2={pos.x + off.dx}
									y2={pos.y + off.dy}
									stroke="rgba(180,100,30,0.12)"
									stroke-width="0.6"
									stroke-dasharray="2 5"
								/>
								<!-- Portrait thumbnail via foreignObject so full CSS works -->
								<foreignObject
									x={pos.x + off.dx - 14}
									y={pos.y + off.dy - 14}
									width="28"
									height="28"
									style="overflow:visible"
								>
									<div
										class="sat-thumb{satHot ? ' sat-hot' : ''}"
										onmouseenter={(e) => { e.stopPropagation(); enterSat(entry, e); }}
										onmouseleave={(e) => { e.stopPropagation(); hoveredSat = null; }}
										onclick={(e) => { e.stopPropagation(); openLore(entry); }}
										onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLore(entry); } }}
										role="button"
										tabindex="0"
										aria-label={entry.term}
									>
										<LoreImage {entry} />
									</div>
								</foreignObject>
							{/each}
						{/if}

						<!-- Outer ambient glow for visited nodes (pulsing ring) -->
						{#if vis}
							<circle
								class="node-pulse"
								cx={pos.x}
								cy={pos.y}
								r={nodeR(slug) + 9}
								fill="none"
								stroke="rgba(180,83,9,0.18)"
								stroke-width="1.2"
							/>
							<!-- Inner warm ring -->
							<circle
								cx={pos.x}
								cy={pos.y}
								r={nodeR(slug) + 4}
								fill="none"
								stroke={hot ? "rgba(251,191,36,0.55)" : "rgba(180,83,9,0.35)"}
								stroke-width="1.5"
							/>
						{:else if hot && !inMystery}
							<circle
								cx={pos.x}
								cy={pos.y}
								r={nodeR(slug) + 12}
								fill="none"
								stroke="rgba(251,191,36,0.18)"
								stroke-width="1"
							/>
						{:else if inFrontier}
							<!-- Frontier slow pulse -->
							<circle
								class="frontier-ring"
								cx={pos.x}
								cy={pos.y}
								r={nodeR(slug) + 9}
								fill="none"
								stroke="rgba(120,90,50,0.28)"
								stroke-width="1"
							/>
						{/if}

						<!-- Fork: diamond indicator -->
						{#if fork}
							{@const dr = nodeR(slug) + 7}
							<polygon
								points="{pos.x},{pos.y - dr} {pos.x + dr},{pos.y} {pos.x},{pos.y + dr} {pos.x - dr},{pos.y}"
								fill="none"
								stroke={vis ? "rgba(251,191,36,0.28)" : "rgba(100,80,60,0.22)"}
								stroke-width="1"
							/>
						{/if}

						<!-- Main node circle -->
						<circle
							cx={pos.x}
							cy={pos.y}
							r={nodeR(slug)}
							fill={vis ? "#92400e" : inMystery ? "#120e09" : hot ? "#1a140e" : "#14100c"}
							stroke={vis
								? hot ? "#ffe066" : "#fbbf24"
								: hot
									? "#78716c"
									: inFrontier
										? "#4a3f34"
										: inMystery
											? "rgba(60,47,34,0.55)"
											: "#3c2f22"}
							stroke-width={vis ? 2.2 : inMystery ? 1 : 1.5}
							opacity={inMystery ? 0.45 : 1}
						/>

						<!-- Visited: small bright centre dot -->
						{#if vis}
							<circle
								cx={pos.x}
								cy={pos.y}
								r={nodeR(slug) * 0.32}
								fill="rgba(253,211,77,0.65)"
							/>
						{/if}

						<!-- Mystery label -->
						{#if inMystery}
							<text
								x={pos.x + nodeR(slug) + 10}
								y={pos.y}
								dominant-baseline="middle"
								font-size="8"
								font-family="Montserrat,sans-serif"
								fill="rgba(74,64,53,0.45)"
								letter-spacing="0.3"
							>· · ·</text>

						<!-- Spine nodes: label on the right -->
						{:else if !pos.isBranch}
							<text
								x={pos.x + nodeR(slug) + 13}
								y={pos.y}
								dominant-baseline="middle"
								font-size="9.5"
								font-family="Montserrat,sans-serif"
								fill={vis ? "#fcd34d" : hot ? "#a8a29e" : "#4a4035"}
								letter-spacing="0.4"
							>{ch.number} · {trimTitle(ch.title)}</text>
						{:else}
							<!-- Branch nodes: label on the side -->
							{@const isLeft = pos.x < CX}
							<text
								x={isLeft ? pos.x - nodeR(slug) - 10 : pos.x + nodeR(slug) + 10}
								y={pos.y}
								dominant-baseline="middle"
								text-anchor={isLeft ? "end" : "start"}
								font-size="8.5"
								font-family="Montserrat,sans-serif"
								fill={vis ? "#fcd34d" : hot ? "#a8a29e" : "#3a3228"}
							>{ch.number}</text>
						{/if}
					</g>
				</g>
			{/if}
		{/each}
	</svg>

	<!-- Chapter hover card -->
	{#if hovered && !hoveredSat}
		{@const ch = getChapter(hovered.slug)}
		{@const inMystery = mystery().has(hovered.slug)}
		{@const vis = $visited.has(hovered.slug)}
		{@const entries = lorePerChapter.get(hovered.slug) ?? []}
		{#if ch && !inMystery}
			{@const TW = 300}
			{@const cW = container?.clientWidth ?? 520}
			{@const tx = hovered.x + 30 + TW > cW ? hovered.x - TW - 22 : hovered.x + 30}
			{@const ty = Math.max(8, hovered.y - 90)}
			{@const banner = entries.find(e => e.image) ?? (entries[0] ?? null)}
			<div
				class="chapter-card"
				style="left:{tx}px;top:{ty}px;width:{TW}px;"
			>
				{#if banner}
					<div class="card-banner">
						<LoreImage entry={banner} />
						<div class="card-banner-fade"></div>
						{#if vis}
							<span class="card-read-badge">✦ read</span>
						{/if}
					</div>
				{:else}
					<div class="card-banner-empty">
						{#if vis}<span class="card-read-badge-plain">✦ read</span>{/if}
					</div>
				{/if}
				<div class="card-body">
					<p class="card-ch-num">Chapter {ch.number}</p>
					<h3 class="card-ch-title">{ch.title}</h3>
					<p class="card-snippet tooltip-snippet">{chapterSnippet(hovered.slug)}</p>
					{#if entries.length > 0}
						<div class="card-lore-row">
							{#each entries as entry (entry.id)}
								<div class="card-lore-thumb">
									<LoreImage {entry} />
								</div>
								<span class="card-lore-label">{entry.term}</span>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{:else if ch && inMystery}
			{@const TW = 200}
			{@const cW = container?.clientWidth ?? 520}
			{@const tx = hovered.x + 30 + TW > cW ? hovered.x - TW - 22 : hovered.x + 30}
			{@const ty = Math.max(8, hovered.y - 40)}
			<div
				class="mystery-card"
				style="left:{tx}px;top:{ty}px;width:{TW}px;"
			>
				<p>🔒 This chapter lies sealed.</p>
			</div>
		{/if}
	{/if}

	<!-- Satellite hover tooltip -->
	{#if hoveredSat}
		{@const e = hoveredSat.entry}
		{@const TW = 180}
		{@const cW = container?.clientWidth ?? 520}
		{@const tx = hoveredSat.px + 14 + TW > cW ? hoveredSat.px - TW - 10 : hoveredSat.px + 14}
		{@const ty = Math.max(4, hoveredSat.py - 66)}
		<div
			class="sat-tooltip"
			style="left:{tx}px;top:{ty}px;width:{TW}px;"
		>
			<div class="sat-tooltip-thumb">
				<LoreImage entry={e} />
			</div>
			<div class="sat-tooltip-body">
				<p class="sat-tooltip-cat">{e.category}</p>
				<p class="sat-tooltip-term">{e.term}</p>
				<p class="sat-tooltip-tagline">{e.tagline}</p>
			</div>
		</div>
	{/if}

</div>

<style>
	/* Satellite portrait thumbnail — rendered via foreignObject */
	:global(.sat-thumb) {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		overflow: hidden;
		border: 1.5px solid rgba(180, 100, 30, 0.45);
		cursor: pointer;
		box-sizing: border-box;
		transition: border-color 0.18s, box-shadow 0.18s;
		background: #120e09;
	}
	:global(.sat-thumb:hover),
	:global(.sat-thumb.sat-hot) {
		border-color: #fbbf24;
		box-shadow: 0 0 8px rgba(251, 191, 36, 0.55), 0 0 18px rgba(251, 191, 36, 0.2);
	}

	/* Chapter hover card */
	.chapter-card {
		pointer-events: none;
		position: absolute;
		z-index: 20;
		border-radius: 0.875rem;
		overflow: hidden;
		border: 1px solid rgba(180, 100, 30, 0.22);
		background: rgba(20, 13, 7, 0.97);
		box-shadow:
			0 24px 64px rgba(0, 0, 0, 0.65),
			inset 0 0 0 1px rgba(255, 180, 80, 0.04);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}
	.card-banner {
		position: relative;
		height: 76px;
		width: 100%;
		overflow: hidden;
		background: #0d0905;
	}
	.card-banner-fade {
		position: absolute;
		inset: 0;
		background: linear-gradient(to bottom, rgba(20,13,7,0) 20%, rgba(20,13,7,0.92) 100%);
	}
	.card-banner-empty {
		height: 28px;
		display: flex;
		align-items: center;
		padding: 0 14px;
		background: linear-gradient(to right, rgba(180,83,9,0.06), transparent);
	}
	.card-read-badge {
		position: absolute;
		top: 7px;
		right: 10px;
		font-family: 'Montserrat', sans-serif;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #fcd34d;
		background: rgba(0,0,0,0.55);
		padding: 2px 7px;
		border-radius: 99px;
		border: 1px solid rgba(252,211,77,0.3);
	}
	.card-read-badge-plain {
		font-family: 'Montserrat', sans-serif;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: rgba(252,211,77,0.6);
	}
	.card-body {
		padding: 10px 14px 13px;
	}
	.card-ch-num {
		font-family: 'Montserrat', monospace;
		font-size: 9px;
		text-transform: uppercase;
		letter-spacing: 0.22em;
		color: rgba(251, 191, 36, 0.5);
		margin: 0;
	}
	.card-ch-title {
		font-size: 13.5px;
		font-weight: 600;
		color: #f0ebe3;
		margin: 2px 0 0;
		letter-spacing: 0.025em;
	}
	.card-snippet {
		margin: 6px 0 0;
		font-size: 10.5px;
		line-height: 1.65;
		color: #57534e;
	}
	.card-lore-row {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 10px;
		flex-wrap: wrap;
	}
	.card-lore-thumb {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		overflow: hidden;
		border: 1.5px solid rgba(180, 100, 30, 0.35);
		flex-shrink: 0;
		background: #0d0905;
	}
	.card-lore-label {
		font-size: 9px;
		color: rgba(120, 113, 108, 0.8);
		letter-spacing: 0.05em;
		margin-right: 4px;
	}

	/* Mystery card */
	.mystery-card {
		pointer-events: none;
		position: absolute;
		z-index: 20;
		border-radius: 0.75rem;
		padding: 10px 14px;
		border: 1px solid rgba(70, 60, 50, 0.3);
		background: rgba(20, 13, 7, 0.94);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		font-size: 11px;
		font-style: italic;
		color: #44403c;
	}
	.mystery-card p { margin: 0; }

	/* Satellite hover tooltip */
	.sat-tooltip {
		pointer-events: none;
		position: absolute;
		z-index: 22;
		border-radius: 0.6rem;
		border: 1px solid rgba(180, 100, 30, 0.22);
		background: rgba(20, 13, 7, 0.98);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55);
		overflow: hidden;
		display: flex;
		align-items: stretch;
	}
	.sat-tooltip-thumb {
		width: 54px;
		flex-shrink: 0;
		overflow: hidden;
		background: #0d0905;
	}
	.sat-tooltip-body {
		padding: 9px 11px;
		flex: 1;
		min-width: 0;
	}
	.sat-tooltip-cat {
		font-size: 8.5px;
		text-transform: uppercase;
		letter-spacing: 0.18em;
		color: rgba(251, 191, 36, 0.5);
		margin: 0;
		font-family: 'Montserrat', sans-serif;
	}
	.sat-tooltip-term {
		font-size: 13px;
		font-weight: 600;
		color: #f0ebe3;
		margin: 2px 0 0;
		line-height: 1.2;
	}
	.sat-tooltip-tagline {
		font-size: 10px;
		color: #57534e;
		margin: 4px 0 0;
		font-style: italic;
		line-height: 1.45;
	}

	/* Node pulse for visited chapters */
	@keyframes node-pulse {
		0%, 100% { opacity: 0.15; }
		50% { opacity: 0.4; }
	}
	.node-pulse {
		animation: node-pulse 4s ease-in-out infinite;
	}
	@media (prefers-reduced-motion: reduce) {
		.node-pulse { animation: none; }
	}

	/* Frontier ring gentle pulse */
	@keyframes frontier-ring {
		0%, 100% { opacity: 0.1; }
		50% { opacity: 0.35; }
	}
	.frontier-ring {
		animation: frontier-ring 3.5s ease-in-out infinite;
	}
	@media (prefers-reduced-motion: reduce) {
		.frontier-ring { animation: none; }
	}

	/* Tooltip snippet clamp */
	.tooltip-snippet {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* LoreImage thumbnails inside lore-thumb & sat-thumb need full coverage */
	:global(.card-lore-thumb img),
	:global(.card-lore-thumb .impasto),
	:global(.sat-tooltip-thumb img),
	:global(.sat-tooltip-thumb .impasto),
	:global(.card-banner img),
	:global(.card-banner .impasto) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	:global(.card-banner img) {
		object-position: center top;
		filter: brightness(0.7) saturate(0.85);
	}
	:global(.card-lore-thumb .impasto span),
	:global(.sat-thumb .impasto span) {
		font-size: 0.75rem !important;
		letter-spacing: 0.04em;
	}
</style>
