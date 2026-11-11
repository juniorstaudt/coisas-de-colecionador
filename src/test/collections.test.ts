import { describe, expect, it } from "vitest";

import { BOOKS_STORAGE_KEY, filterBooks, normalizeBook } from "@/lib/books";
import { COLLECTION_KINDS, STORAGE_KEY, validateNewItemSearch } from "@/lib/games";
import { loadItems, upsertItem } from "@/lib/local-collection";
import { MUSIC_STORAGE_KEY, filterAlbums, normalizeAlbum } from "@/lib/music";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
}

describe("Adicionar Item sections", () => {
  it("offers Jogo, Música and Livro", () => {
    expect(COLLECTION_KINDS.map((k) => k.item)).toEqual(["Jogo", "Música", "Livro"]);
  });
  it("sends each choice to its own section", () => {
    expect(COLLECTION_KINDS.map((k) => k.to)).toEqual(["/", "/musica", "/livros"]);
  });
  it("reads the open-new-item request from the address", () => {
    expect(validateNewItemSearch({ novo: "1" })).toEqual({ novo: 1 });
    expect(validateNewItemSearch({})).toEqual({});
  });
});

describe("saved data stays separate", () => {
  it("music and books never use the games storage", () => {
    expect(new Set([STORAGE_KEY, MUSIC_STORAGE_KEY, BOOKS_STORAGE_KEY]).size).toBe(3);
  });
  it("keeps the games storage name unchanged", () => {
    expect(STORAGE_KEY).toBe("colecionador_jogos");
  });
  it("starts music empty when nothing is saved", () => {
    expect(loadItems(memoryStorage(), MUSIC_STORAGE_KEY, normalizeAlbum)).toEqual([]);
  });
  it("reads saved books back", () => {
    const saved = JSON.stringify([{ id: "b1", title: "Duna", author: "Frank Herbert" }]);
    const storage = memoryStorage({ [BOOKS_STORAGE_KEY]: saved });
    expect(loadItems(storage, BOOKS_STORAGE_KEY, normalizeBook)[0]?.author).toBe("Frank Herbert");
  });
  it("adds new items to the top", () => {
    const a = normalizeAlbum({ id: "1", title: "A" });
    expect(upsertItem([a], normalizeAlbum({ id: "2", title: "B" }))[0]?.title).toBe("B");
  });
});

describe("music filters", () => {
  const albums = [
    normalizeAlbum({
      id: "1",
      title: "The Dark Side of the Moon",
      artist: "Pink Floyd",
      format: "Vinil",
    }),
    normalizeAlbum({ id: "2", title: "Nevermind", artist: "Nirvana", format: "CD", label: "DGC" }),
  ];
  it("searches by artist, case-insensitive", () => {
    expect(filterAlbums(albums, { search: "pink", format: "" }).map((a) => a.id)).toEqual(["1"]);
  });
  it("filters by format", () => {
    expect(filterAlbums(albums, { search: "", format: "CD" }).map((a) => a.id)).toEqual(["2"]);
  });
});

describe("book filters", () => {
  const books = [
    normalizeBook({
      id: "1",
      title: "Duna",
      author: "Frank Herbert",
      format: "Físico",
      status: "Lido",
    }),
    normalizeBook({
      id: "2",
      title: "1984",
      author: "George Orwell",
      format: "E-book",
      status: "Lendo",
    }),
  ];
  it("searches by author", () => {
    expect(
      filterBooks(books, { search: "orwell", format: "", status: "" }).map((b) => b.id),
    ).toEqual(["2"]);
  });
  it("filters by format and status together", () => {
    expect(
      filterBooks(books, { search: "", format: "Físico", status: "Lido" }).map((b) => b.id),
    ).toEqual(["1"]);
  });
  it("new books start unrated and in the queue", () => {
    const b = normalizeBook({ title: "X" });
    expect([b.stars, b.status]).toEqual(["", "Na Fila"]);
  });
});
