import { Star, Trophy } from "lucide-react";

import { useImageUrl } from "@/hooks/use-image-url";
import { FALLBACK_COVER, youtubeId, type Game } from "@/lib/games";
import { cn } from "@/lib/utils";

/** Cover from an uploaded photo, else the link, else a retro placeholder. */
export function GameCover({ game, className }: { game: Game; className?: string }) {
  const uploaded = useImageUrl(game.coverImageId);
  const src = game.coverImageId ? uploaded : game.coverUrl || FALLBACK_COVER;
  if (!src) return <div className={cn("bg-muted", className)} aria-hidden />;
  return <img src={src} alt={`Capa de ${game.title}`} loading="lazy" className={cn("object-cover", className)} />;
}

export function StoredImage({ id, alt, className }: { id: string; alt: string; className?: string }) {
  const src = useImageUrl(id);
  if (!src) return <div className={cn("animate-pulse bg-muted", className)} aria-hidden />;
  return <img src={src} alt={alt} loading="lazy" className={cn("object-cover", className)} />;
}

export function StarRating({ stars, className }: { stars: number; className?: string }) {
  return (
    <div className={cn("flex gap-0.5", className)} role="img" aria-label={`${stars} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn("size-4", n <= stars ? "fill-star text-star" : "text-muted-foreground/40")}
        />
      ))}
    </div>
  );
}

export function PlatinumSeal({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span
      className={cn(
        "platinum-seal font-pixel inline-flex items-center gap-1.5 rounded-lg uppercase",
        size === "sm" ? "px-2 py-1 text-[9px]" : "px-3 py-2 text-[11px]",
      )}
    >
      <Trophy className={size === "sm" ? "size-3.5" : "size-4"} /> Platina 100%
    </span>
  );
}

export function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const id = youtubeId(url);
  if (!id) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary underline">
        Abrir vídeo em outra aba
      </a>
    );
  }
  return (
    <div className="pixel-border aspect-video w-full overflow-hidden rounded-xl bg-ink">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={`Vídeo de ${title}`}
        className="h-full w-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
