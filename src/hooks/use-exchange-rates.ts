import { useQuery } from "@tanstack/react-query";

import { fetchLiveRates } from "@/lib/exchange-rates";
import { FALLBACK_RATES } from "@/lib/games";

const TEN_MINUTES = 10 * 60 * 1000;

/** Live rates refreshed every 10 minutes; fixed fallback rates while offline. */
export function useExchangeRates() {
  const query = useQuery({
    queryKey: ["exchange-rates", "BRL"],
    queryFn: fetchLiveRates,
    staleTime: TEN_MINUTES,
    refetchInterval: TEN_MINUTES,
    retry: 1,
  });

  return {
    rates: query.data?.rates ?? FALLBACK_RATES,
    live: !!query.data,
    date: query.data?.date ?? "",
    checking: query.isPending && !query.isError,
  };
}
