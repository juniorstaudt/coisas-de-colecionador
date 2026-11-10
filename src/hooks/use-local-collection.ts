import { useCallback, useEffect, useState } from "react";

import { imageIdsOf } from "@/lib/games";
import { deleteImages } from "@/lib/image-store";
import { loadItems, saveItems, upsertItem, type CollectionItem } from "@/lib/local-collection";

/** A collection (music, books) kept in this browser under its own localStorage key. */
export function useLocalCollection<T extends CollectionItem>(key: string, normalize: (raw: Partial<T>) => T) {
  const [items, setItems] = useState<T[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(loadItems(window.localStorage, key, normalize));
    setReady(true);
  }, [key, normalize]);

  const persist = useCallback(
    (next: T[]) => {
      saveItems(window.localStorage, key, next);
      setItems(next);
    },
    [key],
  );

  const save = useCallback(
    (item: T) => {
      const previous = items.find((i) => i.id === item.id);
      if (previous) {
        const keep = new Set(imageIdsOf(item));
        void deleteImages(imageIdsOf(previous).filter((id) => !keep.has(id)));
      }
      persist(upsertItem(items, item));
    },
    [items, persist],
  );

  const remove = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (item) void deleteImages(imageIdsOf(item));
      persist(items.filter((i) => i.id !== id));
    },
    [items, persist],
  );

  return { items, ready, save, remove };
}
