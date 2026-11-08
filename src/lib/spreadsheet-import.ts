// Converts rows of the owner's "MyGameInventory - GameCatalogy" spreadsheet into games,
// and merges the imported list into a collection once.
import { SEED_GAMES, normalizeGame, type Game } from "@/lib/games";

export type SpreadsheetRow = Record<string, string | undefined>;

/** localStorage flag so the spreadsheet is merged only once per browser. */
export const IMPORT_FLAG_KEY = "colecionador_import_planilha_v1";
/** Set once spreadsheet games got back their original currency (they were first saved converted to R$). */
export const CURRENCY_FIX_FLAG_KEY = "colecionador_moeda_original_v1";

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

/** One spreadsheet row → game; rows without a title or platform are skipped. Prices stay in the currency paid. */
export function gameFromSpreadsheetRow(row: SpreadsheetRow): Game | null {
  const title = cell(row, "Game");
  const platformRaw = cell(row, "Platform");
  if (!title || !platformRaw) return null;

  const price = spreadsheetNumber(cell(row, "Cost"));
  const currency = cell(row, "Currency") === "€" ? "EUR" : "BRL";

  const hours = spreadsheetNumber(cell(row, "Gameplay (h)"));
  const trophies = Math.min(100, Math.round(spreadsheetNumber(cell(row, "Trophies %").replace("%", ""))));
  const beaten = spreadsheetDate(cell(row, "Beaten in"));
  const status = beaten || trophies === 100 ? "Zerado" : hours > 0 ? "Jogando" : "Na Fila";

  const genre = [cell(row, "Genre"), cell(row, "Type")].filter(Boolean).join(" · ");
  const rank = RANK_MAP[cell(row, "Rank").toLowerCase()];

  const notes: string[] = [];
  if (beaten) notes.push(`Zerado em ${beaten.split("-").reverse().join("/")}.`);

  return normalizeGame({
    id: `planilha-${slug(title)}`,
    title,
    platform: PLATFORM_MAP[platformRaw.toLowerCase()] ?? "Retrô",
    genre,
    studio: cell(row, "Studio"),
    publisher: cell(row, "Publisher"),
    price,
    currency,
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

/** Puts back the paid amount and currency on spreadsheet games saved before currencies were kept. */
export function restoreOriginalCurrencies(games: Game[], imported: Game[]): Game[] {
  const byId = new Map(imported.map((g) => [g.id, g]));
  return games.map((g) => {
    const source = byId.get(g.id);
    return source ? { ...g, price: source.price, currency: source.currency, review: stripPaidNote(g.review) } : g;
  });
}

function stripPaidNote(review: string): string {
  return review.replace(/\s*Preço pago: € [\d.,]+\./, "").trim();
}
