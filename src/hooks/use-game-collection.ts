import { useCallback, useEffect, useState } from "react";

import { loadGames, saveGames, upsertGame, type Game } from "@/lib/games";

/** Collection stored in this browser's localStorage, read after hydration. */
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

  const save = useCallback((game: Game) => persist(upsertGame(games, game)), [games, persist]);
  const remove = useCallback(
    (id: string) => persist(games.filter((g) => g.id !== id)),
    [games, persist],
  );

  return { games, ready, save, remove };
}
