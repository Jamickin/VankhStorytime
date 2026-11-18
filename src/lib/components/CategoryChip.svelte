<script>
  import { categoryStyle } from '$lib/ui.js';
  let { category, class: klass = '' } = $props();
  let style = $derived(categoryStyle(category));
</script>

<span class="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] ring-1 {style.chip} {klass}">
  {category}
</span>
