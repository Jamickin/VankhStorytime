<script>
	import { page } from "$app/stores";

	let onHome = $derived($page.url.pathname === "/");
	let onCodex = $derived($page.url.pathname.startsWith("/codex"));
</script>

<aside
	class="fixed left-3 top-3 z-30 flex flex-col gap-0.5 rounded-2xl border border-amber-900/20 bg-surface-overlay/70 p-2 opacity-100 backdrop-blur-md transition-opacity duration-300 md:top-1/2 md:-translate-y-1/2 md:opacity-50 md:hover:opacity-100"
>
	<!-- Read / Home -->
	<a
		href="/"
		class="group flex items-center rounded-xl px-2.5 py-2.5 transition-all duration-200 hover:bg-amber-900/20 {onHome ? 'text-amber-400' : 'text-stone-500 hover:text-amber-100'}"
		aria-label="Read"
	>
		<!-- Book / open pages icon -->
		<svg
			class="h-[18px] w-[18px] flex-shrink-0"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.6"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
			<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
		</svg>
		<span
			class="hidden max-w-0 overflow-hidden whitespace-nowrap text-[13px] font-medium opacity-0 transition-all duration-200 md:inline-block group-hover:max-w-[72px] group-hover:pl-2 group-hover:opacity-100"
		>Read</span>
	</a>

	<!-- Codex -->
	<a
		href="/codex"
		class="group flex items-center rounded-xl px-2.5 py-2.5 transition-all duration-200 hover:bg-amber-900/20 {onCodex ? 'text-amber-400' : 'text-stone-500 hover:text-amber-100'}"
		aria-label="Codex"
	>
		<!-- Compass / grid icon -->
		<svg
			class="h-[18px] w-[18px] flex-shrink-0"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.6"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="12" cy="12" r="10" />
			<polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
		</svg>
		<span
			class="hidden max-w-0 overflow-hidden whitespace-nowrap text-[13px] font-medium opacity-0 transition-all duration-200 md:inline-block group-hover:max-w-[72px] group-hover:pl-2 group-hover:opacity-100"
		>Codex</span>
	</a>
</aside>
