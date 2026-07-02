import { writable, get } from 'svelte/store';
import { loreById } from '$lib/content/lore.js';
import { recordLoreOpen, currentReadingSlug } from '$lib/progress.js';

export const loreEntry = writable(null);

export function openLore(idOrEntry) {
  const entry = typeof idOrEntry === 'string'
    ? (loreById.get(idOrEntry) ?? null)
    : idOrEntry;
  loreEntry.set(entry);
  if (entry) {
    recordLoreOpen(entry.id, get(currentReadingSlug));
  }
}

export function closeLore() {
  loreEntry.set(null);
}
