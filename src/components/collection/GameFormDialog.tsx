import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  DIFFICULTIES,
  PLATFORMS,
  STAR_OPTIONS,
  STATUSES,
  VERDICTS,
  type Game,
} from "@/lib/games";

interface FormState {
  title: string;
  platform: string;
  genre: string;
  studio: string;
  publisher: string;
  price: string;
  purchaseDate: string;
  hoursPlayed: string;
  status: string;
  trophiesUnlocked: string;
  trophiesTotal: string;
  difficulty: string;
  stars: string;
  verdict: string;
  coverUrl: string;
  youtubeUrl: string;
  review: string;
}

// A new game starts on the first option of each list, like the original form reset.
const EMPTY: FormState = {
  title: "",
  platform: PLATFORMS[0].value,
  genre: "",
  studio: "",
  publisher: "",
  price: "",
  purchaseDate: "",
  hoursPlayed: "",
  status: STATUSES[0],
  trophiesUnlocked: "",
  trophiesTotal: "",
  difficulty: DIFFICULTIES[0].value,
  stars: STAR_OPTIONS[0].value,
  verdict: VERDICTS[0].value,
  coverUrl: "",
  youtubeUrl: "",
  review: "",
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
    purchaseDate: g.purchaseDate || "",
    hoursPlayed: num(g.hoursPlayed),
    status: g.status,
    trophiesUnlocked: num(g.trophiesUnlocked),
    trophiesTotal: num(g.trophiesTotal),
    difficulty: g.difficulty || "de boas",
    stars: g.stars || "5",
    verdict: g.verdict || "Topzera",
    coverUrl: g.coverUrl || "",
    youtubeUrl: g.youtubeUrl || "",
    review: g.review || "",
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

  useEffect(() => {
    if (open) setForm(game ? fromGame(game) : EMPTY);
  }, [open, game]);

  const set =
    (key: keyof FormState) =>
    (e: { target: { value: string } }) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave({
      id: game?.id ?? Date.now().toString(),
      title: form.title,
      platform: form.platform,
      genre: form.genre,
      studio: form.studio,
      publisher: form.publisher,
      price: parseFloat(form.price) || 0,
      purchaseDate: form.purchaseDate,
      hoursPlayed: parseFloat(form.hoursPlayed) || 0,
      status: form.status,
      trophiesUnlocked: parseInt(form.trophiesUnlocked) || 0,
      trophiesTotal: parseInt(form.trophiesTotal) || 0,
      difficulty: form.difficulty,
      stars: form.stars,
      verdict: form.verdict,
      coverUrl: form.coverUrl,
      youtubeUrl: form.youtubeUrl,
      review: form.review,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pixel-border max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl bg-card sm:rounded-2xl">
        <div className="border-b-2 border-border pb-3 pr-8">
          <DialogTitle className="font-pixel text-sm leading-relaxed text-foreground">
            {game ? "Editar Jogo" : "Novo Jogo na Coleção"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preencha os dados do jogo e salve na sua coleção.
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
              <input id="price" type="number" step="0.01" placeholder="0.00" value={form.price} onChange={set("price")} className="field" />
            </Field>
            <Field label="Data de Compra" htmlFor="purchaseDate">
              <input id="purchaseDate" type="date" value={form.purchaseDate} onChange={set("purchaseDate")} className="field" />
            </Field>
            <Field label="Horas Jogadas" htmlFor="hoursPlayed">
              <input id="hoursPlayed" type="number" step="0.5" placeholder="Ex: 45" value={form.hoursPlayed} onChange={set("hoursPlayed")} className="field" />
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
              <input id="trophiesUnlocked" type="number" placeholder="Ex: 35" value={form.trophiesUnlocked} onChange={set("trophiesUnlocked")} className="field" />
            </Field>
            <Field label="Total de Troféus" htmlFor="trophiesTotal">
              <input id="trophiesTotal" type="number" placeholder="Ex: 50" value={form.trophiesTotal} onChange={set("trophiesTotal")} className="field" />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Dificuldade" htmlFor="difficulty">
              <select id="difficulty" value={form.difficulty} onChange={set("difficulty")} className="field">
                {DIFFICULTIES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Nota (Estrelas)" htmlFor="stars">
              <select id="stars" value={form.stars} onChange={set("stars")} className="field">
                {STAR_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Veredito" htmlFor="verdict">
              <select id="verdict" value={form.verdict} onChange={set("verdict")} className="field">
                {VERDICTS.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="URL da Capa (Imagem)" htmlFor="coverUrl">
            <input id="coverUrl" type="url" placeholder="https://exemplo.com/capa.jpg" value={form.coverUrl} onChange={set("coverUrl")} className="field" />
          </Field>

          <Field label="Link do YouTube (Trailer / Review)" htmlFor="youtubeUrl">
            <input id="youtubeUrl" type="url" placeholder="https://www.youtube.com/watch?v=..." value={form.youtubeUrl} onChange={set("youtubeUrl")} className="field" />
          </Field>

          <Field label="Review Pessoal" htmlFor="review">
            <textarea id="review" rows={3} placeholder="Escreva suas impressões sobre o jogo..." value={form.review} onChange={set("review")} className="field" />
          </Field>

          <div className="flex justify-end gap-3 border-t-2 border-border pt-4">
            <Button type="button" variant="secondary" size="lg" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="lg">
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
      <label htmlFor={htmlFor} className="mb-1 block font-bold text-foreground/90">
        {label}
      </label>
      {children}
    </div>
  );
}
