import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { ConfirmRemoveDialog } from "@/components/collection/ConfirmRemoveDialog";
import { GameCard } from "@/components/collection/GameCard";
import { GameDetailDialog } from "@/components/collection/GameDetailDialog";
import { GameFormDialog } from "@/components/collection/GameFormDialog";
import { CollectionShell, ItemsGrid } from "@/components/layout/CollectionShell";
import { useGameCollection } from "@/hooks/use-game-collection";
import {
  PLATFORMS,
  STATUSES,
  collectionTotals,
  filterGames,
  validateNewItemSearch,
  type Game,
} from "@/lib/games";
import { getOwnerStatus } from "@/lib/owner.functions";

const TITLE = "Coisas de Colecionador - Catálogo de Jogos";
const DESCRIPTION =
  "Sua coleção de jogos em estilo pixel art: total gasto em R$ e €, custo por hora, troféus e platina, dificuldade, veredito, review, trailer e galeria de fotos.";

export const Route = createFileRoute("/")({
  validateSearch: validateNewItemSearch,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "google-site-verification", content: "B5jI2MmTk_sI4BTOkJ9PfoluKY-8NUy3W99c6Qcf1Y0" },
    ],
  }),
  loader: () => getOwnerStatus(),
  component: Index,
});

function Index() {
  const { owner } = Route.useLoaderData();
  const { novo } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { games, ready, save, remove } = useGameCollection();
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Game | null>(null);

  const visible = useMemo(
    () => filterGames(games, { search, platform, status }),
    [games, search, platform, status],
  );
  const totals = useMemo(() => collectionTotals(games), [games]);
  const viewing = games.find((g) => g.id === viewingId) ?? null;

  function openForm(game: Game | null) {
    setViewingId(null);
    setEditing(game);
    setFormOpen(true);
  }

  // "Adicionar Item" → Jogo lands here with ?novo=1.
  useEffect(() => {
    if (!novo || !ready) return;
    if (owner) openForm(null);
    void navigate({ search: {}, replace: true });
  }, [novo, ready, owner, navigate]);

  const selectClass = "field field-compact min-w-[9rem] flex-1 font-medium md:w-auto md:flex-none";

  return (
    <CollectionShell
      kind="games"
      owner={owner}
      ready={ready}
      totals={totals}
      filters={
        <>
          <input
            type="search"
            aria-label="Buscar"
            placeholder="Buscar jogo, estúdio ou publisher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field field-compact w-full md:w-72"
          />
          <select
            aria-label="Filtrar por plataforma"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className={selectClass}
          >
            <option value="">Todas Plataformas</option>
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={selectClass}
          >
            <option value="">Todos os Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </>
      }
    >
      <ItemsGrid kind="games" ready={ready} visible={visible.length} total={games.length}>
        {visible.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onOpen={() => setViewingId(game.id)}
            onEdit={owner ? () => openForm(game) : undefined}
            onDelete={owner ? () => setDeleting(game) : undefined}
          />
        ))}
      </ItemsGrid>

      <GameDetailDialog
        game={viewing}
        onClose={() => setViewingId(null)}
        onEdit={owner ? openForm : undefined}
        onDelete={owner ? (g) => setDeleting(g) : undefined}
      />

      <GameFormDialog
        open={owner && formOpen}
        game={editing}
        onOpenChange={setFormOpen}
        onSave={(game) => {
          save(game);
          setFormOpen(false);
        }}
      />

      <ConfirmRemoveDialog
        title={owner && deleting ? deleting.title : null}
        noun="jogo"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) remove(deleting.id);
          if (deleting?.id === viewingId) setViewingId(null);
          setDeleting(null);
        }}
      />
    </CollectionShell>
  );
}
