<script>
	import { getChapter } from "$lib/content/chapters.js";
	import {
		START,
		choicesFor,
	} from "$lib/content/storyGraph.js";
	import {
		journey,
		visited,
	} from "$lib/progress.js";
	import StoryTimeline from "$lib/components/StoryTimeline.svelte";

	let started = $derived($journey.length > 0);
	let last = $derived(
		started
			? $journey[$journey.length - 1]
			: null
	);

	// The next unread chapter(s) from where the reader stands.
	let frontier = $derived(
		started
			? choicesFor(last).filter(
					(c) => !$visited.has(c.to)
				)
			: []
	);

	// Resume target: start, or the canon onward edge from the last visited chapter.
	let resume = $derived(
		!started
			? START
			: ((
					frontier.find(
						(c) => c.canon
					) ?? frontier[0]
				)?.to ?? null)
	);
	let resumeChapter = $derived(
		resume ? getChapter(resume) : null
	);
</script>

<!-- Hero -->
<section
	class="mx-auto max-w-3xl px-6 pt-20 pb-10 text-center"
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
		"Everything flows, out and in; everything
		has its tides; all things rise and fall."
	</p>
	<p
		class="mx-auto mt-5 max-w-xl font-light text-stone-400"
	>
		Read the story. Named things glow when you
		hover — brush a word and see if it answers.
		Where the path forks, you choose.
	</p>

	{#if resume}
		<a
			href={`/read/${resume}`}
			class="mt-8 inline-block rounded-full bg-gradient-to-b from-amber-400 to-amber-600 px-8 py-3 font-semibold text-surface-raised shadow-lg shadow-amber-900/40 transition-transform hover:scale-105"
		>
			{#if !started}Begin reading →{:else}Continue
				· {resumeChapter?.number} →{/if}
		</a>
	{/if}
</section>

<!-- Story timeline -->
<section class="mx-auto max-w-2xl px-6 pb-24">
	<h2
		class="mb-8 text-center text-xs font-semibold uppercase tracking-[0.35em] text-stone-600"
	>
		The Story
	</h2>
	<StoryTimeline />
</section>
