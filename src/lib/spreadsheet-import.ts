// Converts rows of the owner's "MyGameInventory - GameCatalogy" spreadsheet into games,
// and merges the imported list into a collection once.
import { SEED_GAMES, normalizeGame, type Game } from "@/lib/games";

export type SpreadsheetRow = Record<string, string | undefined>;

/** Euro → real rate used when the spreadsheet was imported (Frankfurter, 2026-11-06). */
export const IMPORT_EUR_TO_BRL = 6.1449;

/** localStorage flag so the spreadsheet is merged only once per browser. */
export const IMPORT_FLAG_KEY = "colecionador_import_planilha_v1";

const PLATFORM_MAP: Record<string, string> = {
  "playstation 5": "PS5",
  "playstation 4": "PS4",
  pc: "PC",
  switch: "Switch",
  xbox: "Xbox",
};

const DIFFICULTY_MAP: Record<string, string> = {
  facinho: "barbada",
  normal: "de boas",
  "difícil": "xarope",
  "muito difícil": "vai se ferrar",
  pesadelo: "pistola",
};

const RANK_MAP: Record<string, { verdict: string; stars: string }> = {
  masterpiece: { verdict: "Cinema", stars: "5" },
  "ótimo": { verdict: "Topzera", stars: "5" },
  "muito bom": { verdict: "Show de bola", stars: "4" },
  bom: { verdict: "Ta valendo", stars: "3" },
  "médio": { verdict: "Fraquinho", stars: "2" },
  ruim: { verdict: "Ruinzinho", stars: "2" },
};

const cell = (row: SpreadsheetRow, key: string) => (row[key] ?? "").trim();

/** "16/8/2024" → "2024-08-16"; anything else → "". */
export function spreadsheetDate(value: string): string {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  return m ? `${m[3]}-${m[2]!.padStart(2, "0")}-${m[1]!.padStart(2, "0")}` : "";
}

/** "299,9" → 299.9; "FREE", empty or invalid → 0. */
export function spreadsheetNumber(value: string): number {
  const n = Number(value.trim().replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function slug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** One spreadsheet row → game; rows without a title or platform are skipped. Prices end up in BRL. */
export function gameFromSpreadsheetRow(row: SpreadsheetRow, eurToBrl = IMPORT_EUR_TO_BRL): Game | null {
  const title = cell(row, "Game");
  const platformRaw = cell(row, "Platform");
  if (!title || !platformRaw) return null;

  const cost = spreadsheetNumber(cell(row, "Cost"));
  const isEuro = cell(row, "Currency") === "€";
  const price = Math.round((isEuro ? cost * eurToBrl : cost) * 100) / 100;

  const hours = spreadsheetNumber(cell(row, "Gameplay (h)"));
  const trophies = Math.min(100, Math.round(spreadsheetNumber(cell(row, "Trophies %").replace("%", ""))));
  const beaten = spreadsheetDate(cell(row, "Beaten in"));
  const status = beaten || trophies === 100 ? "Zerado" : hours > 0 ? "Jogando" : "Na Fila";

  const genre = [cell(row, "Genre"), cell(row, "Type")].filter(Boolean).join(" · ");
  const rank = RANK_MAP[cell(row, "Rank").toLowerCase()];

  const notes: string[] = [];
  if (beaten) notes.push(`Zerado em ${beaten.split("-").reverse().join("/")}.`);
  if (isEuro && cost > 0) notes.push(`Preço pago: € ${cost.toFixed(2).replace(".", ",")}.`);

  return normalizeGame({
    id: `planilha-${slug(title)}`,
    title,
    platform: PLATFORM_MAP[platformRaw.toLowerCase()] ?? "Retrô",
    genre,
    studio: cell(row, "Studio"),
    publisher: cell(row, "Publisher"),
    price,
    purchaseDate: spreadsheetDate(cell(row, "Bought in")),
    hoursPlayed: hours,
    status,
    trophiesUnlocked: trophies,
    trophiesTotal: trophies > 0 ? 100 : 0,
    difficulty: DIFFICULTY_MAP[cell(row, "Difficulty").toLowerCase()] ?? "",
    stars: rank?.stars ?? "",
    verdict: rank?.verdict ?? "",
    coverUrl: "",
    youtubeUrl: "",
    review: notes.join(" "),
    photoIds: [],
  });
}

const DEMO = SEED_GAMES[0]!;

/** Adds imported games not yet in the collection, and drops the untouched demo game. */
export function mergeImportedGames(games: Game[], imported: Game[]): Game[] {
  const kept = games.filter(
    (g) => !(g.id === DEMO.id && g.title === DEMO.title && g.review === DEMO.review),
  );
  const ids = new Set(kept.map((g) => g.id));
  return [...kept, ...imported.filter((g) => !ids.has(g.id))];
}
