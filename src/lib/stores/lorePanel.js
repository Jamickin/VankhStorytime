import { writable, get } from 'svelte/store';
import { loreById } from '$lib/content/lore.js';
import { recordLoreOpen, currentReadingSlug } from '$lib/progress.js';

export const loreEntry = writable(null);

// Tracks the last 10 lore IDs the reader has opened (most-recent last).
// Used by FloatingSidebar to show the last 3 in the Codex drawer.
// Distinct from progress.js `openedLore` (full discovery history with chapter metadata).
export const recentLore = writable(/** @type {string[]} */ ([]));

export function openLore(idOrEntry) {
  const entry = typeof idOrEntry === 'string'
    ? (loreById.get(idOrEntry) ?? null)
    : idOrEntry;
  if (entry) {
    recentLore.update((ids) => {
      const next = ids.filter((id) => id !== entry.id);
      next.push(entry.id);
      return next.slice(-10); // keep last 10, drawer shows last 3
    });
    recordLoreOpen(entry.id, get(currentReadingSlug));
  }
  loreEntry.set(entry);
}

export function closeLore() {
  loreEntry.set(null);
}
