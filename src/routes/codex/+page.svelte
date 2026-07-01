<script>
	import { lore } from "$lib/content/lore.js";
	import LoreImage from "$lib/components/LoreImage.svelte";
	import CategoryChip from "$lib/components/CategoryChip.svelte";
	import { openLore } from "$lib/stores/lorePanel.js";

	const order = [
		"Character",
		"Faction",
		"Place",
		"Concept",
	];
	const groups = order
		.map((category) => ({
			category,
			entries: lore.filter(
				(e) =>
					e.category === category
			),
		}))
		.filter((g) => g.entries.length);
</script>

<section
	class="mx-auto max-w-4xl px-6 py-16"
>
	<h1
		class="text-4xl font-bold tracking-wide text-amber-50"
	>
		The Codex
	</h1>
	<p
		class="mt-2 max-w-xl font-light text-stone-400"
	>
		The people, powers, and places of
		VANKH — painted from the shadows. Each
		holds only what you've read far enough
		to know; the rest stays sealed.
	</p>

	{#each groups as group}
		<h2
			class="mt-12 mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-stone-500"
		>
			{group.category}
		</h2>
		<div
			class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
		>
			{#each group.entries as entry (entry.id)}
				<button
					class="group text-left transition-transform hover:-translate-y-1"
					onclick={() => openLore(entry)}
				>
					<div
						class="frame h-32 w-full overflow-hidden rounded-sm"
					>
						<LoreImage {entry} />
					</div>
					<div class="px-1 pt-3">
						<CategoryChip category={entry.category} class="mb-1.5" />
						<h3
							class="font-semibold tracking-wide text-stone-100 group-hover:text-amber-100"
						>
							{entry.term}
						</h3>
						{#if entry.tagline}
							<p
								class="mt-0.5 text-sm font-light text-stone-400 line-clamp-1"
							>
								{entry.tagline}
							</p>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	{/each}
</section>
