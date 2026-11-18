<script>
  let { count } = $props();
</script>

{#if count > 0}
  <div class="mt-2 flex items-center gap-2 rounded-md border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-sm text-amber-200/70">
    <span aria-hidden="true">🔒</span>
    <span>{count} more {count === 1 ? 'truth lies' : 'truths lie'} sealed here — read on to uncover {count === 1 ? 'it' : 'them'}.</span>
  </div>
{/if}
