// Page frame shared by every collection section: header with tabs and totals,
// a toolbar for filters + "Adicionar Item", the item grid and the pixel footer.
import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";

import { AddItemButton } from "@/components/collection/AddItemButton";
import { OwnerLock } from "@/components/collection/OwnerLock";
import { PixelFooter } from "@/components/layout/PixelFooter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import {
  COLLECTION_KINDS,
  formatPrice,
  type CollectionKind,
  type CurrencyTotal,
} from "@/lib/games";

export function kindInfo(kind: CollectionKind) {
  return COLLECTION_KINDS.find((k) => k.id === kind)!;
}

interface CollectionShellProps {
  kind: CollectionKind;
  owner: boolean;
  ready: boolean;
  totals: CurrencyTotal[];
  /** Filters shown in the toolbar, before the "Adicionar Item" button. */
  filters: ReactNode;
  children: ReactNode;
}

export function CollectionShell({
  kind,
  owner,
  ready,
  totals,
  filters,
  children,
}: CollectionShellProps) {
  const { theme, toggle } = useTheme();
  const info = kindInfo(kind);

  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
      <div className="sky-stars" aria-hidden />

      <header className="relative z-10 overflow-hidden px-4 pb-6 pt-10 text-center">
        <Button
          variant="tool"
          size="icon"
          onClick={toggle}
          className="pixel-border absolute right-4 top-4"
          aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>
        <OwnerLock owner={owner} />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center">
          <div
            className="sun-glow pointer-events-none absolute -top-16 left-1/2 size-[26rem] -translate-x-1/2"
            aria-hidden
          />
          <div
            className="pixel-sun pointer-events-none absolute -top-4 left-1/2 size-40 -translate-x-1/2 sm:size-52"
            aria-hidden
          />

          <h1 className="font-pixel text-stroke relative mb-6 -rotate-1 text-2xl uppercase leading-snug tracking-wider text-title sm:text-4xl md:text-5xl">
            Coisas de
            <br />
            Colecionador
          </h1>

          <nav aria-label="Coleções" className="relative mb-4 flex flex-wrap justify-center gap-2">
            {COLLECTION_KINDS.map((k) => (
              <Link
                key={k.id}
                to={k.to}
                aria-current={k.id === kind ? "page" : undefined}
                className={
                  k.id === kind
                    ? "pixel-border rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                    : "pixel-border rounded-lg bg-card/80 px-3 py-1.5 text-xs font-bold text-card-foreground transition hover:bg-card"
                }
              >
                {k.emoji} {k.label}
              </Link>
            ))}
          </nav>

          <div
            className="pixel-border relative flex flex-col items-center gap-2 rounded-2xl bg-card/90 px-4 py-2.5 backdrop-blur sm:flex-row sm:gap-5 sm:rounded-full sm:px-6"
            aria-label="Valor total da coleção"
          >
            <span className="text-xs font-bold uppercase text-muted-foreground">
              Total ({info.label}):
            </span>
            {totals.map((t) => (
              <span key={t.currency} className="flex items-baseline gap-1.5">
                <strong className="text-base font-extrabold">
                  {ready ? formatPrice(t.total, t.currency) : "…"}
                </strong>
                {ready && (
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {t.count} {t.count === 1 ? info.singular : info.plural}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-grow px-4 pb-16">
        <div className="pixel-border mb-8 flex flex-col items-stretch justify-between gap-4 rounded-2xl bg-card/95 p-4 backdrop-blur md:flex-row md:items-center">
          <div className="flex w-full flex-1 flex-wrap gap-3 md:w-auto">{filters}</div>
          {owner && <AddItemButton />}
        </div>
        {children}
      </main>

      <PixelFooter />
    </div>
  );
}

interface ItemsGridProps {
  kind: CollectionKind;
  ready: boolean;
  visible: number;
  total: number;
  children: ReactNode;
}

/** Count line + card grid, with an empty message when nothing matches. */
export function ItemsGrid({ kind, ready, visible, total, children }: ItemsGridProps) {
  const info = kindInfo(kind);
  if (!ready) return null;
  return (
    <>
      <p className="font-pixel mb-4 text-[10px] uppercase text-title text-stroke-sm">
        {visible} {visible === 1 ? info.singular : info.plural}
        {visible !== total && ` de ${total}`}
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible === 0 ? (
          <div className="col-span-full rounded-2xl bg-card/70 py-12 text-center font-semibold text-muted-foreground backdrop-blur">
            {total === 0
              ? `Nenhum ${info.singular} cadastrado ainda.`
              : `Nenhum ${info.singular} encontrado na coleção.`}
          </div>
        ) : (
          children
        )}
      </div>
    </>
  );
}
