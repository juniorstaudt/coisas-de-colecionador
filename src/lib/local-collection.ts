// Shared storage helpers for collections kept in this browser's localStorage.
// Each collection kind uses its own key, so new kinds never touch saved games.

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

export interface CollectionItem {
  id: string;
  coverImageId?: string | undefined;
  photoIds: string[];
}

/** Saved items under `key`, with missing fields filled in; nothing saved (or unreadable) → []. */
export function loadItems<T>(storage: StorageLike, key: string, normalize: (raw: Partial<T>) => T): T[] {
  try {
    const raw = storage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return Array.isArray(parsed) ? (parsed as Partial<T>[]).map(normalize) : [];
  } catch {
    return [];
  }
}

export function saveItems<T>(storage: StorageLike, key: string, items: T[]): void {
  storage.setItem(key, JSON.stringify(items));
}

/** Inserts a new item at the top, or replaces the item with the same id. */
export function upsertItem<T extends { id: string }>(items: T[], item: T): T[] {
  const index = items.findIndex((i) => i.id === item.id);
  if (index === -1) return [item, ...items];
  const next = items.slice();
  next[index] = item;
  return next;
}

/** Case-insensitive match of `search` against any of the given texts; empty search matches all. */
export function matchesSearch(search: string, ...texts: string[]): boolean {
  const term = search.trim().toLowerCase();
  return !term || texts.some((t) => !!t && t.toLowerCase().includes(term));
}
