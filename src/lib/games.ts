// Game collection model and rules, ported from the original "Coisas de Colecionador" HTML app.

export type Currency = "BRL" | "USD" | "EUR";

export const RATES: Record<Currency, number> = { BRL: 1, USD: 0.18, EUR: 0.17 };
export const SYMBOLS: Record<Currency, string> = { BRL: "R$", USD: "$", EUR: "€" };
export const CURRENCIES: { value: Currency; label: string }[] = [
  { value: "BRL", label: "R$ BRL" },
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
];

export const PLATFORMS = [
  { value: "PS5", label: "PS5" },
  { value: "Switch", label: "Nintendo Switch" },
  { value: "PC", label: "PC" },
  { value: "Xbox", label: "Xbox" },
  { value: "Retrô", label: "Retrô / Outros" },
] as const;

export const STATUSES = ["Zerado", "Jogando", "Na Fila", "Abandonado"] as const;

export const DIFFICULTIES = [
  { value: "barbada", label: "Barbada (Fácil)" },
  { value: "de boas", label: "De boas (Normal)" },
  { value: "xarope", label: "Xarope (Difícil)" },
  { value: "vai se ferrar", label: "Vai se ferrar (Muito Difícil)" },
  { value: "pistola", label: "Pistola (Pesadelo)" },
] as const;

export const STAR_OPTIONS = [
  { value: "5", label: "⭐⭐⭐⭐⭐ (5/5)" },
  { value: "4", label: "⭐⭐⭐⭐ (4/5)" },
  { value: "3", label: "⭐⭐⭐ (3/5)" },
  { value: "2", label: "⭐⭐ (2/5)" },
  { value: "1", label: "⭐ (1/5)" },
] as const;

export const VERDICTS = [
  { value: "Nem joga", label: "Nem joga (Péssimo)" },
  { value: "Ruinzinho", label: "Ruinzinho (Ruim)" },
  { value: "Fraquinho", label: "Fraquinho (Mediocre)" },
  { value: "Ta valendo", label: "Tá valendo (Bom)" },
  { value: "Show de bola", label: "Show de bola (Muito Bom)" },
  { value: "Topzera", label: "Topzera (Ótimo)" },
  { value: "Cinema", label: "Cinema (Obra de Arte)" },
] as const;

export interface Game {
  id: string;
  title: string;
  platform: string;
  genre: string;
  studio: string;
  publisher: string;
  price: number;
  purchaseDate: string;
  hoursPlayed: number;
  status: string;
  trophiesUnlocked: number;
  trophiesTotal: number;
  difficulty: string;
  stars: string;
  verdict: string;
  coverUrl: string;
  youtubeUrl: string;
  review: string;
}

export const STORAGE_KEY = "colecionador_jogos";

export const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop";

export const SEED_GAMES: Game[] = [
  {
    id: "1",
    title: "Elden Ring",
    platform: "PS5",
    genre: "RPG de Ação",
    studio: "FromSoftware",
    publisher: "Bandai Namco",
    price: 299.9,
    purchaseDate: "2022-02-25",
    hoursPlayed: 120,
    status: "Zerado",
    trophiesUnlocked: 42,
    trophiesTotal: 42,
    difficulty: "pistola",
    stars: "5",
    verdict: "Cinema",
    coverUrl:
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600&auto=format&fit=crop",
    youtubeUrl: "https://www.youtube.com/watch?v=AKX3dbKJbo9",
    review: "Uma obra-prima absoluta que redefiniu os jogos de mundo aberto.",
  },
];

/** Converts a BRL amount to the chosen currency. Missing values read "Grátis"; 0 is shown as a price. */
export function formatPrice(value: number | null | undefined, currency: Currency): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "Grátis";
  const converted = value * RATES[currency];
  return `${SYMBOLS[currency]} ${converted.toFixed(2)}`;
}

/** Price divided by hours played; with no hours, the full price. */
export function costPerHour(game: Pick<Game, "price" | "hoursPlayed">): number {
  return game.hoursPlayed > 0 ? game.price / game.hoursPlayed : game.price;
}

/** 100% Platina when every trophy of a game with trophies is unlocked. */
export function isPlatinum(game: Pick<Game, "trophiesUnlocked" | "trophiesTotal">): boolean {
  return (
    Number(game.trophiesTotal) > 0 && Number(game.trophiesUnlocked) >= Number(game.trophiesTotal)
  );
}

export function starCount(stars: string): number {
  return Number(stars) || 5;
}

export interface GameFilters {
  search: string;
  platform: string;
  status: string;
}

/** Search matches title, studio or publisher (case-insensitive); empty platform/status match all. */
export function filterGames(games: Game[], { search, platform, status }: GameFilters): Game[] {
  const term = search.toLowerCase();
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

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function loadGames(storage: StorageLike): Game[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return Array.isArray(parsed) ? (parsed as Game[]) : SEED_GAMES;
  } catch {
    return SEED_GAMES;
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
