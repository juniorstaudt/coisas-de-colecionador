import { Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import {
  GameCover,
  PlatinumSeal,
  StarRating,
  StoredImage,
  YouTubeEmbed,
} from "@/components/collection/media";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  DIFFICULTIES,
  VERDICTS,
  costPerHour,
  formatDate,
  formatPrice,
  isPlatinum,
  starCount,
  trophyProgress,
  type Currency,
  type Game,
  type Rates,
} from "@/lib/games";

interface GameDetailDialogProps {
  game: Game | null;
  currency: Currency;
  rates: Rates;
  onClose: () => void;
  onEdit: (game: Game) => void;
  onDelete: (game: Game) => void;
}

export function GameDetailDialog({ game, currency, rates, onClose, onEdit, onDelete }: GameDetailDialogProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(() => setPhoto(null), [game?.id]);

  return (
    <Dialog open={!!game} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="pixel-border block max-h-[92vh] max-w-3xl overflow-y-auto rounded-2xl bg-card p-0 sm:rounded-2xl">
        {game && (
          <>
            <div className="relative h-56 w-full shrink-0 overflow-hidden bg-muted sm:h-72">
              <GameCover game={game} className="h-full w-full" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card to-transparent" />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow">
                  {game.platform}
                </span>
                <span className="rounded-lg bg-chip px-2.5 py-1 text-xs font-bold text-chip-foreground shadow">
                  {game.status}
                </span>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <DialogTitle className="text-2xl font-extrabold leading-tight">{game.title}</DialogTitle>
                  <DialogDescription className="mt-1 text-sm font-semibold text-muted-foreground">
                    {[game.genre, game.studio, game.publisher].filter(Boolean).join(" • ") || "Sem detalhes"}
                  </DialogDescription>
                </div>
                {isPlatinum(game) && <PlatinumSeal size="lg" />}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Info label="Preço pago">{formatPrice(game.price, currency, rates)}</Info>
                <Info label="Custo por hora">{formatPrice(costPerHour(game), currency, rates)}/h</Info>
                <Info label="Horas jogadas">{game.hoursPlayed || 0}h</Info>
                <Info label="Data de compra">{formatDate(game.purchaseDate)}</Info>
              </div>

              <div className="rounded-xl bg-muted p-4">
                <div className="mb-2 flex items-center justify-between text-sm font-bold">
                  <span>Troféus</span>
                  <span>
                    {game.trophiesUnlocked || 0}/{game.trophiesTotal || 0} ({trophyProgress(game)}%)
                  </span>
                </div>
                <div className="pixel-track h-4 w-full overflow-hidden rounded">
                  <div className="pixel-fill h-full" style={{ width: `${trophyProgress(game)}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Info label="Dificuldade">
                  <span className="text-tag-difficulty-foreground">
                    {DIFFICULTIES.find((d) => d.value === game.difficulty)?.label ?? (game.difficulty || "—")}
                  </span>
                </Info>
                <Info label="Nota">
                  <StarRating stars={starCount(game.stars)} className="pt-0.5" />
                </Info>
                <Info label="Veredito">
                  <span className="text-tag-verdict-foreground">
                    {VERDICTS.find((v) => v.value === game.verdict)?.label ?? (game.verdict || "Sem veredito")}
                  </span>
                </Info>
              </div>

              <Section title="Review pessoal">
                <p className="whitespace-pre-line text-sm leading-relaxed">
                  {game.review || "Sem review cadastrado."}
                </p>
              </Section>

              {game.youtubeUrl && (
                <Section title="Vídeo">
                  <YouTubeEmbed url={game.youtubeUrl} title={game.title} />
                </Section>
              )}

              {game.photoIds.length > 0 && (
                <Section title={`Galeria (${game.photoIds.length})`}>
                  {photo && (
                    <div className="relative mb-3">
                      <StoredImage id={photo} alt={`Foto de ${game.title}`} className="pixel-border max-h-[60vh] w-full rounded-xl object-contain bg-ink" />
                      <Button variant="tool" size="icon" className="absolute right-2 top-2" onClick={() => setPhoto(null)} aria-label="Fechar foto">
                        <X />
                      </Button>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {game.photoIds.map((id, i) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPhoto(id)}
                        className="aspect-square overflow-hidden rounded-lg border-2 border-border transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:border-primary"
                        data-active={photo === id}
                        aria-label={`Ver foto ${i + 1}`}
                      >
                        <StoredImage id={id} alt={`Foto ${i + 1} de ${game.title}`} className="h-full w-full" />
                      </button>
                    ))}
                  </div>
                </Section>
              )}

              <div className="flex flex-wrap justify-end gap-3 border-t-2 border-border pt-4">
                <Button variant="danger-soft" size="lg" onClick={() => onDelete(game)}>
                  <Trash2 /> Remover
                </Button>
                <Button size="lg" onClick={() => onEdit(game)}>
                  <Pencil /> Editar
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <strong className="text-sm">{children}</strong>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="font-pixel mb-3 text-[11px] uppercase text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}
