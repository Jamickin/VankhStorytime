<script>
	import { fade, scale } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import { visited } from "$lib/progress.js";
	import LoreImage from "./LoreImage.svelte";
	import CategoryChip from "./CategoryChip.svelte";
	import SealedReveal from "./SealedReveal.svelte";

	// `entry` is the lore object to show, or null when closed.
	let { entry, onclose } = $props();

	// Split reveals into what the reader has earned and what stays sealed,
	// based on how far they've read.
	let unlocked = $derived(
		entry
			? entry.reveals.filter((r) =>
					$visited.has(r.at)
				)
			: []
	);
	let sealedCount = $derived(
		entry
			? entry.reveals.length -
					unlocked.length
			: 0
	);

	function onkeydown(e) {
		if (e.key === "Escape") onclose();
	}
</script>

<svelte:window {onkeydown} />

{#if entry}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
		role="presentation"
		onclick={onclose}
		transition:fade={{ duration: 200 }}
	>
		<div
			class="relative w-full max-w-lg overflow-hidden rounded-sm bg-surface-raised frame"
			role="dialog"
			aria-modal="true"
			aria-label={entry.term}
			tabindex="-1"
			onclick={(e) =>
				e.stopPropagation()}
			in:scale={{
				start: 0.92,
				opacity: 0,
				duration: 320,
				easing: cubicOut,
			}}
		>
			<div
				class="relative h-48 w-full"
			>
				<LoreImage {entry} />
				<div
					class="absolute inset-0 bg-gradient-to-t from-surface-raised via-surface-raised/10 to-transparent"
				></div>
				<button
					class="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-stone-200 hover:bg-black/70 hover:text-white"
					onclick={onclose}
					aria-label="Close">✕</button
				>
			</div>

			<div class="px-7 pb-7 -mt-8 relative">
				<CategoryChip category={entry.category} class="mb-2" />
				<h2
					class="text-2xl font-bold tracking-wide text-stone-50"
				>
					{entry.term}
				</h2>
				{#if entry.tagline}
					<p
						class="mt-1 text-sm italic text-stone-400"
					>
						{entry.tagline}
					</p>
				{/if}

				<div
					class="mt-5 space-y-4 text-[15px] font-light leading-relaxed text-stone-300"
				>
					{#each unlocked as reveal}
						<p>{reveal.text}</p>
					{/each}

					{#if unlocked.length === 0}
						<p class="text-stone-500 italic">
							You haven't yet read far
							enough to know more of
							this.
						</p>
					{/if}

					{#if sealedCount > 0}
						<SealedReveal count={sealedCount} />
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
