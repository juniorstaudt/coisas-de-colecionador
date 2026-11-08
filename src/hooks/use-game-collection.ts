import { useCallback, useEffect, useState } from "react";

import importedGames from "@/data/imported-games.json";
import { imageIdsOf, loadGames, normalizeGame, saveGames, upsertGame, type Game } from "@/lib/games";
import { deleteImages } from "@/lib/image-store";
import { IMPORT_FLAG_KEY, mergeImportedGames } from "@/lib/spreadsheet-import";

/** This browser's games, with the owner's spreadsheet merged in once. */
function loadLocalGames(): Game[] {
  const storage = window.localStorage;
  const local = loadGames(storage);
  if (storage.getItem(IMPORT_FLAG_KEY)) return local;
  const merged = mergeImportedGames(local, (importedGames as Partial<Game>[]).map(normalizeGame));
  saveGames(storage, merged);
  storage.setItem(IMPORT_FLAG_KEY, "1");
  return merged;
}

/** The collection is kept in this browser (localStorage + IndexedDB photos); no login. */
export function useGameCollection() {
  const [games, setGames] = useState<Game[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setGames(loadLocalGames());
    setReady(true);
  }, []);

  const persist = useCallback((next: Game[]) => {
    saveGames(window.localStorage, next);
    setGames(next);
  }, []);

  const save = useCallback(
    (game: Game) => {
      const previous = games.find((g) => g.id === game.id);
      if (previous) {
        const keep = new Set(imageIdsOf(game));
        void deleteImages(imageIdsOf(previous).filter((id) => !keep.has(id)));
      }
      persist(upsertGame(games, game));
    },
    [games, persist],
  );

  const remove = useCallback(
    (id: string) => {
      const game = games.find((g) => g.id === id);
      if (game) void deleteImages(imageIdsOf(game));
      persist(games.filter((g) => g.id !== id));
    },
    [games, persist],
  );

  return { games, ready, save, remove };
}
