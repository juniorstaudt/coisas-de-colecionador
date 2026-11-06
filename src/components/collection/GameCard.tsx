import { Images, Pencil, PlayCircle, Trash2 } from "lucide-react";

import { GameCover, PlatinumSeal, StarRating } from "@/components/collection/media";
import { Button } from "@/components/ui/button";
import {
  costPerHour,
  difficultyName,
  formatPrice,
  isPlatinum,
  starCount,
  verdictName,
  type Currency,
  type Game,
  type Rates,
} from "@/lib/games";

interface GameCardProps {
  game: Game;
  currency: Currency;
  rates: Rates;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function GameCard({ game, currency, rates, onOpen, onEdit, onDelete }: GameCardProps) {
  return (
    <article className="pixel-border group flex flex-col justify-between overflow-hidden rounded-2xl bg-card text-card-foreground transition duration-200 hover:-translate-y-1">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Ver detalhes de ${game.title}`}
      >
        <div className="relative h-48 overflow-hidden bg-muted">
          <GameCover game={game} className="h-full w-full transition duration-300 group-hover:scale-105" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow">
              {game.platform}
            </span>
            <span className="rounded-lg bg-chip px-2.5 py-1 text-xs font-bold text-chip-foreground shadow">
              {game.status}
            </span>
          </div>
          {isPlatinum(game) && (
            <div className="absolute right-3 top-3">
              <PlatinumSeal />
            </div>
          )}
          {(game.youtubeUrl || game.photoIds.length > 0) && (
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              {game.youtubeUrl && (
                <span className="flex items-center gap-1 rounded-md bg-chip px-2 py-1 text-[11px] font-bold text-chip-foreground">
                  <PlayCircle className="size-3.5" /> Vídeo
                </span>
              )}
              {game.photoIds.length > 0 && (
                <span className="flex items-center gap-1 rounded-md bg-chip px-2 py-1 text-[11px] font-bold text-chip-foreground">
                  <Images className="size-3.5" /> {game.photoIds.length}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-5">
          <h4 className="mb-1 line-clamp-1 text-lg font-extrabold">{game.title}</h4>
          <p className="mb-3 line-clamp-1 text-xs font-semibold text-muted-foreground">
            {game.genre || "Gênero não informado"} • {game.studio || "Estúdio"}
          </p>

          <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-muted p-3 text-xs">
            <Stat label="Preço" value={formatPrice(game.price, currency, rates)} />
            <Stat label="Custo/Hora" value={`${formatPrice(costPerHour(game), currency, rates)}/h`} />
            <Stat label="Horas" value={`${game.hoursPlayed || 0}h`} />
            <Stat label="Troféus" value={`${game.trophiesUnlocked || 0}/${game.trophiesTotal || 0}`} />
          </div>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="rounded bg-tag-difficulty px-2 py-1 font-bold text-tag-difficulty-foreground">
              Dif: {difficultyName(game.difficulty)}
            </span>
            <span className="rounded bg-tag-verdict px-2 py-1 font-bold text-tag-verdict-foreground">
              {verdictName(game.verdict)}
            </span>
          </div>

          <p className="line-clamp-2 text-xs italic text-muted-foreground">
            "{game.review || "Sem review cadastrado."}"
          </p>
        </div>
      </button>

      <div className="flex items-center justify-between border-t-2 border-border bg-muted p-4">
        <StarRating stars={starCount(game.stars)} />
        <div className="flex gap-2">
          <Button variant="tool" size="icon" onClick={onEdit} aria-label={`Editar ${game.title}`}>
            <Pencil />
          </Button>
          <Button variant="danger-soft" size="icon" onClick={onDelete} aria-label={`Remover ${game.title}`}>
            <Trash2 />
          </Button>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-muted-foreground">{label}:</span>
      <strong>{value}</strong>
    </div>
  );
}
