import { writable } from 'svelte/store';
import { loreById } from '$lib/content/lore.js';

export const loreEntry = writable(null);

export function openLore(idOrEntry) {
  const entry = typeof idOrEntry === 'string'
    ? (loreById.get(idOrEntry) ?? null)
    : idOrEntry;
  loreEntry.set(entry);
}

export function closeLore() {
  loreEntry.set(null);
}
