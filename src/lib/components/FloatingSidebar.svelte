<script>
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { getChapter } from "$lib/content/chapters.js";
	import {
		START,
		choicesFor,
		partOf,
		partLabel,
	} from "$lib/content/storyGraph.js";
	import { visited } from "$lib/progress.js";

	let onHome = $derived($page.url.pathname === "/");
	let onCodex = $derived($page.url.pathname.startsWith("/codex"));
	let currentSlug = $derived(
		$page.url.pathname.startsWith("/read/")
			? ($page.params?.slug ?? null)
			: null
	);

	// ── Canonical spine walk + branch map ────────────────────────────────────
	const spine = [];
	const branchesOf = new Map();
	{
		let cur = START;
		const seen = new Set();
		while (cur && !seen.has(cur)) {
			seen.add(cur);
			spine.push(cur);
			const choices = choicesFor(cur);
			const nonCanon = choices.filter((c) => !c.canon);
			if (nonCanon.length) {
				branchesOf.set(
					cur,
					nonCanon.map((c) => ({
						slug: c.to,
						chapter: getChapter(c.to),
					}))
				);
			}
			const canon = choices.find((c) => c.canon) ?? choices[0];
			cur = canon?.to ?? null;
		}
	}

	// Group spine by Part for section headers.
	const spineGroups = (() => {
		const groups = [];
		let curPart = null;
		for (const slug of spine) {
			const p = partOf(slug);
			if (p !== curPart) {
				groups.push({ part: p, label: partLabel(p), slugs: [] });
				curPart = p;
			}
			groups[groups.length - 1].slugs.push(slug);
		}
		return groups;
	})();

	// ── Progress states ───────────────────────────────────────────────────────
	let frontier = $derived(() => {
		const f = new Set();
		for (const s of $visited) {
			for (const c of choicesFor(s)) {
				if (!$visited.has(c.to)) f.add(c.to);
			}
		}
		return f;
	});

	function slotStatus(slug) {
		if ($visited.has(slug)) return "visited";
		if (frontier().has(slug)) return "frontier";
		return "mystery";
	}

	// ── Interaction state ─────────────────────────────────────────────────────
	let expanded = $state(false);
	let hoveredSlug = $state(null);

	let flyoutBranches = $derived(
		hoveredSlug ? (branchesOf.get(hoveredSlug) ?? []) : []
	);

	function navigate(slug) {
		if (slotStatus(slug) === "mystery") return;
		expanded = false;
		hoveredSlug = null;
		goto("/read/" + slug);
	}
</script>

<div
	class="sidebar-root"
	onmouseenter={() => (expanded = true)}
	onmouseleave={() => {
		expanded = false;
		hoveredSlug = null;
	}}
>
	<!-- ── Main panel ──────────────────────────────────────────────────────── -->
	<aside
		class="sidebar-panel"
		style="width: {expanded ? 224 : 44}px; opacity: {expanded ? 1 : 0.45};"
	>
		<!-- Home + Codex -->
		<div class="top-nav">
			<a href="/" class="nav-item" class:active={onHome} aria-label="Read">
				<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
					<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
					<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
				</svg>
				<span class="nav-label">Read</span>
			</a>
			<a href="/codex" class="nav-item" class:active={onCodex} aria-label="Codex">
				<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10" />
					<polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
				</svg>
				<span class="nav-label">Codex</span>
			</a>
		</div>

		<div class="divider"></div>

		<!-- Chapter list -->
		<div class="chapter-list">
			{#each spineGroups as group}
				<p class="part-header">
					Part {group.part} · {group.label?.toUpperCase() ?? ""}
				</p>
				{#each group.slugs as slug}
					{@const ch = getChapter(slug)}
					{@const st = slotStatus(slug)}
					{@const isCurrent = slug === currentSlug}
					{@const hasBranch = branchesOf.has(slug)}
					{@const isHovered = hoveredSlug === slug}
					{#if ch}
						<button
							class="chapter-row st-{st}"
							class:current={isCurrent}
							class:row-lit={isHovered && hasBranch}
							onmouseenter={() => (hoveredSlug = slug)}
							onclick={() => navigate(slug)}
							disabled={st === "mystery"}
							title={st !== "mystery" ? `${ch.number} · ${ch.title}` : undefined}
						>
							<!-- Left accent bar for current chapter -->
							<span class="accent-bar" class:accent-visible={isCurrent}></span>

							<!-- Fork diamond or plain dot -->
							<span class="row-glyph" class:glyph-fork={hasBranch}>
								{#if hasBranch}◆{:else}·{/if}
							</span>

							<span class="row-num">{ch.number}</span>

							{#if st === "mystery"}
								<span class="row-sealed">· · ·</span>
							{:else}
								<span class="row-title">{ch.title}</span>
								{#if hasBranch}
									<span class="row-arrow" class:arrow-lit={isHovered}>›</span>
								{/if}
							{/if}
						</button>
					{/if}
				{/each}
			{/each}
		</div>
	</aside>

	<!-- ── Branch flyout ────────────────────────────────────────────────────── -->
	{#if expanded && flyoutBranches.length > 0}
		<div class="flyout">
			<p class="flyout-label">branches</p>
			{#each flyoutBranches as { slug, chapter }}
				{@const st = slotStatus(slug)}
				{#if chapter}
					<button
						class="branch-row st-{st}"
						class:current={slug === currentSlug}
						onclick={() => navigate(slug)}
						disabled={st === "mystery"}
						title={st !== "mystery" ? `${chapter.number} · ${chapter.title}` : undefined}
					>
						<span class="accent-bar" class:accent-visible={slug === currentSlug}></span>
						<span class="branch-num">{chapter.number}</span>
						{#if st === "mystery"}
							<span class="row-sealed">· · ·</span>
						{:else}
							<span class="branch-title">{chapter.title}</span>
						{/if}
					</button>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	/* ── Root: fixed, centred vertically ────────────────────────────────────── */
	.sidebar-root {
		position: fixed;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		z-index: 30;
		display: flex;
		flex-direction: row;
		align-items: flex-start;
	}

	/* ── Main panel ─────────────────────────────────────────────────────────── */
	.sidebar-panel {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-radius: 1.25rem;
		border: 1px solid rgba(180, 100, 30, 0.3);
		background: rgba(14, 9, 4, 0.88);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		box-shadow:
			0 0 0 0.5px rgba(120, 53, 15, 0.12) inset,
			0 20px 60px rgba(0, 0, 0, 0.55);
		transition: width 260ms cubic-bezier(0.4, 0, 0.2, 1),
		            opacity 260ms ease;
	}

	/* ── Top nav links ───────────────────────────────────────────────────────── */
	.top-nav {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 8px;
		flex-shrink: 0;
	}

	.nav-item {
		display: flex;
		align-items: center;
		border-radius: 0.75rem;
		padding: 8px;
		color: #78716c;
		text-decoration: none;
		transition: background 0.18s, color 0.18s;
		white-space: nowrap;
		overflow: hidden;
	}
	.nav-item:hover {
		background: rgba(180, 83, 9, 0.22);
		color: #fef3c7;
	}
	.nav-item.active {
		color: #fbbf24;
	}
	.nav-icon {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}
	.nav-label {
		font-size: 13px;
		font-weight: 500;
		font-family: 'Montserrat', sans-serif;
		padding-left: 10px;
		letter-spacing: 0.02em;
	}

	.divider {
		margin: 0 8px;
		border-top: 1px solid rgba(180, 100, 30, 0.18);
		flex-shrink: 0;
	}

	/* ── Chapter list ────────────────────────────────────────────────────────── */
	.chapter-list {
		overflow-y: auto;
		overflow-x: hidden;
		max-height: calc(100vh - 11rem);
		padding: 4px 6px 10px;
		scrollbar-width: thin;
		scrollbar-color: rgba(180, 100, 30, 0.2) transparent;
	}
	.chapter-list::-webkit-scrollbar { width: 3px; }
	.chapter-list::-webkit-scrollbar-track { background: transparent; }
	.chapter-list::-webkit-scrollbar-thumb {
		background: rgba(180, 100, 30, 0.2);
		border-radius: 2px;
	}

	.part-header {
		font-family: 'Montserrat', sans-serif;
		font-size: 7.5px;
		font-weight: 700;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: rgba(214, 163, 72, 0.55);
		padding: 12px 6px 3px 6px;
		white-space: nowrap;
		overflow: hidden;
		margin: 0;
	}

	/* ── Chapter rows ────────────────────────────────────────────────────────── */
	.chapter-row {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		border-radius: 0.5rem;
		padding: 4px 6px 4px 2px;
		cursor: pointer;
		transition: background 0.14s;
		white-space: nowrap;
		overflow: hidden;
		min-height: 26px;
	}
	.chapter-row:disabled { cursor: default; }

	/* Visited */
	.chapter-row.st-visited { }
	.chapter-row.st-visited .row-num,
	.chapter-row.st-visited .row-title { color: #d97706; }
	.chapter-row.st-visited:hover:not(:disabled) {
		background: rgba(180, 83, 9, 0.28);
	}
	.chapter-row.st-visited:hover .row-num,
	.chapter-row.st-visited:hover .row-title { color: #fde68a; }

	/* Frontier */
	.chapter-row.st-frontier .row-num,
	.chapter-row.st-frontier .row-title { color: #78716c; }
	.chapter-row.st-frontier:hover:not(:disabled) {
		background: rgba(120, 83, 9, 0.18);
	}
	.chapter-row.st-frontier:hover .row-num,
	.chapter-row.st-frontier:hover .row-title { color: #d6d3d1; }

	/* Mystery */
	.chapter-row.st-mystery .row-num,
	.chapter-row.st-mystery .row-sealed { color: rgba(68, 64, 60, 0.5); }

	/* Current chapter */
	.chapter-row.current {
		background: rgba(120, 53, 15, 0.32) !important;
	}
	.chapter-row.current .row-num,
	.chapter-row.current .row-title { color: #fbbf24 !important; font-weight: 600; }

	/* Left accent bar */
	.accent-bar {
		position: absolute;
		left: 0;
		top: 20%;
		bottom: 20%;
		width: 2px;
		border-radius: 1px;
		background: #fbbf24;
		opacity: 0;
		transition: opacity 0.18s;
		flex-shrink: 0;
	}
	.accent-visible { opacity: 1; }

	/* Row inner elements */
	.row-glyph {
		font-size: 9px;
		color: rgba(120, 83, 9, 0.4);
		width: 16px;
		text-align: center;
		flex-shrink: 0;
		line-height: 1;
		transition: color 0.14s;
	}
	.row-glyph.glyph-fork {
		font-size: 6.5px;
		color: rgba(214, 163, 72, 0.5);
	}
	.chapter-row:hover .row-glyph.glyph-fork {
		color: rgba(251, 191, 36, 0.8);
	}

	.row-num {
		font-family: 'Montserrat', monospace;
		font-size: 8px;
		letter-spacing: 0.08em;
		flex-shrink: 0;
		padding-right: 5px;
		min-width: 26px;
		transition: color 0.14s;
	}
	.row-title {
		font-family: 'Montserrat', sans-serif;
		font-size: 11.5px;
		font-weight: 400;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1;
		transition: color 0.14s;
	}
	.row-sealed {
		font-size: 8.5px;
		letter-spacing: 0.2em;
	}
	.row-arrow {
		font-size: 13px;
		color: rgba(214, 163, 72, 0.4);
		padding-left: 4px;
		flex-shrink: 0;
		line-height: 1;
		transition: color 0.14s, transform 0.14s;
	}
	.row-arrow.arrow-lit {
		color: #fbbf24;
		transform: translateX(2px);
	}

	/* ── Branch flyout ───────────────────────────────────────────────────────── */
	.flyout {
		margin-left: 8px;
		display: flex;
		flex-direction: column;
		border-radius: 1.1rem;
		border: 1px solid rgba(180, 100, 30, 0.35);
		background: rgba(11, 7, 3, 0.96);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		box-shadow:
			0 16px 48px rgba(0, 0, 0, 0.7),
			0 0 0 0.5px rgba(180, 100, 30, 0.12) inset;
		padding: 6px;
		min-width: 164px;
		animation: flyout-in 0.18s cubic-bezier(0.2, 0, 0, 1) both;
	}
	@keyframes flyout-in {
		from { opacity: 0; transform: translateX(-10px) scale(0.97); }
		to   { opacity: 1; transform: translateX(0)    scale(1); }
	}

	.flyout-label {
		font-family: 'Montserrat', sans-serif;
		font-size: 7.5px;
		font-weight: 700;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: rgba(214, 163, 72, 0.5);
		padding: 5px 8px 7px;
		margin: 0;
	}

	.branch-row {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		border-radius: 0.5rem;
		padding: 5px 8px 5px 6px;
		cursor: pointer;
		transition: background 0.14s;
		white-space: nowrap;
		overflow: hidden;
	}
	.branch-row:disabled { cursor: default; }

	.branch-row.st-visited .branch-num,
	.branch-row.st-visited .branch-title { color: #d97706; }
	.branch-row.st-visited:hover:not(:disabled) {
		background: rgba(180, 83, 9, 0.28);
	}
	.branch-row.st-visited:hover .branch-num,
	.branch-row.st-visited:hover .branch-title { color: #fde68a; }

	.branch-row.st-frontier .branch-num,
	.branch-row.st-frontier .branch-title { color: #78716c; }
	.branch-row.st-frontier:hover:not(:disabled) {
		background: rgba(120, 83, 9, 0.18);
	}
	.branch-row.st-frontier:hover .branch-num,
	.branch-row.st-frontier:hover .branch-title { color: #d6d3d1; }

	.branch-row.st-mystery .branch-num,
	.branch-row.st-mystery .row-sealed { color: rgba(68, 64, 60, 0.5); }

	.branch-row.current {
		background: rgba(120, 53, 15, 0.32) !important;
	}
	.branch-row.current .branch-num,
	.branch-row.current .branch-title { color: #fbbf24 !important; font-weight: 600; }

	.branch-num {
		font-family: 'Montserrat', monospace;
		font-size: 8px;
		letter-spacing: 0.08em;
		flex-shrink: 0;
		padding-right: 6px;
		min-width: 30px;
		color: inherit;
		transition: color 0.14s;
	}
	.branch-title {
		font-family: 'Montserrat', sans-serif;
		font-size: 11.5px;
		font-weight: 400;
		overflow: hidden;
		text-overflow: ellipsis;
		color: inherit;
		transition: color 0.14s;
	}

	/* ── Active press feedback ───────────────────────────────────────────────── */
	.chapter-row:active:not(:disabled),
	.branch-row:active:not(:disabled) {
		transform: scale(0.98);
		transition: transform 0.08s;
	}
</style>
