import { describe, expect, it } from "vitest";

import {
  SEED_GAMES,
  collectionTotals,
  STORAGE_KEY,
  costPerHour,
  filterGames,
  formatDate,
  formatPrice,
  imageIdsOf,
  isPlatinum,
  loadGames,
  normalizeGame,
  upsertGame,
  youtubeId,
  type Game,
} from "@/lib/games";

const base: Game = { ...SEED_GAMES[0]! };

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
}

describe("prices in the currency paid", () => {
  it("shows reais with Brazilian formatting", () => {
    expect(formatPrice(1299.9, "BRL")).toBe("R$ 1.299,90");
  });
  it("shows euros without converting", () => {
    expect(formatPrice(59.49, "EUR")).toBe("€ 59,49");
  });
  it("shows Grátis when there is no price", () => {
    expect(formatPrice(undefined, "BRL")).toBe("Grátis");
  });
  it("treats games saved without a currency as reais", () => {
    expect(normalizeGame({ title: "Old", price: 10 }).currency).toBe("BRL");
  });
});

describe("collection totals", () => {
  const games = [
    { price: 299.9, currency: "BRL" as const },
    { price: 100, currency: "BRL" as const },
    { price: 59.49, currency: "EUR" as const },
    { price: 0, currency: "BRL" as const },
  ];
  it("sums what was paid in reais", () => {
    expect(collectionTotals(games)[0]).toEqual({ currency: "BRL", total: 399.9, count: 2 });
  });
  it("sums what was paid in euros separately", () => {
    expect(collectionTotals(games)[1]).toEqual({ currency: "EUR", total: 59.49, count: 1 });
  });
});

describe("cost per hour", () => {
  it("divides price by hours played", () => {
    expect(costPerHour({ price: 300, hoursPlayed: 120 })).toBe(2.5);
  });
  it("is the full price when no hours were played", () => {
    expect(costPerHour({ price: 300, hoursPlayed: 0 })).toBe(300);
  });
});

describe("platinum seal", () => {
  it("is earned when trophies obtained equal the total", () => {
    expect(isPlatinum({ trophiesUnlocked: 50, trophiesTotal: 50 })).toBe(true);
  });
  it("is not earned at 35/50", () => {
    expect(isPlatinum({ trophiesUnlocked: 35, trophiesTotal: 50 })).toBe(false);
  });
  it("is not earned by a game with no trophies", () => {
    expect(isPlatinum({ trophiesUnlocked: 0, trophiesTotal: 0 })).toBe(false);
  });
});

describe("filters", () => {
  const games: Game[] = [
    base,
    { ...base, id: "2", title: "Zelda", platform: "Switch", studio: "Nintendo", publisher: "Nintendo", status: "Jogando" },
  ];
  it("searches by studio, case-insensitive", () => {
    expect(filterGames(games, { search: "fromsoft", platform: "", status: "" }).map((g) => g.id)).toEqual(["1"]);
  });
  it("searches by publisher", () => {
    expect(filterGames(games, { search: "nintendo", platform: "", status: "" }).map((g) => g.id)).toEqual(["2"]);
  });
  it("filters by platform and status together", () => {
    expect(filterGames(games, { search: "", platform: "Switch", status: "Jogando" }).map((g) => g.id)).toEqual(["2"]);
  });
});

describe("YouTube links", () => {
  it("reads watch links", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=E3Huy2cdih0")).toBe("E3Huy2cdih0");
  });
  it("reads youtu.be short links", () => {
    expect(youtubeId("https://youtu.be/E3Huy2cdih0?t=10")).toBe("E3Huy2cdih0");
  });
  it("reads shorts links", () => {
    expect(youtubeId("https://youtube.com/shorts/E3Huy2cdih0")).toBe("E3Huy2cdih0");
  });
  it("rejects non-YouTube links", () => {
    expect(youtubeId("https://vimeo.com/123")).toBeNull();
  });
});

describe("dates", () => {
  it("shows purchase dates as dd/mm/yyyy", () => {
    expect(formatDate("2022-02-25")).toBe("25/02/2022");
  });
});

describe("storage", () => {
  it("starts with the Elden Ring seed when nothing is saved", () => {
    expect(loadGames(memoryStorage()).map((g) => g.title)).toEqual(["Elden Ring"]);
  });
  it("reads a previously saved collection from the original key", () => {
    const saved = [{ ...base, id: "9", title: "Hades" }];
    expect(loadGames(memoryStorage({ [STORAGE_KEY]: JSON.stringify(saved) }))[0]?.title).toBe("Hades");
  });
  it("gives games saved by the old version an empty gallery", () => {
    const { photoIds: _omit, ...old } = base;
    expect(loadGames(memoryStorage({ [STORAGE_KEY]: JSON.stringify([old]) }))[0]?.photoIds).toEqual([]);
  });
  it("adds new games to the top of the collection", () => {
    expect(upsertGame([base], { ...base, id: "2", title: "Novo" })[0]?.title).toBe("Novo");
  });
  it("tracks the uploaded cover and gallery photos of a game", () => {
    expect(imageIdsOf({ coverImageId: "c", photoIds: ["p1", "p2"] })).toEqual(["c", "p1", "p2"]);
  });
});
