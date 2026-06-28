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

	// The reader's path so far. Until they've read anything, the home page shows
	// only the invitation to begin — chapters reveal themselves as they're read.
	let started = $derived(
		$journey.length > 0
	);
	let last = $derived(
		started
			? $journey[$journey.length - 1]
			: null
	);

	// Where the path leads from where they stand: the onward choices they haven't
	// taken yet (one canon "continue" by default, 2+ at a fork, none at the end).
	let frontier = $derived(
		started
			? choicesFor(last).filter(
					(c) => !$visited.has(c.to)
				)
			: []
	);

	// Resume target: begin at the start, else follow the canon edge onward.
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
		brush a word and see if it answers. The
		path is yours to walk; where it forks,
		you choose.
	</p>

	{#if resume}
		<a
			href={`/read/${resume}`}
			class="mt-8 inline-block rounded-full bg-gradient-to-b from-amber-400 to-amber-600 px-8 py-3 font-semibold text-[#1a140e] shadow-lg shadow-amber-900/40 transition-transform hover:scale-105"
		>
			{#if !started}Begin reading →{:else}Continue
				· {resumeChapter?.number} →{/if}
		</a>
	{:else}
		<a
			href="/codex"
			class="mt-8 inline-block rounded-full bg-gradient-to-b from-amber-400 to-amber-600 px-8 py-3 font-semibold text-[#1a140e] shadow-lg shadow-amber-900/40 transition-transform hover:scale-105"
		>
			Explore the Codex →
		</a>
	{/if}
</section>

<!-- The journey only appears once it's begun. Read chapters accumulate here;
     the path ahead shows the next step, or a fork to choose. -->
{#if started}
	<section
		class="mx-auto max-w-3xl px-6 pb-24"
	>
		<h2
			class="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-stone-500"
		>
			Your journey
		</h2>
		<div class="space-y-2">
			{#each $journey as slug (slug)}
				{@const c = getChapter(slug)}
				{#if c}
					<a
						href={`/read/${slug}`}
						class="group flex items-center gap-4 rounded-lg border border-amber-800/30 bg-amber-900/10 px-5 py-4 transition-colors"
					>
						<span
							class="font-mono text-sm text-amber-500/70"
							>{c.number}</span
						>
						<span
							class="text-lg font-light text-amber-100/90"
							>{c.title}</span
						>
						<span
							class="ml-auto flex items-center gap-1.5 text-xs text-amber-400/80"
							title="You've read this"
						>
							<span aria-hidden="true"
								>✦</span
							>
							read
						</span>
					</a>
				{/if}
			{/each}
		</div>

		{#if frontier.length === 1}
			{@const only = frontier[0]}
			{@const c = getChapter(only.to)}
			<a
				href={`/read/${only.to}`}
				class="group mt-2 flex items-center gap-4 rounded-lg border border-amber-900/20 bg-amber-950/[0.06] px-5 py-4 transition-colors hover:border-amber-700/40 hover:bg-amber-900/10"
			>
				{#if c}
					<span
						class="font-mono text-sm text-amber-500/70"
						>{c.number}</span
					>
				{/if}
				<span
					class="text-lg font-light text-stone-200 group-hover:text-amber-50"
					>{only.label ??
						c?.title ??
						only.to}</span
				>
				<span
					class="ml-auto text-xs uppercase tracking-[0.2em] text-amber-500/70"
					>up next</span
				>
			</a>
		{:else if frontier.length > 1}
			<p
				class="mt-6 mb-3 text-center text-sm uppercase tracking-[0.3em] text-amber-400/80"
			>
				The path ahead forks
			</p>
			<div class="space-y-2">
				{#each frontier as choice}
					{@const c = getChapter(
						choice.to
					)}
					<a
						href={`/read/${choice.to}`}
						class="group flex items-center gap-4 rounded-lg border border-amber-900/20 bg-amber-950/[0.06] px-5 py-4 transition-colors hover:border-amber-700/40 hover:bg-amber-900/10"
					>
						<span
							class="text-lg font-light text-stone-200 group-hover:text-amber-50"
							>{choice.label ??
								(c
									? `${c.number} · ${c.title}`
									: choice.to)}</span
						>
						<span
							class="ml-auto self-center text-stone-600 transition-transform group-hover:translate-x-1 group-hover:text-amber-400"
							>→</span
						>
					</a>
				{/each}
			</div>
		{:else}
			<p
				class="mt-6 text-center text-xs uppercase tracking-[0.3em] text-stone-600"
			>
				You've reached the end of the
				story — for now.
			</p>
		{/if}
	</section>
{/if}
