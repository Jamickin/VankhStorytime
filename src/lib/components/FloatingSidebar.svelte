<script>
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { recentLore } from "$lib/stores/lorePanel.js";
	import { loreById } from "$lib/content/lore.js";
	import LoreImage from "$lib/components/LoreImage.svelte";
	import { journey, visited } from "$lib/progress.js";
	import {
		chapters,
		getChapter,
	} from "$lib/content/chapters.js";
	import {
		START,
		choicesFor,
		canonNext,
		isBranchPoint,
		frontierOf,
	} from "$lib/content/storyGraph.js";

	// ── Page state ────────────────────────────────────────────────────────────
	let onHome = $derived($page.url.pathname === "/");
	let onCodex = $derived(
		$page.url.pathname.startsWith("/codex")
	);
	let currentSlug = $derived(() => {
		const m = $page.url.pathname.match(
			/^\/read\/(.+)$/
		);
		return m ? m[1] : null;
	});

	// ── Active drawer ─────────────────────────────────────────────────────────
	// 'home' | 'chapters' | 'codex' | 'read' | null
	let activeDrawer = $state(null);
	let closeTimer = $state(null);

	function openDrawer(id) {
		if (closeTimer !== null) {
			clearTimeout(closeTimer);
			closeTimer = null;
		}
		activeDrawer = id;
	}

	function scheduleClose() {
		closeTimer = setTimeout(() => {
			activeDrawer = null;
			closeTimer = null;
		}, 120);
	}

	function cancelClose() {
		if (closeTimer !== null) {
			clearTimeout(closeTimer);
			closeTimer = null;
		}
	}

	// ── Codex: recently-opened lore ───────────────────────────────────────────
	let recentLoreEntries = $derived(() => {
		const ids = [...$recentLore].reverse().slice(0, 3);
		return ids.map((id) => loreById.get(id)).filter(Boolean);
	});

	// ── Chapters drawer ───────────────────────────────────────────────────────
	// Reconstruct the parts / node list from the story graph (same as StoryTimeline)
	const nodeList = (() => {
		const list = [];
		let cur = START;
		const done = new Set();
		while (cur && !done.has(cur)) {
			done.add(cur);
			const choices = choicesFor(cur);
			const nonCanon = choices.filter((c) => !c.canon);
			const canon =
				choices.find((c) => c.canon) ?? choices[0];
			list.push({
				slug: cur,
				isBranch: false,
				choices: nonCanon,
			});
			nonCanon.forEach((ch) => {
				list.push({
					slug: ch.to,
					isBranch: true,
					choices: [],
					label: ch.label,
				});
			});
			if (!canon) break;
			cur = canon.to;
		}
		return list;
	})();

	// Frontier: immediate successors of visited chapters (shared with StoryTimeline)
	let frontier = $derived(() => frontierOf($visited));

	// ── Read drawer: chapter context ──────────────────────────────────────────
	let currentChapter = $derived(() => {
		const slug = currentSlug();
		return slug ? getChapter(slug) : null;
	});

	let prevChapter = $derived(() => {
		const j = $journey;
		if (j.length < 2) return null;
		const slug = currentSlug();
		if (!slug) return null;
		const idx = j.indexOf(slug);
		if (idx <= 0) return getChapter(j[j.length - 1]);
		return getChapter(j[idx - 1]);
	});

	let frontierChapter = $derived(() => {
		const f = frontier();
		if (f.size === 0) return null;
		const slug = [...f][0];
		return getChapter(slug);
	});

	// ── Resume button text ────────────────────────────────────────────────────
	let resumeSlug = $derived(() => {
		const f = frontier();
		if (f.size > 0) return [...f][0];
		if (chapters.length > 0) return chapters[0].slug;
		return null;
	});
	let resumeChapter = $derived(() => {
		const slug = resumeSlug();
		return slug ? getChapter(slug) : null;
	});
	let resumeLabel = $derived(() => {
		const ch = resumeChapter();
		if (!ch) return "Begin reading →";
		const isFirstEver = $journey.length === 0;
		return isFirstEver
			? "Begin reading →"
			: `Resume · Chapter ${ch.number} →`;
	});
</script>

<!--
  Icon rail — always 48px wide.
  A transparent bridge div to the right of the rail keeps the mouse path
  between icon and drawer alive (prevents the drawer from closing mid-travel).
-->
<aside
	class="sidebar-region"
	onmouseleave={scheduleClose}
	role="navigation"
	aria-label="Navigation sidebar"
>
	<!-- Icon rail -->
	<div class="rail" onmouseenter={cancelClose}>
		<!-- Home -->
		<button
			class="rail-btn {activeDrawer === 'home' ? 'active' : ''} {onHome ? 'current' : ''}"
			onmouseenter={() => openDrawer("home")}
			onfocus={() => openDrawer("home")}
			aria-label="Home"
			aria-expanded={activeDrawer === "home"}
		>
			<!-- Book / open pages icon -->
			<svg
				class="rail-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
				<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
			</svg>
		</button>

		<!-- Chapters -->
		<button
			class="rail-btn {activeDrawer === 'chapters' ? 'active' : ''}"
			onmouseenter={() => openDrawer("chapters")}
			onfocus={() => openDrawer("chapters")}
			aria-label="Chapters"
			aria-expanded={activeDrawer === "chapters"}
		>
			<!-- Vertical list / menu icon -->
			<svg
				class="rail-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<line x1="8" y1="6" x2="21" y2="6" />
				<line x1="8" y1="12" x2="21" y2="12" />
				<line x1="8" y1="18" x2="21" y2="18" />
				<circle cx="3" cy="6" r="1.2" fill="currentColor" stroke="none" />
				<circle cx="3" cy="12" r="1.2" fill="currentColor" stroke="none" />
				<circle cx="3" cy="18" r="1.2" fill="currentColor" stroke="none" />
			</svg>
		</button>

		<!-- Codex -->
		<button
			class="rail-btn {activeDrawer === 'codex' ? 'active' : ''} {onCodex ? 'current' : ''}"
			onmouseenter={() => openDrawer("codex")}
			onfocus={() => openDrawer("codex")}
			onclick={() => { activeDrawer = null; goto('/codex'); }}
			aria-label="Codex"
			aria-expanded={activeDrawer === "codex"}
		>
			<!-- Compass icon -->
			<svg
				class="rail-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<circle cx="12" cy="12" r="10" />
				<polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
			</svg>
		</button>

		<!-- Bookmark — always visible; shows pickup point; click goes home -->
		<button
			class="rail-btn {activeDrawer === 'read' ? 'active' : ''} {currentSlug() ? 'current' : ''}"
			onmouseenter={() => openDrawer("read")}
			onfocus={() => openDrawer("read")}
			onclick={() => { activeDrawer = null; goto('/'); }}
			aria-label="Home"
			aria-expanded={activeDrawer === "read"}
		>
			<!-- Bookmark icon -->
			<svg
				class="rail-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
			</svg>
		</button>
	</div>

	<!-- Drawers — rendered to the right of the rail -->
	<!-- HOME drawer -->
	<div
		class="drawer {activeDrawer === 'home' ? 'drawer-open' : ''}"
		onmouseenter={cancelClose}
		role="region"
		aria-label="Home drawer"
	>
		<p class="drawer-wordmark">VANKH</p>
		<p class="drawer-quote">
			"Everything flows, out and in…"
		</p>
		{#if resumeSlug()}
			<a
				class="drawer-cta"
				href="/read/{resumeSlug()}"
				onclick={() => { activeDrawer = null; }}
			>
				{resumeLabel()}
			</a>
		{:else}
			<a
				class="drawer-cta"
				href="/"
				onclick={() => { activeDrawer = null; }}
			>
				Begin reading →
			</a>
		{/if}
	</div>

	<!-- CHAPTERS drawer -->
	<div
		class="drawer drawer-chapters {activeDrawer === 'chapters' ? 'drawer-open' : ''}"
		onmouseenter={cancelClose}
		role="region"
		aria-label="Chapters drawer"
	>
		<p class="drawer-section-label">Chapters</p>
		<nav class="chapters-list">
			{#each nodeList as node}
				{@const ch = getChapter(node.slug)}
				{@const vis = $visited.has(node.slug)}
				{@const inFrontier = frontier().has(node.slug)}
				{@const isFork = isBranchPoint(node.slug)}
				{#if ch}
					<div class="chapter-entry {node.isBranch ? 'chapter-branch' : ''}">
						<!-- Fork diamond indicator -->
						{#if isFork}
							<span class="fork-diamond" aria-hidden="true">◇</span>
						{/if}
						<a
							href={vis || inFrontier ? `/read/${node.slug}` : undefined}
							class="chapter-link
								{vis ? 'ch-visited' : inFrontier ? 'ch-frontier' : 'ch-mystery'}
								{node.isBranch ? 'ch-indented' : ''}"
							onclick={(e) => {
								if (!vis && !inFrontier) { e.preventDefault(); return; }
								activeDrawer = null;
							}}
							aria-label="Chapter {ch.number}: {vis || inFrontier ? ch.title : '???'}"
						>
							<span class="ch-num">{ch.number}</span>
							<span class="ch-title">
								{#if vis || inFrontier}
									{ch.title}
								{:else}
									<span class="ch-mystery-dots">· · ·</span>
								{/if}
							</span>
							{#if vis}
								<span class="ch-read-badge">✦</span>
							{/if}
						</a>
					</div>
				{/if}
			{/each}
		</nav>
		<a class="drawer-link-btn" href="/" onclick={() => { activeDrawer = null; }}>
			← Home
		</a>
	</div>

	<!-- CODEX drawer -->
	<div
		class="drawer {activeDrawer === 'codex' ? 'drawer-open' : ''}"
		onmouseenter={cancelClose}
		role="region"
		aria-label="Codex drawer"
	>
		<p class="drawer-section-label">The Codex</p>
		{#if recentLoreEntries().length > 0}
			<p class="drawer-sub-label">Recently discovered</p>
			<div class="codex-entries">
				{#each recentLoreEntries() as entry (entry.id)}
					<button
						class="codex-entry-row"
						onclick={() => {
							import("$lib/stores/lorePanel.js").then(({ openLore }) => openLore(entry));
							activeDrawer = null;
						}}
					>
						<div class="codex-thumb">
							<LoreImage {entry} />
						</div>
						<div class="codex-entry-info">
							<span class="codex-entry-term">{entry.term}</span>
							<span class="codex-entry-cat">{entry.category}</span>
						</div>
					</button>
				{/each}
			</div>
		{:else}
			<p class="drawer-hint">Discover lore as you read.</p>
		{/if}
		<a
			class="drawer-link-btn"
			href="/codex"
			onclick={() => { activeDrawer = null; }}
		>
			Browse all →
		</a>
	</div>

	<!-- READ drawer — always rendered; adapts to context -->
	<div
		class="drawer {activeDrawer === 'read' ? 'drawer-open' : ''}"
		onmouseenter={cancelClose}
		role="region"
		aria-label="Reading progress drawer"
	>
		{#if currentSlug()}
			<p class="drawer-section-label">Currently reading</p>
			{#if currentChapter()}
				<div class="read-current">
					<span class="read-ch-num">Chapter {currentChapter()?.number}</span>
					<span class="read-ch-title">{currentChapter()?.title}</span>
				</div>
			{/if}
			{#if prevChapter()}
				<a
					class="read-nav-link"
					href="/read/{prevChapter()?.slug}"
					onclick={() => { activeDrawer = null; }}
				>
					↑ Last: {prevChapter()?.number}
				</a>
			{/if}
			{#if frontierChapter() && frontierChapter()?.slug !== currentSlug()}
				<a
					class="read-nav-link read-next"
					href="/read/{frontierChapter()?.slug}"
					onclick={() => { activeDrawer = null; }}
				>
					Next → {frontierChapter()?.number}
				</a>
			{/if}
		{:else if resumeSlug()}
			<p class="drawer-section-label">Pick up where you left off</p>
			{#if resumeChapter()}
				<div class="read-current">
					<span class="read-ch-num">Chapter {resumeChapter()?.number}</span>
					<span class="read-ch-title">{resumeChapter()?.title}</span>
				</div>
			{/if}
			<a
				class="read-nav-link read-next"
				href="/read/{resumeSlug()}"
				onclick={() => { activeDrawer = null; }}
			>
				{$journey.length === 0 ? 'Begin reading →' : 'Continue →'}
			</a>
		{:else}
			<p class="drawer-section-label">Your journey</p>
			<p class="drawer-hint">Start reading to track your progress.</p>
		{/if}
		<a class="drawer-link-btn" href="/" onclick={() => { activeDrawer = null; }}>
			← Home
		</a>
	</div>
</aside>

<style>
	/* Sidebar region: wraps the rail + drawers; keeps hover area contiguous */
	.sidebar-region {
		position: fixed;
		left: 12px;
		top: 140px;
		z-index: 30;
		display: flex;
		align-items: flex-start;
	}
	@media (max-width: 767px) {
		.sidebar-region {
			top: 72px;
		}
	}

	/* ── Icon rail ── */
	.rail {
		display: flex;
		flex-direction: column;
		gap: 2px;
		border-radius: 16px;
		border: 1px solid rgba(180, 100, 30, 0.18);
		background: rgba(26, 17, 8, 0.72);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		padding: 8px;
		width: 48px;
		flex-shrink: 0;
		opacity: 0.55;
		transition: opacity 0.25s;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
	}
	.sidebar-region:hover .rail,
	.sidebar-region:focus-within .rail {
		opacity: 1;
	}

	.rail-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 10px;
		border: none;
		background: transparent;
		color: rgba(120, 100, 80, 0.7);
		cursor: pointer;
		transition: background 0.18s, color 0.18s, box-shadow 0.18s;
		flex-shrink: 0;
	}
	.rail-btn:hover,
	.rail-btn.active {
		background: rgba(180, 83, 9, 0.2);
		color: #fbbf24;
		box-shadow: 0 0 10px rgba(251, 191, 36, 0.15);
	}
	.rail-btn.current {
		color: #f59e0b;
	}
	.rail-icon {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	/* ── Drawer ── */
	.drawer {
		position: absolute;
		left: calc(48px + 16px + 4px); /* rail + gap */
		top: 0;
		min-width: 200px;
		max-width: 260px;
		border-radius: 14px;
		border: 1px solid rgba(180, 100, 30, 0.2);
		background: rgba(20, 13, 7, 0.96);
		backdrop-filter: blur(18px);
		-webkit-backdrop-filter: blur(18px);
		box-shadow:
			0 12px 44px rgba(0, 0, 0, 0.6),
			inset 0 0 0 1px rgba(255, 180, 80, 0.04);
		padding: 14px 16px;
		pointer-events: none;
		opacity: 0;
		transform: translateX(-8px);
		transition:
			opacity 220ms cubic-bezier(0.2, 0, 0, 1),
			transform 220ms cubic-bezier(0.2, 0, 0, 1);
	}
	.drawer.drawer-open {
		opacity: 1;
		transform: translateX(0);
		pointer-events: auto;
	}

	/* Bridge hover area: keeps the cursor path from rail → drawer active.
	   We rely on the sidebar-region encompassing both rail + drawer space via
	   a transparent pseudo-element between them. */
	.drawer::before {
		content: "";
		position: absolute;
		right: 100%;
		top: 0;
		bottom: 0;
		width: 20px; /* covers the gap between rail and drawer */
		background: transparent;
	}

	/* Chapters drawer: flex column so label + home link stay fixed while list scrolls */
	.drawer-chapters {
		max-height: min(80vh, 520px);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	.drawer-chapters::-webkit-scrollbar {
		width: 4px;
	}
	.drawer-chapters::-webkit-scrollbar-track {
		background: transparent;
	}
	.drawer-chapters::-webkit-scrollbar-thumb {
		background: rgba(180, 100, 30, 0.3);
		border-radius: 2px;
	}

	/* ── Drawer typography ── */
	.drawer-wordmark {
		font-size: 18px;
		font-weight: 800;
		letter-spacing: 0.22em;
		color: #d99f56;
		margin: 0 0 4px;
		font-family: 'Montserrat', sans-serif;
	}
	.drawer-quote {
		font-size: 11px;
		font-style: italic;
		color: rgba(120, 110, 90, 0.8);
		margin: 0 0 14px;
		line-height: 1.5;
	}
	.drawer-cta {
		display: block;
		padding: 8px 12px;
		border-radius: 8px;
		background: rgba(180, 83, 9, 0.2);
		border: 1px solid rgba(180, 83, 9, 0.35);
		color: #fbbf24;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-decoration: none;
		text-align: center;
		transition: background 0.18s, border-color 0.18s;
	}
	.drawer-cta:hover {
		background: rgba(180, 83, 9, 0.35);
		border-color: rgba(180, 83, 9, 0.55);
	}
	.drawer-section-label {
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: rgba(251, 191, 36, 0.45);
		margin: 0 0 10px;
	}
	.drawer-sub-label {
		font-size: 9px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgba(100, 90, 70, 0.6);
		margin: 0 0 8px;
	}
	.drawer-hint {
		font-size: 11px;
		font-style: italic;
		color: rgba(100, 90, 70, 0.7);
		margin: 0 0 12px;
	}
	.drawer-link-btn {
		display: block;
		margin-top: 12px;
		font-size: 11px;
		font-weight: 600;
		color: rgba(251, 191, 36, 0.6);
		text-decoration: none;
		letter-spacing: 0.05em;
		transition: color 0.18s;
	}
	.drawer-link-btn:hover {
		color: #fbbf24;
	}

	/* ── Chapters list ── */
	.chapters-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
		overflow-y: auto;
		overflow-x: hidden;
		flex: 1;
		min-height: 0;
	}
	.chapters-list::-webkit-scrollbar {
		width: 4px;
	}
	.chapters-list::-webkit-scrollbar-track {
		background: transparent;
	}
	.chapters-list::-webkit-scrollbar-thumb {
		background: rgba(180, 100, 30, 0.3);
		border-radius: 2px;
	}
	.chapter-entry {
		position: relative;
	}
	.chapter-link {
		display: flex;
		align-items: baseline;
		gap: 7px;
		padding: 5px 6px;
		border-radius: 7px;
		text-decoration: none;
		transition: background 0.15s;
		line-height: 1.35;
	}
	.chapter-link:hover {
		background: rgba(180, 83, 9, 0.14);
	}
	.ch-indented {
		padding-left: 14px;
	}
	.ch-num {
		font-size: 9.5px;
		font-family: 'Montserrat', sans-serif;
		font-weight: 700;
		letter-spacing: 0.1em;
		flex-shrink: 0;
	}
	.ch-title {
		font-size: 11px;
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.ch-read-badge {
		font-size: 9px;
		color: rgba(252, 211, 77, 0.55);
		flex-shrink: 0;
	}
	.ch-visited .ch-num { color: #fcd34d; }
	.ch-visited .ch-title { color: rgba(240, 235, 227, 0.85); }
	.ch-frontier .ch-num { color: rgba(251, 191, 36, 0.6); }
	.ch-frontier .ch-title { color: rgba(160, 150, 130, 0.8); }
	.ch-mystery .ch-num { color: rgba(74, 64, 53, 0.5); }
	.ch-mystery .ch-title { color: rgba(74, 64, 53, 0.5); }
	.ch-mystery-dots { letter-spacing: 0.15em; }
	.fork-diamond {
		position: absolute;
		left: -10px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 9px;
		color: rgba(251, 191, 36, 0.3);
	}

	/* ── Codex entries ── */
	.codex-entries {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-bottom: 4px;
	}
	.codex-entry-row {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 5px 6px;
		border-radius: 8px;
		border: none;
		background: transparent;
		cursor: pointer;
		text-align: left;
		transition: background 0.15s;
		width: 100%;
	}
	.codex-entry-row:hover {
		background: rgba(180, 83, 9, 0.14);
	}
	.codex-thumb {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		overflow: hidden;
		border: 1.5px solid rgba(180, 100, 30, 0.4);
		flex-shrink: 0;
		background: #0d0905;
	}
	.codex-entry-info {
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}
	.codex-entry-term {
		font-size: 12px;
		font-weight: 600;
		color: rgba(240, 235, 227, 0.88);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.codex-entry-cat {
		font-size: 9px;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: rgba(251, 191, 36, 0.4);
	}
	/* Ensure LoreImage fills the circular thumb */
	:global(.codex-thumb img),
	:global(.codex-thumb .impasto) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	:global(.codex-thumb .impasto span) {
		font-size: 0.5rem !important;
	}

	/* ── Read drawer ── */
	.read-current {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-bottom: 12px;
	}
	.read-ch-num {
		font-size: 9px;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: rgba(251, 191, 36, 0.45);
	}
	.read-ch-title {
		font-size: 13px;
		font-weight: 600;
		color: rgba(240, 235, 227, 0.9);
		line-height: 1.3;
	}
	.read-nav-link {
		display: block;
		font-size: 11px;
		color: rgba(180, 160, 120, 0.7);
		text-decoration: none;
		padding: 4px 0;
		transition: color 0.15s;
		letter-spacing: 0.03em;
	}
	.read-nav-link:hover {
		color: #fbbf24;
	}
	.read-next {
		color: rgba(251, 191, 36, 0.6);
		margin-top: 4px;
	}
	.read-next:hover {
		color: #fbbf24;
	}
</style>
