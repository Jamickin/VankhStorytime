<script>
  let { choice, heading = null, target = null } = $props();

  let label = $derived(
    choice.label ?? (target ? `${target.number} · ${target.title}` : choice.to)
  );
</script>

<a
  href="/read/{choice.to}"
  class="group flex items-center justify-between gap-4 rounded-xl border border-amber-900/30 bg-gradient-to-r from-amber-950/30 to-transparent px-6 py-5 transition-colors hover:border-amber-600/50 hover:from-amber-900/30"
>
  <div class="flex flex-col gap-0.5">
    {#if heading}
      <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-400/60">{heading}</span>
    {/if}
    <span class="text-base font-medium text-amber-100">{label}</span>
    {#if choice.hint}
      <span class="text-xs text-stone-400">{choice.hint}</span>
    {/if}
  </div>
  <span class="text-amber-400/70 transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
</a>
