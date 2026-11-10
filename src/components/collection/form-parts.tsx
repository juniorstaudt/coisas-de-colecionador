// Form pieces shared by the music and book forms (cover, gallery, price, rating).
import { ImagePlus, Link2, Loader2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { GameCover, StoredImage } from "@/components/collection/media";
import { Button } from "@/components/ui/button";
import { CURRENCIES, STAR_OPTIONS, type Currency } from "@/lib/games";
import { deleteImages, saveUploadedImage } from "@/lib/image-store";

export function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block font-bold">
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * Photos uploaded while a form is open. Ones not saved are deleted when the form closes,
 * so cancelled uploads don't pile up on the device.
 */
export function useFormImages(open: boolean) {
  const [uploading, setUploading] = useState<"cover" | "gallery" | null>(null);
  const added = useRef<string[]>([]);
  const saved = useRef(false);

  useEffect(() => {
    if (!open) return;
    added.current = [];
    saved.current = false;
  }, [open]);

  async function upload(e: ChangeEvent<HTMLInputElement>, target: "cover" | "gallery"): Promise<string[]> {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    e.target.value = "";
    if (!files.length) return [];
    setUploading(target);
    try {
      const ids = await Promise.all((target === "cover" ? files.slice(0, 1) : files).map(saveUploadedImage));
      added.current.push(...ids);
      return ids;
    } catch {
      toast.error("Não foi possível salvar a imagem neste aparelho.");
      return [];
    } finally {
      setUploading(null);
    }
  }

  return {
    uploading,
    upload,
    markSaved: () => {
      saved.current = true;
    },
    discardUnsaved: () => {
      if (!saved.current && added.current.length) void deleteImages(added.current);
    },
  };
}

interface CoverFieldsetProps {
  title: string;
  placeholder: string;
  mode: "link" | "upload";
  onModeChange: (mode: "link" | "upload") => void;
  coverUrl: string;
  onCoverUrlChange: (url: string) => void;
  coverImageId: string | undefined;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveUpload: () => void;
  uploading: boolean;
  disabled: boolean;
}

export function CoverFieldset(p: CoverFieldsetProps) {
  const preview = {
    title: p.title,
    coverUrl: p.mode === "link" ? p.coverUrl : "",
    coverImageId: p.mode === "upload" ? p.coverImageId : undefined,
  };
  return (
    <fieldset className="rounded-xl border-2 border-border p-3">
      <legend className="px-1 font-bold">Capa</legend>
      <div className="flex flex-col gap-3 sm:flex-row">
        <GameCover game={preview} placeholder={p.placeholder} className="h-28 w-full shrink-0 rounded-lg sm:w-44" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex gap-2" role="group" aria-label="Tipo de capa">
            <Button type="button" size="chip" variant={p.mode === "link" ? "default" : "secondary"} aria-pressed={p.mode === "link"} onClick={() => p.onModeChange("link")}>
              <Link2 /> Link
            </Button>
            <Button type="button" size="chip" variant={p.mode === "upload" ? "default" : "secondary"} aria-pressed={p.mode === "upload"} onClick={() => p.onModeChange("upload")}>
              <Upload /> Enviar foto
            </Button>
          </div>
          {p.mode === "link" ? (
            <input
              type="url"
              aria-label="URL da capa"
              placeholder="https://exemplo.com/capa.jpg"
              value={p.coverUrl}
              onChange={(e) => p.onCoverUrlChange(e.target.value)}
              className="field"
            />
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" asChild>
                <label className="cursor-pointer">
                  {p.uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
                  {p.coverImageId ? "Trocar imagem" : "Escolher imagem"}
                  <input type="file" accept="image/*" className="sr-only" aria-label="Enviar capa" onChange={p.onUpload} disabled={p.disabled} />
                </label>
              </Button>
              {p.coverImageId && (
                <Button type="button" variant="ghost" size="sm" onClick={p.onRemoveUpload}>
                  Remover
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </fieldset>
  );
}

interface GalleryFieldsetProps {
  photoIds: string[];
  onRemove: (id: string) => void;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  disabled: boolean;
}

export function GalleryFieldset({ photoIds, onRemove, onUpload, uploading, disabled }: GalleryFieldsetProps) {
  return (
    <fieldset className="rounded-xl border-2 border-border p-3">
      <legend className="px-1 font-bold">Galeria de fotos</legend>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {photoIds.map((id, i) => (
          <div key={id} className="relative aspect-square overflow-hidden rounded-lg border-2 border-border">
            <StoredImage id={id} alt={`Foto ${i + 1}`} className="h-full w-full" />
            <button
              type="button"
              onClick={() => onRemove(id)}
              className="absolute right-1 top-1 rounded bg-chip p-0.5 text-chip-foreground hover:bg-destructive"
              aria-label={`Remover foto ${i + 1}`}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-input text-center text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary">
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          Adicionar
          <input type="file" accept="image/*" multiple className="sr-only" aria-label="Adicionar fotos à galeria" onChange={onUpload} disabled={disabled} />
        </label>
      </div>
    </fieldset>
  );
}

export function PriceField({
  price,
  currency,
  onPriceChange,
  onCurrencyChange,
}: {
  price: string;
  currency: Currency;
  onPriceChange: (value: string) => void;
  onCurrencyChange: (value: Currency) => void;
}) {
  return (
    <Field label="Preço Pago" htmlFor="price">
      <div className="flex gap-2">
        <select
          aria-label="Moeda da compra"
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value as Currency)}
          className="field w-24 shrink-0"
        >
          {CURRENCIES.map((c) => (
            <option key={c.value} value={c.value}>{c.value === "BRL" ? "R$" : "€"}</option>
          ))}
        </select>
        <input id="price" type="number" min="0" step="0.01" placeholder="0.00" value={price} onChange={(e) => onPriceChange(e.target.value)} className="field min-w-0 flex-1" />
      </div>
    </Field>
  );
}

export function StarsField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Field label="Nota (Estrelas)" htmlFor="stars">
      <select id="stars" value={value} onChange={(e) => onChange(e.target.value)} className="field">
        <option value="">— Sem nota —</option>
        {STAR_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </Field>
  );
}

export function FormActions({ onCancel, disabled, label }: { onCancel: () => void; disabled: boolean; label: string }) {
  return (
    <div className="flex justify-end gap-3 border-t-2 border-border pt-4">
      <Button type="button" variant="secondary" size="lg" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" size="lg" disabled={disabled}>
        {label}
      </Button>
    </div>
  );
}
