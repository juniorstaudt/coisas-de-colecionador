import type { Rates } from "@/lib/games";

export interface LiveRates {
  rates: Rates;
  /** Reference date published by the rate source (YYYY-MM-DD). */
  date: string;
}

const RATES_URL = "https://api.frankfurter.dev/v1/latest?base=BRL&symbols=USD,EUR";

/** Latest BRL→USD/EUR reference rates (European Central Bank, via Frankfurter). */
export async function fetchLiveRates(): Promise<LiveRates> {
  const res = await fetch(RATES_URL);
  if (!res.ok) throw new Error(`Cotação indisponível (${res.status})`);
  const data = (await res.json()) as { date?: string; rates?: { USD?: number; EUR?: number } };
  const usd = Number(data.rates?.USD);
  const eur = Number(data.rates?.EUR);
  if (!(usd > 0) || !(eur > 0)) throw new Error("Cotação inválida");
  return { rates: { BRL: 1, USD: usd, EUR: eur }, date: data.date ?? "" };
}
