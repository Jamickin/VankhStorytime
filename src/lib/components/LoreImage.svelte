<script>
	import {
		categoryStyle,
		paintVars,
		initials,
	} from "$lib/ui.js";

	let {
		entry,
		class: klass = "",
	} = $props();

	let style = $derived(
		categoryStyle(entry.category)
	);

	// If an entry points at an image that isn't on disk yet, fall back to the
	// painted placeholder instead of a broken-image icon. Reset when the source
	// changes (the modal reuses one instance across entries).
	let failed = $state(false);
	$effect(() => {
		entry.image;
		failed = false;
	});
	let showImage = $derived(
		entry.image && !failed
	);
</script>

{#if showImage}
	<img
		src={entry.image}
		alt={entry.term}
		class="object-cover w-full h-full {klass}"
		onerror={() => (failed = true)}
	/>
{:else}
	<div
		class="impasto w-full h-full flex items-center justify-center {klass}"
		style={paintVars(entry.category)}
	>
		<span
			class="relative z-10 text-4xl font-extrabold tracking-[0.15em] {style.glyph}"
			style="mix-blend-mode: overlay; text-shadow: 0 2px 4px rgba(0,0,0,0.5);"
		>
			{initials(entry.term)}
		</span>
	</div>
{/if}
