<script>
	import "../app.css";
	import { page } from "$app/stores";
	import { onNavigate } from "$app/navigation";

	let { children } = $props();

	// "Burning paper" route veil: a warm ash sheet sweeps up to cover the
	// screen, the page swaps underneath it, then it lifts away to reveal the new
	// page — led by a glowing ember edge. Reliable because it's independent of
	// page content (no overlapping text).
	const COVER = 470;
	const REVEAL = 680;
	let phase = $state("idle"); // idle | cover | reveal

	const reduce = () =>
		typeof window !== "undefined" &&
		window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

	onNavigate((navigation) => {
		if (reduce()) return;
		return new Promise((resolve) => {
			phase = "cover";
			setTimeout(async () => {
				resolve(); // let the DOM swap now — it's hidden under the veil
				await navigation.complete;
				phase = "reveal";
				setTimeout(
					() => (phase = "idle"),
					REVEAL + 80
				);
			}, COVER);
		});
	});
</script>

<div
	class="veil"
	data-phase={phase}
	aria-hidden="true"
>
	<div class="veil-sheet">
		<div class="veil-sparks"></div>
	</div>
</div>

<div class="gallery min-h-screen">
	<div
		class="embers"
		aria-hidden="true"
	></div>

	<header
		class="sticky top-0 z-30 border-b border-amber-900/20 bg-[#14100c]/80 backdrop-blur"
	>
		<div
			class="mx-auto flex max-w-3xl items-center gap-6 px-6 py-3"
		>
			<a
				href="/"
				class="font-semibold tracking-[0.3em] text-amber-100"
			>
				VANKH
			</a>
			<nav
				class="flex gap-5 text-sm text-stone-400"
			>
				<a
					href="/"
					class="hover:text-amber-100 {$page
						.url.pathname === '/'
						? 'text-amber-100'
						: ''}">Read</a
				>
				<a
					href="/codex"
					class="hover:text-amber-100 {$page.url.pathname.startsWith(
						'/codex'
					)
						? 'text-amber-100'
						: ''}">Codex</a
				>
			</nav>
		</div>
	</header>

	<main>
		{@render children()}
	</main>
</div>
