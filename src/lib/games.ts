// Game collection model and rules for "Coisas de Colecionador".

/** Currency a game was bought in; prices are kept exactly as paid, never converted. */
export type Currency = "BRL" | "EUR";

export const SYMBOLS: Record<Currency, string> = { BRL: "R$", EUR: "€" };
export const CURRENCIES: { value: Currency; label: string }[] = [
  { value: "BRL", label: "R$ (Real)" },
  { value: "EUR", label: "€ (Euro)" },
];

/** Collection types. Only games exist today; music and books are planned. */
export const COLLECTION_KINDS = [
  { id: "games", label: "Jogos", emoji: "🎮", available: true },
  { id: "music", label: "Música", emoji: "🎵", available: false },
  { id: "books", label: "Livros", emoji: "📚", available: false },
] as const;

export const PLATFORMS = [
  { value: "PC", label: "PC" },
  { value: "PS5", label: "PS5" },
  { value: "PS4", label: "PS4" },
  { value: "Switch", label: "Nintendo Switch" },
  { value: "Xbox", label: "Xbox" },
  { value: "Retrô", label: "Retrô / Outros" },
] as const;

export const STATUSES = ["Zerado", "Jogando", "Na Fila", "Abandonado"] as const;

export const DIFFICULTIES = [
  { value: "barbada", short: "Barbada", label: "Barbada (Fácil)" },
  { value: "de boas", short: "De boas", label: "De boas (Normal)" },
  { value: "xarope", short: "Xarope", label: "Xarope (Difícil)" },
  { value: "vai se ferrar", short: "Vai se ferrar", label: "Vai se ferrar (Muito Difícil)" },
  { value: "pistola", short: "Pistola", label: "Pistola (Pesadelo)" },
] as const;

export const STAR_OPTIONS = [
  { value: "5", label: "⭐⭐⭐⭐⭐ (5/5)" },
  { value: "4", label: "⭐⭐⭐⭐ (4/5)" },
  { value: "3", label: "⭐⭐⭐ (3/5)" },
  { value: "2", label: "⭐⭐ (2/5)" },
  { value: "1", label: "⭐ (1/5)" },
] as const;

export const VERDICTS = [
  { value: "Nem joga", short: "Nem joga", label: "Nem joga (Péssimo)" },
  { value: "Ruinzinho", short: "Ruinzinho", label: "Ruinzinho (Ruim)" },
  { value: "Fraquinho", short: "Fraquinho", label: "Fraquinho (Mediocre)" },
  { value: "Ta valendo", short: "Tá valendo", label: "Tá valendo (Bom)" },
  { value: "Show de bola", short: "Show de bola", label: "Show de bola (Muito Bom)" },
  { value: "Topzera", short: "Topzera", label: "Topzera (Ótimo)" },
  { value: "Cinema", short: "Cinema", label: "Cinema (Jogo da vida / Obra de arte)" },
] as const;

export interface Game {
  id: string;
  title: string;
  platform: string;
  genre: string;
  studio: string;
  publisher: string;
  /** Amount paid, in `currency`. */
  price: number;
  currency: Currency;
  purchaseDate: string;
  hoursPlayed: number;
  status: string;
  trophiesUnlocked: number;
  trophiesTotal: number;
  difficulty: string;
  stars: string;
  verdict: string;
  coverUrl: string;
  /** Uploaded cover kept on this device; takes precedence over coverUrl. */
  coverImageId?: string | undefined;
  youtubeUrl: string;
  review: string;
  /** Extra photos uploaded by the user, kept on this device. */
  photoIds: string[];
}

export const STORAGE_KEY = "colecionador_jogos";

export const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=900&auto=format&fit=crop";

export const SEED_GAMES: Game[] = [
  {
    id: "1",
    title: "Elden Ring",
    platform: "PS5",
    genre: "RPG de Ação",
    studio: "FromSoftware",
    publisher: "Bandai Namco",
    price: 299.9,
    currency: "BRL",
    purchaseDate: "2022-02-25",
    hoursPlayed: 120,
    status: "Zerado",
    trophiesUnlocked: 42,
    trophiesTotal: 42,
    difficulty: "pistola",
    stars: "5",
    verdict: "Cinema",
    coverUrl:
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=900&auto=format&fit=crop",
    youtubeUrl: "https://www.youtube.com/watch?v=E3Huy2cdih0",
    review: "Uma obra-prima absoluta que redefiniu os jogos de mundo aberto.",
    photoIds: [],
  },
];

const NUMBER = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "R$ 1.299,90" / "€ 59,49". Missing values read "Grátis"; 0 is shown as a price. */
export function formatPrice(value: number | null | undefined, currency: Currency): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "Grátis";
  return `${SYMBOLS[currency]} ${NUMBER.format(value)}`;
}

export interface CurrencyTotal {
  currency: Currency;
  total: number;
  /** Games bought in this currency with a price above zero. */
  count: number;
}

/** Sum of what was paid, per purchase currency (no conversion between them). */
export function collectionTotals(games: Pick<Game, "price" | "currency">[]): CurrencyTotal[] {
  return CURRENCIES.map(({ value }) => {
    const paid = games.filter((g) => g.currency === value && g.price > 0);
    const total = Math.round(paid.reduce((sum, g) => sum + g.price, 0) * 100) / 100;
    return { currency: value, total, count: paid.length };
  });
}

/** Price divided by hours played; with no hours, the full price. */
export function costPerHour(game: Pick<Game, "price" | "hoursPlayed">): number {
  return game.hoursPlayed > 0 ? game.price / game.hoursPlayed : game.price;
}

/** Platina (100%) when every trophy of a game with trophies is unlocked. */
export function isPlatinum(game: Pick<Game, "trophiesUnlocked" | "trophiesTotal">): boolean {
  return (
    Number(game.trophiesTotal) > 0 && Number(game.trophiesUnlocked) >= Number(game.trophiesTotal)
  );
}

export function trophyProgress(game: Pick<Game, "trophiesUnlocked" | "trophiesTotal">): number {
  const total = Number(game.trophiesTotal);
  if (!total) return 0;
  return Math.min(100, Math.round((Number(game.trophiesUnlocked) / total) * 100));
}

/** Unrated games ("") show no stars. */
export function starCount(stars: string): number {
  if (stars === "") return 0;
  return Number(stars) || 5;
}

export function difficultyName(value: string): string {
  if (!value) return "—";
  return DIFFICULTIES.find((d) => d.value === value)?.short ?? value;
}

export function verdictName(value: string): string {
  if (!value) return "Sem veredito";
  return VERDICTS.find((v) => v.value === value)?.short ?? value;
}

/** "2022-02-25" -> "25/02/2022" without timezone shifts. */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "—";
}

/** Extracts the 11-char video id from watch, youtu.be, shorts, embed and live links. */
export function youtubeId(url: string): string | null {
  const m =
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/.exec(
      url,
    );
  return m?.[1] ?? null;
}

/** Every device-stored image a game references (cover upload + gallery). */
export function imageIdsOf(game: Pick<Game, "coverImageId" | "photoIds">): string[] {
  return [game.coverImageId, ...(game.photoIds ?? [])].filter((id): id is string => !!id);
}

export interface GameFilters {
  search: string;
  platform: string;
  status: string;
}

/** Search matches title, studio or publisher (case-insensitive); empty platform/status match all. */
export function filterGames(games: Game[], { search, platform, status }: GameFilters): Game[] {
  const term = search.trim().toLowerCase();
  return games.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(term) ||
      (!!g.studio && g.studio.toLowerCase().includes(term)) ||
      (!!g.publisher && g.publisher.toLowerCase().includes(term));
    const matchesPlatform = !platform || g.platform === platform;
    const matchesStatus = !status || g.status === status;
    return matchesSearch && matchesPlatform && matchesStatus;
  });
}

/** Fills fields missing from games saved by older versions. */
export function normalizeGame(raw: Partial<Game>): Game {
  return {
    id: String(raw.id ?? ""),
    title: raw.title ?? "",
    platform: raw.platform ?? "PC",
    genre: raw.genre ?? "",
    studio: raw.studio ?? "",
    publisher: raw.publisher ?? "",
    price: Number(raw.price) || 0,
    currency: raw.currency === "EUR" ? "EUR" : "BRL",
    purchaseDate: raw.purchaseDate ?? "",
    hoursPlayed: Number(raw.hoursPlayed) || 0,
    status: raw.status ?? "Na Fila",
    trophiesUnlocked: Number(raw.trophiesUnlocked) || 0,
    trophiesTotal: Number(raw.trophiesTotal) || 0,
    difficulty: raw.difficulty ?? "de boas",
    stars: raw.stars ?? "5",
    verdict: raw.verdict ?? "Topzera",
    coverUrl: raw.coverUrl ?? "",
    coverImageId: raw.coverImageId || undefined,
    youtubeUrl: raw.youtubeUrl ?? "",
    review: raw.review ?? "",
    photoIds: Array.isArray(raw.photoIds) ? raw.photoIds : [],
  };
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function loadGames(storage: StorageLike): Game[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return Array.isArray(parsed)
      ? (parsed as Partial<Game>[]).map(normalizeGame)
      : SEED_GAMES.map((g) => ({ ...g }));
  } catch {
    return SEED_GAMES.map((g) => ({ ...g }));
  }
}

export function saveGames(storage: StorageLike, games: Game[]): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(games));
}

/** Inserts a new game at the top, or replaces the game with the same id. */
export function upsertGame(games: Game[], game: Game): Game[] {
  const index = games.findIndex((g) => g.id === game.id);
  if (index === -1) return [game, ...games];
  const next = games.slice();
  next[index] = game;
  return next;
}
