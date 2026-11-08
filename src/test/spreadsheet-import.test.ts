import { describe, expect, it } from "vitest";

import { SEED_GAMES, starCount } from "@/lib/games";
import { gameFromSpreadsheetRow, mergeImportedGames, spreadsheetDate } from "@/lib/spreadsheet-import";

const row = {
  Game: "Astro Bot",
  Platform: "Playstation 5",
  Genre: "3D Platform",
  Type: "Cartoon",
  Studio: "Team Asobi",
  Publisher: "SIE",
  "Beaten in": "9/11/2024",
  "Gameplay (h)": "29",
  "Trophies %": "100%",
  Difficulty: "Normal",
  Rank: "Masterpiece",
  "Bought in": "30/8/2024",
  Currency: "€",
  Cost: "59,49",
};

describe("spreadsheet import", () => {
  it("converts euro prices to BRL at the import rate", () => {
    expect(gameFromSpreadsheetRow(row, 6)?.price).toBe(356.94);
  });
  it("keeps real prices as they are", () => {
    expect(gameFromSpreadsheetRow({ ...row, Currency: "R$", Cost: "299,9" })?.price).toBe(299.9);
  });
  it("reads FREE as price 0", () => {
    expect(gameFromSpreadsheetRow({ ...row, Cost: "FREE" })?.price).toBe(0);
  });
  it("maps Playstation 4 to PS4", () => {
    expect(gameFromSpreadsheetRow({ ...row, Platform: "Playstation 4" })?.platform).toBe("PS4");
  });
  it("marks a beaten game as Zerado", () => {
    expect(gameFromSpreadsheetRow({ ...row, "Trophies %": "" })?.status).toBe("Zerado");
  });
  it("marks a game with hours but not beaten as Jogando", () => {
    expect(gameFromSpreadsheetRow({ ...row, "Beaten in": "", "Trophies %": "" })?.status).toBe("Jogando");
  });
  it("marks a game with no hours as Na Fila", () => {
    expect(
      gameFromSpreadsheetRow({ ...row, "Beaten in": "", "Trophies %": "", "Gameplay (h)": "" })?.status,
    ).toBe("Na Fila");
  });
  it("turns 100% trophies into a platinum counter", () => {
    const g = gameFromSpreadsheetRow(row);
    expect([g?.trophiesUnlocked, g?.trophiesTotal]).toEqual([100, 100]);
  });
  it("maps the difficulty scale", () => {
    expect(gameFromSpreadsheetRow({ ...row, Difficulty: "Facinho" })?.difficulty).toBe("barbada");
    expect(gameFromSpreadsheetRow({ ...row, Difficulty: "Difícil" })?.difficulty).toBe("xarope");
    expect(gameFromSpreadsheetRow({ ...row, Difficulty: "Muito Difícil" })?.difficulty).toBe("vai se ferrar");
  });
  it("maps Masterpiece to Cinema with 5 stars", () => {
    const g = gameFromSpreadsheetRow(row);
    expect([g?.verdict, g?.stars]).toEqual(["Cinema", "5"]);
  });
  it("leaves unrated games without stars", () => {
    expect(starCount(gameFromSpreadsheetRow({ ...row, Rank: "" })!.stars)).toBe(0);
  });
  it("reads day/month/year dates", () => {
    expect(spreadsheetDate("6/2/2026")).toBe("2026-02-06");
  });
  it("skips rows without a title", () => {
    expect(gameFromSpreadsheetRow({ ...row, Game: "" })).toBeNull();
  });
  it("merges once: no duplicates, drops the untouched demo game", () => {
    const imported = [gameFromSpreadsheetRow(row)!];
    const once = mergeImportedGames([{ ...SEED_GAMES[0]! }], imported);
    expect(mergeImportedGames(once, imported).map((g) => g.title)).toEqual(["Astro Bot"]);
  });
});
