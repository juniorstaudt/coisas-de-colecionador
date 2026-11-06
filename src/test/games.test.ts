import { describe, expect, it } from "vitest";

import {
  SEED_GAMES,
  STORAGE_KEY,
  costPerHour,
  filterGames,
  formatPrice,
  isPlatinum,
  loadGames,
  upsertGame,
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

describe("currency conversion", () => {
  it("shows BRL prices unchanged", () => {
    expect(formatPrice(299.9, "BRL")).toBe("R$ 299.90");
  });
  it("converts to USD at 0.18", () => {
    expect(formatPrice(100, "USD")).toBe("$ 18.00");
  });
  it("converts to EUR at 0.17", () => {
    expect(formatPrice(100, "EUR")).toBe("€ 17.00");
  });
  it("shows Grátis when there is no price", () => {
    expect(formatPrice(undefined, "BRL")).toBe("Grátis");
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

describe("platinum badge", () => {
  it("is earned when all trophies are unlocked", () => {
    expect(isPlatinum({ trophiesUnlocked: 42, trophiesTotal: 42 })).toBe(true);
  });
  it("is not earned with trophies missing", () => {
    expect(isPlatinum({ trophiesUnlocked: 41, trophiesTotal: 42 })).toBe(false);
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
  it("filters by platform and status together", () => {
    expect(filterGames(games, { search: "", platform: "Switch", status: "Jogando" }).map((g) => g.id)).toEqual(["2"]);
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
  it("adds new games to the top of the collection", () => {
    expect(upsertGame([base], { ...base, id: "2", title: "Novo" })[0]?.title).toBe("Novo");
  });
});
