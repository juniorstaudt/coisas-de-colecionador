// Book collection model for "Coisas de Colecionador".
import type { Currency } from "@/lib/games";
import { matchesSearch } from "@/lib/local-collection";

export const BOOKS_STORAGE_KEY = "colecionador_livros";

export const BOOK_FORMATS = ["Físico", "Capa dura", "E-book", "Audiobook"] as const;
export const BOOK_STATUSES = ["Lido", "Lendo", "Na Fila", "Abandonado"] as const;

export interface Book {
  id: string;
  title: string;
  author: string;
  /** Editora. */
  publisher: string;
  genre: string;
  format: string;
  pages: number;
  status: string;
  price: number;
  currency: Currency;
  purchaseDate: string;
  /** "" = not rated yet. */
  stars: string;
  review: string;
  coverUrl: string;
  coverImageId?: string | undefined;
  photoIds: string[];
}

export function normalizeBook(raw: Partial<Book>): Book {
  return {
    id: String(raw.id ?? ""),
    title: raw.title ?? "",
    author: raw.author ?? "",
    publisher: raw.publisher ?? "",
    genre: raw.genre ?? "",
    format: raw.format ?? BOOK_FORMATS[0],
    pages: Number(raw.pages) || 0,
    status: raw.status ?? "Na Fila",
    price: Number(raw.price) || 0,
    currency: raw.currency === "EUR" ? "EUR" : "BRL",
    purchaseDate: raw.purchaseDate ?? "",
    stars: raw.stars ?? "",
    review: raw.review ?? "",
    coverUrl: raw.coverUrl ?? "",
    coverImageId: raw.coverImageId || undefined,
    photoIds: Array.isArray(raw.photoIds) ? raw.photoIds : [],
  };
}

export interface BookFilters {
  search: string;
  format: string;
  status: string;
}

/** Search matches title, author or publisher; empty format/status match all. */
export function filterBooks(books: Book[], { search, format, status }: BookFilters): Book[] {
  return books.filter(
    (b) =>
      matchesSearch(search, b.title, b.author, b.publisher) &&
      (!format || b.format === format) &&
      (!status || b.status === status),
  );
}
