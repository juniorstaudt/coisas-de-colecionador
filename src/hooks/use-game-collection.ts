import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { imageIdsOf, loadGames, normalizeGame, saveGames, upsertGame, type Game } from "@/lib/games";
import { deleteImages, pushImageToCloud } from "@/lib/image-store";

/**
 * Signed out: collection stored in this browser (localStorage + IndexedDB photos).
 * Signed in: collection stored in the person's cloud account; on the first sign-in with
 * an empty cloud, the games on this device are moved up.
 */
export function useGameCollection(userId: string | null, authChecked: boolean) {
  const [games, setGames] = useState<Game[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authChecked) return;
    let cancelled = false;
    setReady(false);
    if (!userId) {
      setGames(loadGames(window.localStorage));
      setReady(true);
      return;
    }
    (async () => {
      const { data, error } = await supabase.from("games").select("id, data").order("created_at");
      if (cancelled) return;
      if (error) {
        toast.error("Não foi possível carregar sua coleção da nuvem.");
        setReady(true);
        return;
      }
      let list = (data ?? []).map((r) => normalizeGame({ ...(r.data as Partial<Game>), id: r.id }));
      if (list.length === 0) {
        const local = loadGames(window.localStorage);
        if (local.length) {
          for (const g of local) for (const id of imageIdsOf(g)) await pushImageToCloud(id).catch(() => undefined);
          const { error: upErr } = await supabase
            .from("games")
            .upsert(local.map((g) => ({ user_id: userId, id: g.id, data: g as never })));
          if (!upErr) {
            list = local;
            toast.success(`${local.length} jogo(s) deste aparelho foram para a nuvem.`);
          }
        }
      }
      if (!cancelled) {
        setGames(list);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, authChecked]);

  const persist = useCallback(
    (next: Game[]) => {
      if (!userId) saveGames(window.localStorage, next);
      setGames(next);
    },
    [userId],
  );

  const save = useCallback(
    (game: Game) => {
      const previous = games.find((g) => g.id === game.id);
      if (previous) {
        const keep = new Set(imageIdsOf(game));
        void deleteImages(imageIdsOf(previous).filter((id) => !keep.has(id)));
      }
      persist(upsertGame(games, game));
      if (userId) {
        void supabase
          .from("games")
          .upsert({ user_id: userId, id: game.id, data: game as never })
          .then(({ error }) => error && toast.error("Falha ao salvar na nuvem."));
      }
    },
    [games, persist, userId],
  );

  const remove = useCallback(
    (id: string) => {
      const game = games.find((g) => g.id === id);
      if (game) void deleteImages(imageIdsOf(game));
      persist(games.filter((g) => g.id !== id));
      if (userId) {
        void supabase
          .from("games")
          .delete()
          .eq("id", id)
          .then(({ error }) => error && toast.error("Falha ao remover na nuvem."));
      }
    },
    [games, persist, userId],
  );

  return { games, ready, save, remove };
}
