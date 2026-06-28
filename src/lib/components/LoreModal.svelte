<script>
	import { fade, scale } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import { categoryStyle } from "$lib/ui.js";
	import { chapterIndex } from "$lib/content/chapters.js";
	import { furthestChapter } from "$lib/progress.js";
	import LoreImage from "./LoreImage.svelte";

	// `entry` is the lore object to show, or null when closed.
	let { entry, onclose } = $props();

	let style = $derived(
		entry
			? categoryStyle(entry.category)
			: null
	);

	// Split reveals into what the reader has earned and what stays sealed,
	// based on how far they've read.
	let unlocked = $derived(
		entry
			? entry.reveals.filter(
					(r) =>
						chapterIndex(r.at) <=
						$furthestChapter
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
			class="relative w-full max-w-lg overflow-hidden rounded-sm bg-[#1a140e] frame"
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
					class="absolute inset-0 bg-gradient-to-t from-[#1a140e] via-[#1a140e]/10 to-transparent"
				></div>
				<button
					class="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-stone-200 hover:bg-black/70 hover:text-white"
					onclick={onclose}
					aria-label="Close">✕</button
				>
			</div>

			<div class="px-7 pb-7 -mt-8 relative">
				<span
					class="inline-block mb-2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] ring-1 {style.chip}"
				>
					{entry.category}
				</span>
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
						<div
							class="mt-2 flex items-center gap-2 rounded-md border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-sm text-amber-200/70"
						>
							<span aria-hidden="true"
								>🔒</span
							>
							<span
								>{sealedCount} more {sealedCount ===
								1
									? "truth lies"
									: "truths lie"} sealed here — read on to uncover {sealedCount ===
								1
									? "it"
									: "them"}.</span
							>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
