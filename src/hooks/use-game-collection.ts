import { useCallback, useEffect, useState } from "react";

import importedGames from "@/data/imported-games.json";
import { imageIdsOf, loadGames, normalizeGame, saveGames, upsertGame, type Game } from "@/lib/games";
import { deleteImages } from "@/lib/image-store";
import {
  CURRENCY_FIX_FLAG_KEY,
  IMPORT_FLAG_KEY,
  mergeImportedGames,
  restoreOriginalCurrencies,
} from "@/lib/spreadsheet-import";

const IMPORTED = (importedGames as Partial<Game>[]).map(normalizeGame);

/** This browser's games, with the owner's spreadsheet merged in once. */
function loadLocalGames(): Game[] {
  const storage = window.localStorage;
  let list = loadGames(storage);
  if (!storage.getItem(IMPORT_FLAG_KEY)) {
    list = mergeImportedGames(list, IMPORTED);
    storage.setItem(CURRENCY_FIX_FLAG_KEY, "1");
  } else if (!storage.getItem(CURRENCY_FIX_FLAG_KEY)) {
    list = restoreOriginalCurrencies(list, IMPORTED);
    storage.setItem(CURRENCY_FIX_FLAG_KEY, "1");
  } else {
    return list;
  }
  saveGames(storage, list);
  storage.setItem(IMPORT_FLAG_KEY, "1");
  return list;
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
