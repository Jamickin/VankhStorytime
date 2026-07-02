import { writable, derived } from 'svelte/store';
import { loreById } from '$lib/content/lore.js';

export const loreEntry = writable(null);

// Tracks the last 3 lore IDs the reader has opened (most-recent last).
export const openedLore = writable(/** @type {string[]} */ ([]));

export function openLore(idOrEntry) {
  const entry = typeof idOrEntry === 'string'
    ? (loreById.get(idOrEntry) ?? null)
    : idOrEntry;
  if (entry) {
    openedLore.update((ids) => {
      const next = ids.filter((id) => id !== entry.id);
      next.push(entry.id);
      return next.slice(-10); // keep last 10, drawer shows last 3
    });
  }
  loreEntry.set(entry);
}

export function closeLore() {
  loreEntry.set(null);
}
