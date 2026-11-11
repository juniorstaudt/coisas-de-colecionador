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
import { BOOK_FORMATS, BOOK_STATUSES, normalizeBook, type Book } from "@/lib/books";
import type { Currency } from "@/lib/games";

interface FormState {
  title: string;
  author: string;
  publisher: string;
  genre: string;
  format: string;
  pages: string;
  status: string;
  price: string;
  currency: Currency;
  purchaseDate: string;
  stars: string;
  review: string;
  coverUrl: string;
  coverImageId?: string | undefined;
  photoIds: string[];
}

const EMPTY: FormState = {
  title: "",
  author: "",
  publisher: "",
  genre: "",
  format: BOOK_FORMATS[0],
  pages: "",
  status: "Na Fila",
  price: "",
  currency: "BRL",
  purchaseDate: "",
  stars: "",
  review: "",
  coverUrl: "",
  coverImageId: undefined,
  photoIds: [],
};

function fromBook(b: Book): FormState {
  return {
    ...b,
    pages: b.pages ? String(b.pages) : "",
    price: b.price ? String(b.price) : "",
    photoIds: [...b.photoIds],
  };
}

interface Props {
  open: boolean;
  book: Book | null;
  onOpenChange: (open: boolean) => void;
  onSave: (book: Book) => void;
}

export function BookFormDialog({ open, book, onOpenChange, onSave }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [coverMode, setCoverMode] = useState<"link" | "upload">("link");
  const images = useFormImages(open);

  useEffect(() => {
    if (!open) return;
    setForm(book ? fromBook(book) : EMPTY);
    setCoverMode(book?.coverImageId ? "upload" : "link");
  }, [open, book]);

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
      normalizeBook({
        ...form,
        id: book?.id ?? `livro-${Date.now()}`,
        title: form.title.trim(),
        author: form.author.trim(),
        pages: parseInt(form.pages) || 0,
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
            {book ? "Editar Livro" : "Novo Livro na Coleção"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-muted-foreground">
            Fotos enviadas ficam salvas neste aparelho.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Título do Livro*" htmlFor="title">
              <input
                id="title"
                required
                value={form.title}
                onChange={set("title")}
                className="field"
              />
            </Field>
            <Field label="Autor*" htmlFor="author">
              <input
                id="author"
                required
                value={form.author}
                onChange={set("author")}
                className="field"
              />
            </Field>
          </div>

          <CoverFieldset
            title={form.title || "Novo livro"}
            placeholder="📚"
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
            <Field label="Editora" htmlFor="publisher">
              <input
                id="publisher"
                placeholder="Ex: Companhia das Letras"
                value={form.publisher}
                onChange={set("publisher")}
                className="field"
              />
            </Field>
            <Field label="Gênero" htmlFor="genre">
              <input
                id="genre"
                placeholder="Ex: Ficção, Fantasia"
                value={form.genre}
                onChange={set("genre")}
                className="field"
              />
            </Field>
            <Field label="Formato" htmlFor="format">
              <select id="format" value={form.format} onChange={set("format")} className="field">
                {BOOK_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
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
            <Field label="Páginas" htmlFor="pages">
              <input
                id="pages"
                type="number"
                min="0"
                placeholder="Ex: 320"
                value={form.pages}
                onChange={set("pages")}
                className="field"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Status" htmlFor="status">
              <select id="status" value={form.status} onChange={set("status")} className="field">
                {BOOK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <StarsField
              value={form.stars}
              onChange={(stars) => setForm((f) => ({ ...f, stars }))}
            />
          </div>

          <Field label="Review Pessoal" htmlFor="review">
            <textarea
              id="review"
              rows={4}
              placeholder="O que você achou do livro?"
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
            label="Salvar Livro"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
