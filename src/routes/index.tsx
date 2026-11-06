import { createFileRoute } from "@tanstack/react-router";
import { Moon, PlusCircle, Sun } from "lucide-react";
import { useMemo, useState } from "react";

import { GameCard } from "@/components/collection/GameCard";
import { GameDetailDialog } from "@/components/collection/GameDetailDialog";
import { GameFormDialog } from "@/components/collection/GameFormDialog";
import { PixelFooter } from "@/components/layout/PixelFooter";
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
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { useGameCollection } from "@/hooks/use-game-collection";
import { useTheme } from "@/hooks/use-theme";
import {
  COLLECTION_KINDS,
  CURRENCIES,
  PLATFORMS,
  STATUSES,
  SYMBOLS,
  filterGames,
  formatDate,
  type Currency,
  type Game,
} from "@/lib/games";

const TITLE = "Coisas de Colecionador - Catálogo de Jogos";
const DESCRIPTION =
  "Sua coleção de jogos em estilo pixel art: preço em R$, $ ou €, custo por hora, troféus e platina, dificuldade, veredito, review, trailer e galeria de fotos.";

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
  const { rates, live, date, checking } = useExchangeRates();
  const { theme, toggle } = useTheme();
  const [currency, setCurrency] = useState<Currency>("BRL");
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
  const viewing = games.find((g) => g.id === viewingId) ?? null;

  function openForm(game: Game | null) {
    setViewingId(null);
    setEditing(game);
    setFormOpen(true);
  }

  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
      <div className="sky-stars" aria-hidden />

      <header className="relative z-10 overflow-hidden px-4 pb-6 pt-10 text-center">
        <Button
          variant="tool"
          size="icon"
          onClick={toggle}
          className="pixel-border absolute right-4 top-4"
          aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>

        <div className="relative mx-auto flex max-w-5xl flex-col items-center">
          <div className="sun-glow pointer-events-none absolute -top-16 left-1/2 size-[26rem] -translate-x-1/2" aria-hidden />
          <div className="pixel-sun pointer-events-none absolute -top-4 left-1/2 size-40 -translate-x-1/2 sm:size-52" aria-hidden />

          <h1 className="font-pixel text-stroke relative mb-6 -rotate-1 text-2xl uppercase leading-snug tracking-wider text-title sm:text-4xl md:text-5xl">
            Coisas de
            <br />
            Colecionador
          </h1>

          <nav aria-label="Coleções" className="relative mb-4 flex flex-wrap justify-center gap-2">
            {COLLECTION_KINDS.map((k) =>
              k.available ? (
                <span key={k.id} className="pixel-border rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                  {k.emoji} {k.label}
                </span>
              ) : (
                <span
                  key={k.id}
                  className="rounded-lg border-2 border-dashed border-ink/40 bg-card/50 px-3 py-1.5 text-xs font-bold text-muted-foreground"
                  title="Em breve"
                >
                  {k.emoji} {k.label} · em breve
                </span>
              ),
            )}
          </nav>

          <div className="pixel-border relative flex flex-col items-center gap-2 rounded-2xl bg-card/90 px-4 py-2.5 backdrop-blur sm:flex-row sm:gap-4 sm:rounded-full sm:px-6">
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
          <p className="relative mt-3 flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold text-muted-foreground backdrop-blur">
            <span className={`size-2 rounded-full ${live ? "animate-pulse bg-live" : "bg-muted-foreground"}`} aria-hidden />
            {checking
              ? "Buscando cotação…"
              : live
                ? `Cotação ao vivo · R$ 1 = ${SYMBOLS.USD} ${rates.USD.toFixed(4)} · ${SYMBOLS.EUR} ${rates.EUR.toFixed(4)} · ${formatDate(date)}`
                : "Sem conexão: usando cotação estimada"}
          </p>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-grow px-4 pb-16">
        <div className="pixel-border mb-8 flex flex-col items-stretch justify-between gap-4 rounded-2xl bg-card/95 p-4 backdrop-blur md:flex-row md:items-center">
          <div className="flex w-full flex-1 flex-wrap gap-3 md:w-auto">
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
              className="field field-compact min-w-[9rem] flex-1 font-medium md:w-auto md:flex-none"
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
              className="field field-compact min-w-[9rem] flex-1 font-medium md:w-auto md:flex-none"
            >
              <option value="">Todos os Status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <Button variant="arcade" size="xl" onClick={() => openForm(null)} className="w-full md:w-auto">
            <PlusCircle /> Adicionar Jogo
          </Button>
        </div>

        {ready && (
          <>
            <p className="font-pixel mb-4 text-[10px] uppercase text-title text-stroke-sm">
              {visible.length} {visible.length === 1 ? "jogo" : "jogos"}
              {visible.length !== games.length && ` de ${games.length}`}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.length === 0 ? (
                <div className="col-span-full rounded-2xl bg-card/70 py-12 text-center font-semibold text-muted-foreground backdrop-blur">
                  Nenhum jogo encontrado na coleção.
                </div>
              ) : (
                visible.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    currency={currency}
                    rates={rates}
                    onOpen={() => setViewingId(game.id)}
                    onEdit={() => openForm(game)}
                    onDelete={() => setDeleting(game)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </main>

      <PixelFooter />

      <GameDetailDialog
        game={viewing}
        currency={currency}
        rates={rates}
        onClose={() => setViewingId(null)}
        onEdit={openForm}
        onDelete={(g) => setDeleting(g)}
      />

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
        <AlertDialogContent className="pixel-border rounded-2xl bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover jogo?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente remover {deleting ? `"${deleting.title}"` : "este jogo"} da sua coleção? As fotos dele também serão apagadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleting) remove(deleting.id);
                if (deleting?.id === viewingId) setViewingId(null);
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
