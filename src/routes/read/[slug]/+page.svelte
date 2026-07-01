<script>
	import { page } from "$app/stores";
	import { fly } from "svelte/transition";
	import { ember } from "$lib/transitions.js";
	import {
		chapters,
		getChapter,
		chapterIndex,
		paginate,
	} from "$lib/content/chapters.js";
	import {
		choicesFor,
		isPartEnd,
		isEnding,
		partOf,
		partLabel,
	} from "$lib/content/storyGraph.js";
	import { lore } from "$lib/content/lore.js";
	import { visit } from "$lib/progress.js";
	import ProseReader from "$lib/components/ProseReader.svelte";
	import ChapterCard from "$lib/components/ChapterCard.svelte";
	import { openLore } from "$lib/stores/lorePanel.js";

	let slug = $derived($page.params.slug);
	let chapter = $derived(
		getChapter(slug)
	);
	let idx = $derived(
		chapterIndex(slug)
	);
	let prev = $derived(
		idx > 0 ? chapters[idx - 1] : null
	);

	// The fork at the end of this chapter (one canon "continue" by default,
	// 2+ when authored, none at an ending), plus part-boundary framing.
	let choices = $derived(
		choicesFor(slug)
	);
	let ending = $derived(isEnding(slug));
	let partEnd = $derived(isPartEnd(slug));
	let part = $derived(partOf(slug));
	let partName = $derived(
		partLabel(part)
	);

	let pages = $derived(
		chapter
			? paginate(chapter.paragraphs)
			: [[]]
	);
	let pageNum = $state(0);
	let onLastPage = $derived(
		pageNum >= pages.length - 1
	);

	// Reaching a chapter records it on the reader's journey, which unlocks its
	// tier of lore reveals and reveals it on the home page.
	$effect(() => {
		visit(slug);
	});

	// Reset to the first page whenever the chapter changes.
	$effect(() => {
		slug;
		pageNum = 0;
	});

	function goPage(n) {
		const target = Math.max(
			0,
			Math.min(pages.length - 1, n)
		);
		if (target !== pageNum) {
			pageNum = target;
			window.scrollTo({
				top: 0,
				behavior: "smooth",
			});
		}
	}

	function onkeydown(e) {
		if (e.key === "ArrowRight")
			goPage(pageNum + 1);
		else if (e.key === "ArrowLeft")
			goPage(pageNum - 1);
		else if (e.key === "End")
			goPage(pages.length - 1);
		else if (e.key === "Home")
			goPage(0);
	}
</script>

<svelte:window {onkeydown} />

{#if !chapter}
	<div
		class="mx-auto max-w-3xl px-6 py-24 text-center text-stone-400"
	>
		<p>That chapter doesn't exist.</p>
		<a
			href="/"
			class="mt-4 inline-block text-amber-400 hover:underline"
			>← Back to the start</a
		>
	</div>
{:else}
	<article
		class="mx-auto max-w-2xl px-6 py-16"
	>
		<header class="mb-12 text-center">
			<p
				class="font-mono text-sm tracking-widest text-amber-400/70"
			>
				Chapter {chapter.number}
			</p>
			<h1
				class="mt-2 text-4xl font-bold tracking-wide text-stone-50"
			>
				{chapter.title}
			</h1>
		</header>

		<!-- Page turn: a quick, clean rise — the dramatic burn is saved for
		     chapter/route changes so reading stays snappy and never overlaps. -->
		{#key pageNum}
			<div
				in:ember={{ duration: 420 }}
			>
				<ProseReader
					paragraphs={pages[
						pageNum
					] || []}
					{lore}
					onselect={openLore}
				/>
			</div>
		{/key}

		<!-- Pager: a thin ember progress line, not a full page index -->
		<div
			class="mt-14 flex items-center gap-4 border-t border-white/10 pt-6"
		>
			<button
				class="text-sm text-stone-400 transition-colors hover:text-amber-100 disabled:cursor-default disabled:text-stone-700"
				disabled={pageNum === 0}
				onclick={() =>
					goPage(pageNum - 1)}
			>
				← Prev
			</button>

			<div
				class="relative h-px flex-1 bg-white/10"
			>
				<div
					class="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 to-amber-300 transition-[width] duration-500"
					style={`width:${((pageNum + 1) / pages.length) * 100}%`}
				></div>
			</div>

			<span
				class="font-mono text-xs text-stone-500"
				>{pageNum + 1} / {pages.length}</span
			>

			<button
				class="text-sm text-stone-400 transition-colors hover:text-amber-100 disabled:cursor-default disabled:text-stone-700"
				disabled={onLastPage}
				onclick={() =>
					goPage(pageNum + 1)}
			>
				Next →
			</button>
		</div>

		<!-- End-of-chapter hand-off, only on the last page. Driven by the story
		     graph: an ending → the Codex, a single continuation → one card, a
		     branch point → a card per choice. -->
		{#if onLastPage}
			<div
				class="mt-10"
				in:fly={{
					y: 16,
					duration: 400,
				}}
			>
				{#if ending}
					<a
						href="/codex"
						class="group flex items-center justify-between gap-4 rounded-xl border border-amber-900/30 bg-gradient-to-r from-amber-950/30 to-transparent px-6 py-5 transition-colors hover:border-amber-600/50 hover:from-amber-900/30"
					>
						<span>
							<span
								class="block text-xs uppercase tracking-[0.2em] text-amber-500/70"
								>End of Part {part}: {partName}</span
							>
							<span
								class="text-lg font-light text-stone-100 group-hover:text-amber-50"
								>Explore the Codex</span
							>
						</span>
						<span
							class="text-2xl text-amber-400 transition-transform group-hover:translate-x-1"
							>→</span
						>
					</a>
				{:else if choices.length === 1}
					{@const only = choices[0]}
					{@const target = getChapter(only.to)}
					{#if partEnd}
						<p
							class="mb-4 text-center text-xs uppercase tracking-[0.3em] text-amber-500/60"
						>
							End of Part {part}: {partName}
						</p>
					{/if}
					<ChapterCard
						choice={only}
						heading={partEnd && target ? `Begin Part ${partOf(only.to)}: ${partLabel(partOf(only.to))}` : 'Continue reading'}
						{target}
					/>
				{:else}
					{#if partEnd}
						<p
							class="mb-3 text-center text-xs uppercase tracking-[0.3em] text-amber-500/60"
						>
							End of Part {part}: {partName}
						</p>
					{/if}
					<p
						class="mb-4 text-center text-sm uppercase tracking-[0.3em] text-amber-400/80"
					>
						The path forks
					</p>
					<div class="space-y-3">
						{#each choices as choice}
							{@const target = getChapter(choice.to)}
							<ChapterCard {choice} {target} />
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Quiet jump to the previous chapter, when at the very start -->
		{#if prev && pageNum === 0}
			<p
				class="mt-6 text-center text-xs text-stone-600"
			>
				<a
					href={`/read/${prev.slug}`}
					class="hover:text-stone-300"
					>← {prev.number} · {prev.title}</a
				>
			</p>
		{/if}
	</article>

{/if}
