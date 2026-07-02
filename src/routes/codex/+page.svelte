<script>
	import { goto } from "$app/navigation";
	import { loreById } from "$lib/content/lore.js";
	import { loreRecords } from "$lib/progress.js";
	import { getChapter } from "$lib/content/chapters.js";
	import LoreImage from "$lib/components/LoreImage.svelte";
	import CategoryChip from "$lib/components/CategoryChip.svelte";

	const categories = ["All", "Character", "Faction", "Place", "Concept"];
	let activeFilter = $state("All");

	// Build discovered entries in discovery order, merging record metadata.
	let discovered = $derived(
		$loreRecords
			.map(record => {
				const entry = loreById.get(record.id);
				if (!entry) return null;
				return { entry, record };
			})
			.filter(Boolean)
	);

	// The "pro" entry pinned separately if discovered.
	let proItem = $derived(
		discovered.find(d => d.entry.id === "pro") ?? null
	);

	// Remaining entries (excluding pro), filtered by category.
	let filtered = $derived(
		discovered
			.filter(d => d.entry.id !== "pro")
			.filter(d =>
				activeFilter === "All" || d.entry.category === activeFilter
			)
	);

	function firstChapterLabel(record) {
		if (!record?.firstChapter) return null;
		return getChapter(record.firstChapter)?.number ?? null;
	}
</script>

<section class="mx-auto max-w-4xl px-6 py-16">
	<h1 class="text-4xl font-bold tracking-wide text-amber-50">
		Codex
	</h1>
	<p class="mt-2 max-w-xl font-light text-stone-400 italic">
		What Pro knows, piece by piece. Each entry appears when first noticed;
		each truth deepens as the story unfolds.
	</p>

	<!-- Category filter pills -->
	<div class="mt-8 flex flex-wrap gap-2">
		{#each categories as cat}
			<button
				class="rounded-full border px-4 py-1 text-sm transition-colors
					{activeFilter === cat
						? 'border-amber-600/60 bg-amber-950/50 text-amber-300'
						: 'border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200'}"
				onclick={() => activeFilter = cat}
			>
				{cat}
			</button>
		{/each}
	</div>

	{#if discovered.length === 0}
		<!-- Empty state -->
		<div class="mt-20 text-center">
			<p class="text-stone-500 italic">
				Pro has not yet noticed anything worth recording. Click a glowing name
				while reading to begin.
			</p>
		</div>
	{:else}
		<!-- Pinned Pro card -->
		{#if proItem && (activeFilter === "All" || activeFilter === "Character")}
			<div class="mt-10">
				<p class="mb-3 text-xs uppercase tracking-[0.3em] text-amber-500/70">Protagonist</p>
				<button
					class="group w-full text-left rounded-lg border border-amber-700/30 bg-gradient-to-r from-amber-950/40 to-amber-900/10 p-1 transition-all hover:border-amber-600/50 hover:from-amber-900/30"
					onclick={() => goto(`/codex/${proItem.entry.id}`)}
				>
					<div class="flex gap-5 items-center p-3">
						<div class="frame h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm">
							<LoreImage entry={proItem.entry} />
						</div>
						<div>
							<span class="text-xs text-amber-500/60 uppercase tracking-[0.15em]">Pro's own record</span>
							<h2 class="mt-0.5 text-2xl font-bold tracking-wide text-stone-50 group-hover:text-amber-100">
								{proItem.entry.term}
							</h2>
							{#if proItem.entry.tagline}
								<p class="mt-0.5 text-sm italic text-stone-400">
									{proItem.entry.tagline}
								</p>
							{/if}
							{#if firstChapterLabel(proItem.record)}
								<p class="mt-1.5 text-xs text-amber-500/50">
									First noticed in Chapter {firstChapterLabel(proItem.record)}
								</p>
							{/if}
						</div>
					</div>
				</button>
			</div>
		{/if}

		<!-- Entry grid -->
		{#if filtered.length > 0}
			<div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{#each filtered as { entry, record } (entry.id)}
					<button
						class="group text-left transition-transform hover:-translate-y-1"
						onclick={() => goto(`/codex/${entry.id}`)}
					>
						<div class="frame h-40 w-full overflow-hidden rounded-sm">
							<LoreImage {entry} />
						</div>
						<div class="px-1 pt-3">
							<CategoryChip category={entry.category} class="mb-1.5" />
							<h3 class="font-semibold tracking-wide text-stone-100 group-hover:text-amber-100">
								{entry.term}
							</h3>
							{#if entry.tagline}
								<p class="mt-0.5 text-sm font-light text-stone-400 italic line-clamp-1">
									{entry.tagline}
								</p>
							{/if}
							{#if firstChapterLabel(record)}
								<p class="mt-1 text-xs text-amber-500/50">
									First noticed in Chapter {firstChapterLabel(record)}
								</p>
							{/if}
						</div>
					</button>
				{/each}
			</div>
		{:else if activeFilter !== "All"}
			<div class="mt-16 text-center">
				<p class="text-stone-500 italic">
					No {activeFilter.toLowerCase()} entries discovered yet.
				</p>
			</div>
		{/if}
	{/if}
</section>
