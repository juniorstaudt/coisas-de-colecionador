import { useEffect, useState, type FormEvent } from "react";

import {
  CoverFieldset,
  Field,
  FormActions,
  GalleryFieldset,
  PriceField,
  StarsField,
  useFormImages,
} from "@/components/collection/form-parts";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Currency } from "@/lib/games";
import { MUSIC_FORMATS, normalizeAlbum, type Album } from "@/lib/music";

interface FormState {
  title: string;
  artist: string;
  format: string;
  genre: string;
  label: string;
  releaseYear: string;
  price: string;
  currency: Currency;
  purchaseDate: string;
  stars: string;
  review: string;
  coverUrl: string;
  coverImageId?: string | undefined;
  youtubeUrl: string;
  photoIds: string[];
}

const EMPTY: FormState = {
  title: "",
  artist: "",
  format: MUSIC_FORMATS[0],
  genre: "",
  label: "",
  releaseYear: "",
  price: "",
  currency: "BRL",
  purchaseDate: "",
  stars: "",
  review: "",
  coverUrl: "",
  coverImageId: undefined,
  youtubeUrl: "",
  photoIds: [],
};

function fromAlbum(a: Album): FormState {
  return { ...a, price: a.price ? String(a.price) : "", photoIds: [...a.photoIds] };
}

interface Props {
  open: boolean;
  album: Album | null;
  onOpenChange: (open: boolean) => void;
  onSave: (album: Album) => void;
}

export function AlbumFormDialog({ open, album, onOpenChange, onSave }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [coverMode, setCoverMode] = useState<"link" | "upload">("link");
  const images = useFormImages(open);

  useEffect(() => {
    if (!open) return;
    setForm(album ? fromAlbum(album) : EMPTY);
    setCoverMode(album?.coverImageId ? "upload" : "link");
  }, [open, album]);

  function handleOpenChange(next: boolean) {
    if (!next) images.discardUnsaved();
    onOpenChange(next);
  }

  const set = (key: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    images.markSaved();
    onSave(
      normalizeAlbum({
        ...form,
        id: album?.id ?? `musica-${Date.now()}`,
        title: form.title.trim(),
        artist: form.artist.trim(),
        price: parseFloat(form.price) || 0,
        coverImageId: coverMode === "upload" ? form.coverImageId : undefined,
      }),
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="pixel-border max-h-[92vh] max-w-2xl overflow-y-auto rounded-2xl bg-card p-5 sm:rounded-2xl sm:p-6">
        <div className="border-b-2 border-border pb-3 pr-8">
          <DialogTitle className="font-pixel text-xs leading-relaxed sm:text-sm">
            {album ? "Editar Música" : "Nova Música na Coleção"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-muted-foreground">
            Fotos enviadas ficam salvas neste aparelho.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Álbum*" htmlFor="title">
              <input
                id="title"
                required
                value={form.title}
                onChange={set("title")}
                className="field"
              />
            </Field>
            <Field label="Artista*" htmlFor="artist">
              <input
                id="artist"
                required
                value={form.artist}
                onChange={set("artist")}
                className="field"
              />
            </Field>
          </div>

          <CoverFieldset
            title={form.title || "Nova música"}
            placeholder="🎵"
            mode={coverMode}
            onModeChange={setCoverMode}
            coverUrl={form.coverUrl}
            onCoverUrlChange={(coverUrl) => setForm((f) => ({ ...f, coverUrl }))}
            coverImageId={form.coverImageId}
            onUpload={async (e) => {
              const [id] = await images.upload(e, "cover");
              if (id) setForm((f) => ({ ...f, coverImageId: id }));
            }}
            onRemoveUpload={() => setForm((f) => ({ ...f, coverImageId: undefined }))}
            uploading={images.uploading === "cover"}
            disabled={!!images.uploading}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Formato" htmlFor="format">
              <select id="format" value={form.format} onChange={set("format")} className="field">
                {MUSIC_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Gênero" htmlFor="genre">
              <input
                id="genre"
                placeholder="Ex: Rock, Jazz"
                value={form.genre}
                onChange={set("genre")}
                className="field"
              />
            </Field>
            <Field label="Gravadora" htmlFor="label">
              <input
                id="label"
                placeholder="Ex: Sony Music"
                value={form.label}
                onChange={set("label")}
                className="field"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <PriceField
              price={form.price}
              currency={form.currency}
              onPriceChange={(price) => setForm((f) => ({ ...f, price }))}
              onCurrencyChange={(currency) => setForm((f) => ({ ...f, currency }))}
            />
            <Field label="Data de Compra" htmlFor="purchaseDate">
              <input
                id="purchaseDate"
                type="date"
                value={form.purchaseDate}
                onChange={set("purchaseDate")}
                className="field"
              />
            </Field>
            <Field label="Ano de Lançamento" htmlFor="releaseYear">
              <input
                id="releaseYear"
                type="number"
                min="1800"
                max="2100"
                placeholder="Ex: 1973"
                value={form.releaseYear}
                onChange={set("releaseYear")}
                className="field"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <StarsField
              value={form.stars}
              onChange={(stars) => setForm((f) => ({ ...f, stars }))}
            />
            <Field label="Link do YouTube" htmlFor="youtubeUrl">
              <input
                id="youtubeUrl"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.youtubeUrl}
                onChange={set("youtubeUrl")}
                className="field"
              />
            </Field>
          </div>

          <Field label="Review Pessoal" htmlFor="review">
            <textarea
              id="review"
              rows={4}
              placeholder="O que você acha desse álbum?"
              value={form.review}
              onChange={set("review")}
              className="field"
            />
          </Field>

          <GalleryFieldset
            photoIds={form.photoIds}
            onRemove={(id) =>
              setForm((f) => ({ ...f, photoIds: f.photoIds.filter((p) => p !== id) }))
            }
            onUpload={async (e) => {
              const ids = await images.upload(e, "gallery");
              if (ids.length) setForm((f) => ({ ...f, photoIds: [...f.photoIds, ...ids] }));
            }}
            uploading={images.uploading === "gallery"}
            disabled={!!images.uploading}
          />

          <FormActions
            onCancel={() => handleOpenChange(false)}
            disabled={!!images.uploading}
            label="Salvar Música"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
