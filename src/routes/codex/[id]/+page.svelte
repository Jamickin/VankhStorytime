<script>
	import { page } from "$app/stores";
	import { loreById } from "$lib/content/lore.js";
	import { visited, loreRecords, getLoreRecord } from "$lib/progress.js";
	import { chapterIndex, getChapter } from "$lib/content/chapters.js";
	import LoreImage from "$lib/components/LoreImage.svelte";
	import CategoryChip from "$lib/components/CategoryChip.svelte";
	import SealedReveal from "$lib/components/SealedReveal.svelte";

	let id = $derived($page.params.id);
	let entry = $derived(loreById.get(id) ?? null);

	// Reactively subscribe to loreRecords so the page updates when the record changes.
	let record = $derived(
		$loreRecords.find(r => r.id === id) ?? null
	);

	let unlocked = $derived(
		(() => {
			if (!entry || !record?.lastChapter) return [];
			return entry.reveals.filter(r =>
				$visited.has(r.at) &&
				chapterIndex(record.lastChapter) >= chapterIndex(r.at)
			);
		})()
	);
	let sealedCount = $derived(entry ? entry.reveals.length - unlocked.length : 0);

	let firstChapterLabel = $derived(
		record?.firstChapter ? (getChapter(record.firstChapter)?.number ?? null) : null
	);

	function revealChapterLabel(r) {
		return getChapter(r.at)?.number ?? r.at;
	}
</script>

{#if !entry}
	<div class="mx-auto max-w-2xl px-6 py-24 text-center text-stone-400">
		<p>This entry doesn't exist.</p>
		<a href="/codex" class="mt-4 inline-block text-amber-400 hover:underline">← Codex</a>
	</div>
{:else}
	<!-- Full-bleed image header -->
	<div class="w-full h-72 relative overflow-hidden">
		<div class="absolute inset-0">
			<LoreImage {entry} />
		</div>
		<!-- Gradient overlay — fades image into page background from the bottom -->
		<div class="absolute inset-0 bg-gradient-to-t from-[#14100c] via-[#14100c]/30 to-transparent"></div>
		<!-- Back button -->
		<a
			href="/codex"
			class="absolute top-5 left-5 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-4 py-1.5 text-sm text-stone-300 backdrop-blur-sm hover:border-amber-700/50 hover:text-amber-200 transition-colors"
		>
			← Codex
		</a>
	</div>

	<!-- Content -->
	<div class="max-w-2xl mx-auto px-6 -mt-20 relative pb-24">
		<CategoryChip category={entry.category} class="mb-3" />

		<h1 class="text-4xl font-bold tracking-wide text-stone-50">
			{entry.term}
		</h1>

		{#if entry.tagline}
			<p class="mt-1.5 text-base italic text-stone-400">
				{entry.tagline}
			</p>
		{/if}

		{#if firstChapterLabel}
			<p class="text-xs text-amber-500/60 mt-1">
				First noticed in Chapter {firstChapterLabel}
			</p>
		{/if}

		<!-- What Pro knows section -->
		<div class="mt-10">
			<p class="text-xs uppercase tracking-[0.3em] text-stone-500 mb-4">
				What Pro knows
			</p>

			{#if unlocked.length === 0}
				<p class="italic text-stone-500">
					Pro has not yet noticed enough to form a clear picture.
				</p>
			{:else}
				{#each unlocked as reveal}
					{#if entry.id === "pro"}
						<!-- Pro's own entry: first-person recollection style -->
						<blockquote
							class="rounded-lg border border-amber-800/40 bg-amber-950/20 p-4 mb-3"
						>
							<p class="text-xs text-amber-500/50 mb-1.5">
								Known since Chapter {revealChapterLabel(reveal)}
							</p>
							<p class="text-stone-300 text-sm leading-relaxed italic">
								<span class="text-amber-400/50 not-italic">"I remember..." </span>{reveal.text}
							</p>
						</blockquote>
					{:else}
						<div class="rounded-lg border border-stone-800 bg-stone-900/50 p-4 mb-3">
							<p class="text-amber-500/50 text-xs mb-1.5">
								Known since Chapter {revealChapterLabel(reveal)}
							</p>
							<p class="text-stone-300 text-sm leading-relaxed">
								{reveal.text}
							</p>
						</div>
					{/if}
				{/each}
			{/if}

			{#if sealedCount > 0}
				<div class="mt-4">
					<SealedReveal count={sealedCount} />
				</div>
			{/if}
		</div>

		{#if entry.id === "pro" && unlocked.length > 0}
			<!-- Pro's own awareness — reflective first-person framing -->
			<div class="mt-10">
				<p class="text-xs uppercase tracking-[0.3em] text-amber-500/60 mb-4">
					Pro's own awareness
				</p>
				<div class="border border-amber-800/30 rounded-lg bg-amber-950/10 p-5 space-y-4">
					{#each unlocked as reveal}
						<blockquote class="border-l-2 border-amber-600/40 pl-4">
							<p class="text-sm leading-relaxed text-stone-400 italic">
								{reveal.text}
							</p>
						</blockquote>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}
