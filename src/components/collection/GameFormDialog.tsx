import { ImagePlus, Link2, Loader2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { GameCover, StoredImage } from "@/components/collection/media";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  CURRENCIES,
  DIFFICULTIES,
  PLATFORMS,
  STAR_OPTIONS,
  STATUSES,
  VERDICTS,
  normalizeGame,
  type Currency,
  type Game,
} from "@/lib/games";
import { deleteImages, saveUploadedImage } from "@/lib/image-store";

interface FormState {
  title: string;
  platform: string;
  genre: string;
  studio: string;
  publisher: string;
  price: string;
  currency: Currency;
  purchaseDate: string;
  hoursPlayed: string;
  status: string;
  trophiesUnlocked: string;
  trophiesTotal: string;
  difficulty: string;
  stars: string;
  verdict: string;
  coverUrl: string;
  coverImageId?: string | undefined;
  youtubeUrl: string;
  review: string;
  photoIds: string[];
}

const EMPTY: FormState = {
  title: "",
  platform: PLATFORMS[0].value,
  genre: "",
  studio: "",
  publisher: "",
  price: "",
  currency: "BRL",
  purchaseDate: "",
  hoursPlayed: "",
  status: STATUSES[0],
  trophiesUnlocked: "",
  trophiesTotal: "",
  difficulty: "de boas",
  stars: "5",
  verdict: "Topzera",
  coverUrl: "",
  coverImageId: undefined,
  youtubeUrl: "",
  review: "",
  photoIds: [],
};

function fromGame(g: Game): FormState {
  const num = (n: number) => (n ? String(n) : "");
  return {
    title: g.title,
    platform: g.platform,
    genre: g.genre || "",
    studio: g.studio || "",
    publisher: g.publisher || "",
    price: num(g.price),
    currency: g.currency,
    purchaseDate: g.purchaseDate || "",
    hoursPlayed: num(g.hoursPlayed),
    status: g.status,
    trophiesUnlocked: num(g.trophiesUnlocked),
    trophiesTotal: num(g.trophiesTotal),
    // "" is the neutral "not rated yet" choice and must survive editing.
    difficulty: g.difficulty,
    stars: g.stars,
    verdict: g.verdict,
    coverUrl: g.coverUrl || "",
    coverImageId: g.coverImageId,
    youtubeUrl: g.youtubeUrl || "",
    review: g.review || "",
    photoIds: [...g.photoIds],
  };
}

interface GameFormDialogProps {
  open: boolean;
  game: Game | null;
  onOpenChange: (open: boolean) => void;
  onSave: (game: Game) => void;
}

export function GameFormDialog({ open, game, onOpenChange, onSave }: GameFormDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [coverMode, setCoverMode] = useState<"link" | "upload">("link");
  const [uploading, setUploading] = useState<"cover" | "gallery" | null>(null);
  // Photos uploaded in this session; discarded if the form is closed without saving.
  const added = useRef<string[]>([]);
  const saved = useRef(false);

  useEffect(() => {
    if (!open) return;
    setForm(game ? fromGame(game) : EMPTY);
    setCoverMode(game?.coverImageId ? "upload" : "link");
    added.current = [];
    saved.current = false;
  }, [open, game]);

  function handleOpenChange(next: boolean) {
    if (!next && !saved.current && added.current.length) void deleteImages(added.current);
    onOpenChange(next);
  }

  const set =
    (key: keyof FormState) =>
    (e: { target: { value: string } }) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function upload(e: ChangeEvent<HTMLInputElement>, target: "cover" | "gallery") {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    e.target.value = "";
    if (!files.length) return;
    setUploading(target);
    try {
      const ids = await Promise.all((target === "cover" ? files.slice(0, 1) : files).map(saveUploadedImage));
      added.current.push(...ids);
      setForm((f) =>
        target === "cover" ? { ...f, coverImageId: ids[0] } : { ...f, photoIds: [...f.photoIds, ...ids] },
      );
    } catch {
      toast.error("Não foi possível salvar a imagem neste aparelho.");
    } finally {
      setUploading(null);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    saved.current = true;
    onSave(
      normalizeGame({
        id: game?.id ?? Date.now().toString(),
        title: form.title.trim(),
        platform: form.platform,
        genre: form.genre,
        studio: form.studio,
        publisher: form.publisher,
        price: parseFloat(form.price) || 0,
        currency: form.currency,
        purchaseDate: form.purchaseDate,
        hoursPlayed: parseFloat(form.hoursPlayed) || 0,
        status: form.status,
        trophiesUnlocked: parseInt(form.trophiesUnlocked) || 0,
        trophiesTotal: parseInt(form.trophiesTotal) || 0,
        difficulty: form.difficulty,
        stars: form.stars,
        verdict: form.verdict,
        coverUrl: form.coverUrl,
        coverImageId: coverMode === "upload" ? form.coverImageId : undefined,
        youtubeUrl: form.youtubeUrl,
        review: form.review,
        photoIds: form.photoIds,
      }),
    );
  }

  const previewGame = normalizeGame({
    title: form.title || "Novo jogo",
    coverUrl: form.coverUrl,
    coverImageId: coverMode === "upload" ? form.coverImageId : undefined,
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="pixel-border max-h-[92vh] max-w-2xl overflow-y-auto rounded-2xl bg-card p-5 sm:rounded-2xl sm:p-6">
        <div className="border-b-2 border-border pb-3 pr-8">
          <DialogTitle className="font-pixel text-xs leading-relaxed sm:text-sm">
            {game ? "Editar Jogo" : "Novo Jogo na Coleção"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-muted-foreground">
            Fotos enviadas ficam salvas neste aparelho.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Título do Jogo*" htmlFor="title">
              <input id="title" required value={form.title} onChange={set("title")} className="field" />
            </Field>
            <Field label="Plataforma*" htmlFor="platform">
              <select id="platform" required value={form.platform} onChange={set("platform")} className="field">
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <fieldset className="rounded-xl border-2 border-border p-3">
            <legend className="px-1 font-bold">Capa</legend>
            <div className="flex flex-col gap-3 sm:flex-row">
              <GameCover game={previewGame} className="h-28 w-full shrink-0 rounded-lg sm:w-44" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex gap-2" role="group" aria-label="Tipo de capa">
                  <Button type="button" size="chip" variant={coverMode === "link" ? "default" : "secondary"} aria-pressed={coverMode === "link"} onClick={() => setCoverMode("link")}>
                    <Link2 /> Link
                  </Button>
                  <Button type="button" size="chip" variant={coverMode === "upload" ? "default" : "secondary"} aria-pressed={coverMode === "upload"} onClick={() => setCoverMode("upload")}>
                    <Upload /> Enviar foto
                  </Button>
                </div>
                {coverMode === "link" ? (
                  <input id="coverUrl" type="url" aria-label="URL da capa" placeholder="https://exemplo.com/capa.jpg" value={form.coverUrl} onChange={set("coverUrl")} className="field" />
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" asChild>
                      <label className="cursor-pointer">
                        {uploading === "cover" ? <Loader2 className="animate-spin" /> : <ImagePlus />}
                        {form.coverImageId ? "Trocar imagem" : "Escolher imagem"}
                        <input type="file" accept="image/*" className="sr-only" aria-label="Enviar capa" onChange={(e) => upload(e, "cover")} disabled={!!uploading} />
                      </label>
                    </Button>
                    {form.coverImageId && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, coverImageId: undefined }))}>
                        Remover
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Gênero" htmlFor="genre">
              <input id="genre" placeholder="Ex: RPG, Ação" value={form.genre} onChange={set("genre")} className="field" />
            </Field>
            <Field label="Estúdio" htmlFor="studio">
              <input id="studio" placeholder="Ex: FromSoftware" value={form.studio} onChange={set("studio")} className="field" />
            </Field>
            <Field label="Publisher" htmlFor="publisher">
              <input id="publisher" placeholder="Ex: Bandai Namco" value={form.publisher} onChange={set("publisher")} className="field" />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Preço Pago" htmlFor="price">
              <div className="flex gap-2">
                <select
                  aria-label="Moeda da compra"
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as Currency }))}
                  className="field w-24 shrink-0"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.value === "BRL" ? "R$" : "€"}</option>
                  ))}
                </select>
                <input id="price" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={set("price")} className="field min-w-0 flex-1" />
              </div>
            </Field>
            <Field label="Data de Compra" htmlFor="purchaseDate">
              <input id="purchaseDate" type="date" value={form.purchaseDate} onChange={set("purchaseDate")} className="field" />
            </Field>
            <Field label="Horas Jogadas" htmlFor="hoursPlayed">
              <input id="hoursPlayed" type="number" min="0" step="0.5" placeholder="Ex: 45" value={form.hoursPlayed} onChange={set("hoursPlayed")} className="field" />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Status" htmlFor="status">
              <select id="status" value={form.status} onChange={set("status")} className="field">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Troféus Obtidos" htmlFor="trophiesUnlocked">
              <input id="trophiesUnlocked" type="number" min="0" placeholder="Ex: 35" value={form.trophiesUnlocked} onChange={set("trophiesUnlocked")} className="field" />
            </Field>
            <Field label="Total de Troféus" htmlFor="trophiesTotal">
              <input id="trophiesTotal" type="number" min="0" placeholder="Ex: 50" value={form.trophiesTotal} onChange={set("trophiesTotal")} className="field" />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Dificuldade" htmlFor="difficulty">
              <select id="difficulty" value={form.difficulty} onChange={set("difficulty")} className="field">
                <option value="">— Sem avaliação —</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Nota (Estrelas)" htmlFor="stars">
              <select id="stars" value={form.stars} onChange={set("stars")} className="field">
                <option value="">— Sem nota —</option>
                {STAR_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Veredito" htmlFor="verdict">
              <select id="verdict" value={form.verdict} onChange={set("verdict")} className="field">
                <option value="">— Sem veredito —</option>
                {VERDICTS.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Link do YouTube (Trailer / Review)" htmlFor="youtubeUrl">
            <input id="youtubeUrl" type="url" placeholder="https://www.youtube.com/watch?v=..." value={form.youtubeUrl} onChange={set("youtubeUrl")} className="field" />
          </Field>

          <Field label="Review Pessoal" htmlFor="review">
            <textarea id="review" rows={5} placeholder="Escreva suas impressões sobre o jogo..." value={form.review} onChange={set("review")} className="field" />
          </Field>

          <fieldset className="rounded-xl border-2 border-border p-3">
            <legend className="px-1 font-bold">Galeria de fotos</legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {form.photoIds.map((id, i) => (
                <div key={id} className="relative aspect-square overflow-hidden rounded-lg border-2 border-border">
                  <StoredImage id={id} alt={`Foto ${i + 1}`} className="h-full w-full" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, photoIds: f.photoIds.filter((p) => p !== id) }))}
                    className="absolute right-1 top-1 rounded bg-chip p-0.5 text-chip-foreground hover:bg-destructive"
                    aria-label={`Remover foto ${i + 1}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-input text-center text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary">
                {uploading === "gallery" ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
                Adicionar
                <input type="file" accept="image/*" multiple className="sr-only" aria-label="Adicionar fotos à galeria" onChange={(e) => upload(e, "gallery")} disabled={!!uploading} />
              </label>
            </div>
          </fieldset>

          <div className="flex justify-end gap-3 border-t-2 border-border pt-4">
            <Button type="button" variant="secondary" size="lg" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={!!uploading}>
              Salvar Jogo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block font-bold">
        {label}
      </label>
      {children}
    </div>
  );
}
