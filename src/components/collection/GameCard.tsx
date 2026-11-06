import { Pencil, Trash2, Youtube } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  FALLBACK_COVER,
  costPerHour,
  formatPrice,
  isPlatinum,
  starCount,
  type Currency,
  type Game,
} from "@/lib/games";

interface GameCardProps {
  game: Game;
  currency: Currency;
  onEdit: () => void;
  onDelete: () => void;
}

export function GameCard({ game, currency, onEdit, onDelete }: GameCardProps) {
  const platinum = isPlatinum(game);

  return (
    <article className="pixel-border flex flex-col justify-between overflow-hidden rounded-2xl bg-card transition duration-200 hover:-translate-y-0.5">
      <div>
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={game.coverUrl || FALLBACK_COVER}
            alt={game.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute left-3 top-3 flex gap-2">
            <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow">
              {game.platform}
            </span>
            <span className="rounded-lg bg-chip px-2.5 py-1 text-xs font-bold text-chip-foreground shadow">
              {game.status}
            </span>
          </div>
          {platinum && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-trophy px-2.5 py-1 text-xs font-black text-trophy-foreground shadow">
              🏆 100% Platina
            </div>
          )}
        </div>

        <div className="p-5">
          <h4 className="mb-1 line-clamp-1 text-lg font-extrabold text-foreground">{game.title}</h4>
          <p className="mb-3 text-xs font-semibold text-muted-foreground">
            {game.genre || "Gênero não informado"} • {game.studio || "Estúdio"}
          </p>

          <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-muted p-3 text-xs">
            <Stat label="Preço:" value={formatPrice(game.price, currency)} />
            <Stat label="Custo/Hora:" value={`${formatPrice(costPerHour(game), currency)}/h`} />
            <Stat label="Horas:" value={`${game.hoursPlayed || 0}h`} />
            <Stat
              label="Troféus:"
              value={`${game.trophiesUnlocked || 0}/${game.trophiesTotal || 0}`}
            />
          </div>

          <div className="mb-3 flex items-center justify-between gap-2 text-xs">
            <span className="rounded bg-tag-difficulty px-2 py-1 font-bold text-tag-difficulty-foreground">
              Dif: {game.difficulty}
            </span>
            <span className="rounded bg-tag-verdict px-2 py-1 font-bold text-tag-verdict-foreground">
              Veredito: {game.verdict}
            </span>
          </div>

          <p className="line-clamp-2 text-xs italic text-muted-foreground">
            "{game.review || "Sem review cadastrado."}"
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t-2 border-border bg-muted p-4">
        <div className="text-sm text-star" aria-label={`${starCount(game.stars)} de 5 estrelas`}>
          {"⭐".repeat(starCount(game.stars))}
        </div>
        <div className="flex gap-2">
          {game.youtubeUrl && (
            <Button variant="tool" size="icon" asChild>
              <a href={game.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="Ver no YouTube">
                <Youtube />
              </a>
            </Button>
          )}
          <Button variant="tool" size="icon" onClick={onEdit} aria-label="Editar jogo">
            <Pencil />
          </Button>
          <Button variant="danger-soft" size="icon" onClick={onDelete} aria-label="Remover jogo">
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
      <span className="block text-muted-foreground/80">{label}</span>{" "}
      <strong className="text-foreground">{value}</strong>
    </div>
  );
}
