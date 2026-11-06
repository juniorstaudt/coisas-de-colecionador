import { createFileRoute } from "@tanstack/react-router";
import { PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { GameCard } from "@/components/collection/GameCard";
import { GameFormDialog } from "@/components/collection/GameFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useGameCollection } from "@/hooks/use-game-collection";
import { CURRENCIES, PLATFORMS, STATUSES, filterGames, type Currency, type Game } from "@/lib/games";

const TITLE = "Coisas de Colecionador - Catálogo de Jogos";
const DESCRIPTION =
  "Catálogo pessoal de jogos: preço pago, custo por hora, troféus, dificuldade, nota e review de cada jogo da sua coleção.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { games, ready, save, remove } = useGameCollection();
  const [currency, setCurrency] = useState<Currency>("BRL");
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);
  const [deleting, setDeleting] = useState<Game | null>(null);

  const visible = useMemo(
    () => filterGames(games, { search, platform, status }),
    [games, search, platform, status],
  );

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <header className="relative overflow-hidden px-4 pb-6 pt-8 text-center">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <h1 className="font-pixel text-stroke mb-4 -rotate-1 text-3xl uppercase tracking-wider text-title md:text-5xl">
            Coisas de Colecionador
          </h1>

          <div className="pixel-border mt-2 flex items-center gap-4 rounded-full bg-card/90 px-6 py-2 backdrop-blur">
            <span className="text-xs font-bold uppercase text-muted-foreground">Moeda:</span>
            <div className="flex gap-2" role="group" aria-label="Moeda">
              {CURRENCIES.map((c) => (
                <Button
                  key={c.value}
                  size="chip"
                  variant={currency === c.value ? "default" : "secondary"}
                  aria-pressed={currency === c.value}
                  onClick={() => setCurrency(c.value)}
                >
                  {c.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 pb-16">
        <div className="pixel-border mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-card/95 p-4 backdrop-blur md:flex-row">
          <div className="flex w-full flex-1 flex-wrap gap-3 md:w-auto">
            <input
              type="text"
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
              className="field field-compact w-auto font-medium"
            >
              <option value="">Todas Plataformas</option>
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <select
              aria-label="Filtrar por status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="field field-compact w-auto font-medium"
            >
              <option value="">Todos os Status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <Button variant="arcade" size="xl" onClick={openNew} className="w-full md:w-auto">
            <PlusCircle /> Adicionar Jogo
          </Button>
        </div>

        {ready && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visible.length === 0 ? (
              <div className="col-span-full rounded-2xl bg-card/60 py-12 text-center font-semibold text-muted-foreground">
                Nenhum jogo encontrado na coleção.
              </div>
            ) : (
              visible.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  currency={currency}
                  onEdit={() => {
                    setEditing(game);
                    setFormOpen(true);
                  }}
                  onDelete={() => setDeleting(game)}
                />
              ))
            )}
          </div>
        )}
      </main>

      <footer className="font-pixel mt-auto border-t-4 border-success-strong bg-success-deep py-4 text-center text-xs font-bold text-success-foreground">
        🎮 COISAS DE COLECIONADOR - SUA COLEÇÃO NA NUVEM
      </footer>

      <GameFormDialog
        open={formOpen}
        game={editing}
        onOpenChange={setFormOpen}
        onSave={(game) => {
          save(game);
          setFormOpen(false);
        }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="pixel-border rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover jogo?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente remover {deleting ? `"${deleting.title}"` : "este jogo"} da sua coleção?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleting) remove(deleting.id);
                setDeleting(null);
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
