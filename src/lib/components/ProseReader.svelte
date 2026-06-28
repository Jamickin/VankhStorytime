<script>
	import { buildSegments } from "$lib/conceptParser.js";

	// paragraphs: string[]; lore: codex entries; onselect(id): open the modal.
	let { paragraphs, lore, onselect } =
		$props();

	let rendered = $derived(
		paragraphs.map((p) =>
			buildSegments(p, lore, {})
		)
	);
</script>

<div
	class="prose-body space-y-6 text-[1.12rem] leading-[1.9] text-stone-200/90"
>
	{#each rendered as segments}
		<p>
			{#each segments as segment}
				{#if segment.conceptId}
					<button
						type="button"
						class="lore-link"
						onclick={() =>
							onselect(
								segment.conceptId
							)}>{segment.text}</button
					>
				{:else}{segment.text}{/if}
			{/each}
		</p>
	{/each}
</div>

<style>
	.prose-body {
		font-weight: 300;
		letter-spacing: 0.01em;
	}

	/* Clickable lore reads as plain prose — no cue — until hovered. */
	.lore-link {
		display: inline;
		font: inherit;
		color: inherit;
		letter-spacing: inherit;
		cursor: pointer;
		border: 0;
		background: none;
		padding: 0;
		transition:
			color 0.2s ease,
			text-shadow 0.2s ease;
	}

	.lore-link:hover,
	.lore-link:focus-visible {
		color: #f4d59a; /* warm gilt */
		text-shadow:
			0 0 10px rgba(233, 196, 106, 0.7),
			0 0 22px rgba(201, 138, 30, 0.4);
		outline: none;
	}
</style>
