// Card and details window shared by the music and book sections.
import { Images, Pencil, PlayCircle, Trash2, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { GameCover, StarRating, StoredImage, YouTubeEmbed } from "@/components/collection/media";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { starCount } from "@/lib/games";

export interface ItemView {
  id: string;
  title: string;
  coverUrl: string;
  coverImageId?: string | undefined;
  photoIds: string[];
  youtubeUrl?: string | undefined;
  stars: string;
  review: string;
  /** First badge is highlighted (format), the rest are plain (status). */
  badges: string[];
  subtitle: string;
  /** Short facts on the card. */
  stats: { label: string; value: string }[];
  /** Facts in the details window. */
  details: { label: string; value: string }[];
}

interface CardProps {
  view: ItemView;
  placeholder: string;
  onOpen: () => void;
  /** Omitted outside owner mode: the edit/delete buttons are hidden. */
  onEdit?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
}

function Badges({ badges }: { badges: string[] }) {
  return (
    <>
      {badges.filter(Boolean).map((b, i) => (
        <span
          key={b}
          className={
            i === 0
              ? "rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow"
              : "rounded-lg bg-chip px-2.5 py-1 text-xs font-bold text-chip-foreground shadow"
          }
        >
          {b}
        </span>
      ))}
    </>
  );
}

export function ItemCard({ view, placeholder, onOpen, onEdit, onDelete }: CardProps) {
  return (
    <article className="pixel-border group flex flex-col justify-between overflow-hidden rounded-2xl bg-card text-card-foreground transition duration-200 hover:-translate-y-1">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Ver detalhes de ${view.title}`}
      >
        <div className="relative h-48 overflow-hidden bg-muted">
          <GameCover
            game={view}
            placeholder={placeholder}
            className="h-full w-full transition duration-300 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badges badges={view.badges} />
          </div>
          {(view.youtubeUrl || view.photoIds.length > 0) && (
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              {view.youtubeUrl && (
                <span className="flex items-center gap-1 rounded-md bg-chip px-2 py-1 text-[11px] font-bold text-chip-foreground">
                  <PlayCircle className="size-3.5" /> Vídeo
                </span>
              )}
              {view.photoIds.length > 0 && (
                <span className="flex items-center gap-1 rounded-md bg-chip px-2 py-1 text-[11px] font-bold text-chip-foreground">
                  <Images className="size-3.5" /> {view.photoIds.length}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-5">
          <h4 className="mb-1 line-clamp-1 text-lg font-extrabold">{view.title}</h4>
          <p className="mb-3 line-clamp-1 text-xs font-semibold text-muted-foreground">
            {view.subtitle}
          </p>
          <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-muted p-3 text-xs">
            {view.stats.map((s) => (
              <div key={s.label}>
                <span className="block text-muted-foreground">{s.label}:</span>
                <strong>{s.value}</strong>
              </div>
            ))}
          </div>
          <p className="line-clamp-2 text-xs italic text-muted-foreground">
            "{view.review || "Sem review cadastrado."}"
          </p>
        </div>
      </button>

      <div className="flex items-center justify-between border-t-2 border-border bg-muted p-4">
        <StarRating stars={starCount(view.stars)} />
        {onEdit && onDelete && (
          <div className="flex gap-2">
            <Button variant="tool" size="icon" onClick={onEdit} aria-label={`Editar ${view.title}`}>
              <Pencil />
            </Button>
            <Button
              variant="danger-soft"
              size="icon"
              onClick={onDelete}
              aria-label={`Remover ${view.title}`}
            >
              <Trash2 />
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}

interface DetailProps {
  view: ItemView | null;
  placeholder: string;
  onClose: () => void;
  onEdit?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
}

export function ItemDetailDialog({ view, placeholder, onClose, onEdit, onDelete }: DetailProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(() => setPhoto(null), [view?.id]);

  return (
    <Dialog open={!!view} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="pixel-border block max-h-[92vh] max-w-3xl overflow-y-auto rounded-2xl bg-card p-0 sm:rounded-2xl">
        {view && (
          <>
            <div className="relative h-56 w-full shrink-0 overflow-hidden bg-muted sm:h-72">
              <GameCover game={view} placeholder={placeholder} className="h-full w-full" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card to-transparent" />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <Badges badges={view.badges} />
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <div className="min-w-0">
                <DialogTitle className="text-2xl font-extrabold leading-tight">
                  {view.title}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm font-semibold text-muted-foreground">
                  {view.subtitle}
                </DialogDescription>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {view.details.map((d) => (
                  <Info key={d.label} label={d.label}>
                    {d.value}
                  </Info>
                ))}
                <Info label="Nota">
                  <StarRating stars={starCount(view.stars)} className="pt-0.5" />
                </Info>
              </div>

              <Section title="Review pessoal">
                <p className="whitespace-pre-line text-sm leading-relaxed">
                  {view.review || "Sem review cadastrado."}
                </p>
              </Section>

              {view.youtubeUrl && (
                <Section title="Vídeo">
                  <YouTubeEmbed url={view.youtubeUrl} title={view.title} />
                </Section>
              )}

              {view.photoIds.length > 0 && (
                <Section title={`Galeria (${view.photoIds.length})`}>
                  {photo && (
                    <div className="relative mb-3">
                      <StoredImage
                        id={photo}
                        alt={`Foto de ${view.title}`}
                        className="pixel-border max-h-[60vh] w-full rounded-xl bg-ink object-contain"
                      />
                      <Button
                        variant="tool"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => setPhoto(null)}
                        aria-label="Fechar foto"
                      >
                        <X />
                      </Button>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {view.photoIds.map((id, i) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPhoto(id)}
                        className="aspect-square overflow-hidden rounded-lg border-2 border-border transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:border-primary"
                        data-active={photo === id}
                        aria-label={`Ver foto ${i + 1}`}
                      >
                        <StoredImage
                          id={id}
                          alt={`Foto ${i + 1} de ${view.title}`}
                          className="h-full w-full"
                        />
                      </button>
                    ))}
                  </div>
                </Section>
              )}

              {onEdit && onDelete && (
                <div className="flex flex-wrap justify-end gap-3 border-t-2 border-border pt-4">
                  <Button variant="danger-soft" size="lg" onClick={onDelete}>
                    <Trash2 /> Remover
                  </Button>
                  <Button size="lg" onClick={onEdit}>
                    <Pencil /> Editar
                  </Button>
                </div>
              )}
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
