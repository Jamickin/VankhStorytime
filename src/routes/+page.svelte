<script>
	import { chapters } from "$lib/content/chapters.js";
	import { furthestChapter } from "$lib/progress.js";

	// Where to resume: the chapter after the furthest read (clamped).
	let resumeIdx = $derived(
		Math.min(
			$furthestChapter + 1,
			chapters.length - 1
		)
	);
</script>

<section
	class="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center"
>
	<p
		class="text-sm uppercase tracking-[0.4em] text-amber-500/80"
	>
		An interactive story
	</p>
	<h1
		class="mt-4 text-6xl font-extrabold tracking-[0.18em] text-amber-50"
	>
		VANKH
	</h1>
	<p
		class="mx-auto mt-6 max-w-xl text-lg font-light italic leading-relaxed text-stone-400"
	>
		“Everything flows, out and in;
		everything has its tides; all things
		rise and fall.”
	</p>
	<p
		class="mx-auto mt-6 max-w-xl font-light text-stone-400"
	>
		Read the story. Some words hold more
		beneath them — the people, places, and
		forces of a universe built around the
		Pulse. They don't announce themselves;
		brush a word and see if it answers.
	</p>

	{#if chapters.length}
		<a
			href={`/read/${chapters[resumeIdx].slug}`}
			class="mt-8 inline-block rounded-full bg-gradient-to-b from-amber-400 to-amber-600 px-8 py-3 font-semibold text-[#1a140e] shadow-lg shadow-amber-900/40 transition-transform hover:scale-105"
		>
			{$furthestChapter < 0
				? "Begin reading →"
				: `Continue · ${chapters[resumeIdx].number} →`}
		</a>
	{/if}
</section>

<section
	class="mx-auto max-w-3xl px-6 pb-24"
>
	<h2
		class="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-stone-500"
	>
		Chapters
	</h2>
	<div class="space-y-2">
		{#each chapters as chapter, i}
			{@const read =
				i <= $furthestChapter}
			<a
				href={`/read/${chapter.slug}`}
				class="group flex items-center gap-4 rounded-lg border px-5 py-4 transition-colors {read
					? 'border-amber-800/30 bg-amber-900/10'
					: 'border-amber-900/20 bg-amber-950/[0.06] hover:border-amber-700/40 hover:bg-amber-900/10'}"
			>
				<span
					class="font-mono text-sm text-amber-500/70"
					>{chapter.number}</span
				>
				<span
					class="text-lg font-light {read
						? 'text-amber-100/90'
						: 'text-stone-200 group-hover:text-amber-50'}"
					>{chapter.title}</span
				>

				{#if read}
					<span
						class="ml-auto flex items-center gap-1.5 text-xs text-amber-400/80"
						title="You've read this"
					>
						<span aria-hidden="true">✦</span>
						read
					</span>
				{:else if i === resumeIdx && $furthestChapter >= 0}
					<span
						class="ml-auto text-xs uppercase tracking-[0.2em] text-amber-500/70"
						>up next</span
					>
				{:else}
					<span
						class="ml-auto self-center text-stone-600 transition-transform group-hover:translate-x-1 group-hover:text-amber-400"
						>→</span
					>
				{/if}
			</a>
		{/each}
	</div>
</section>
