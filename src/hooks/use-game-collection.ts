import { useCallback, useEffect, useState } from "react";

import { imageIdsOf, loadGames, saveGames, upsertGame, type Game } from "@/lib/games";
import { deleteImages } from "@/lib/image-store";

/** Collection stored in this browser (localStorage + IndexedDB photos), read after hydration. */
export function useGameCollection() {
  const [games, setGames] = useState<Game[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setGames(loadGames(window.localStorage));
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
