// Music collection model (albums) for "Coisas de Colecionador".
import type { Currency } from "@/lib/games";
import { matchesSearch } from "@/lib/local-collection";

export const MUSIC_STORAGE_KEY = "colecionador_musicas";

export const MUSIC_FORMATS = ["Vinil", "CD", "Cassete", "Digital", "Outro"] as const;

export interface Album {
  id: string;
  /** Album name. */
  title: string;
  artist: string;
  format: string;
  genre: string;
  /** Record label (gravadora). */
  label: string;
  releaseYear: string;
  price: number;
  currency: Currency;
  purchaseDate: string;
  /** "" = not rated yet. */
  stars: string;
  review: string;
  coverUrl: string;
  coverImageId?: string | undefined;
  youtubeUrl: string;
  photoIds: string[];
}

export function normalizeAlbum(raw: Partial<Album>): Album {
  return {
    id: String(raw.id ?? ""),
    title: raw.title ?? "",
    artist: raw.artist ?? "",
    format: raw.format ?? MUSIC_FORMATS[0],
    genre: raw.genre ?? "",
    label: raw.label ?? "",
    releaseYear: raw.releaseYear ? String(raw.releaseYear) : "",
    price: Number(raw.price) || 0,
    currency: raw.currency === "EUR" ? "EUR" : "BRL",
    purchaseDate: raw.purchaseDate ?? "",
    stars: raw.stars ?? "",
    review: raw.review ?? "",
    coverUrl: raw.coverUrl ?? "",
    coverImageId: raw.coverImageId || undefined,
    youtubeUrl: raw.youtubeUrl ?? "",
    photoIds: Array.isArray(raw.photoIds) ? raw.photoIds : [],
  };
}

export interface AlbumFilters {
  search: string;
  format: string;
}

/** Search matches album, artist or label; empty format matches all. */
export function filterAlbums(albums: Album[], { search, format }: AlbumFilters): Album[] {
  return albums.filter(
    (a) => matchesSearch(search, a.title, a.artist, a.label) && (!format || a.format === format),
  );
}
