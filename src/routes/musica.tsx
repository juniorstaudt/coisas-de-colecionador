import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { AlbumFormDialog } from "@/components/collection/AlbumFormDialog";
import { ConfirmRemoveDialog } from "@/components/collection/ConfirmRemoveDialog";
import { ItemCard, ItemDetailDialog, type ItemView } from "@/components/collection/ItemCard";
import { CollectionShell, ItemsGrid } from "@/components/layout/CollectionShell";
import { useLocalCollection } from "@/hooks/use-local-collection";
import { collectionTotals, formatDate, formatPrice, validateNewItemSearch } from "@/lib/games";
import {
  MUSIC_FORMATS,
  MUSIC_STORAGE_KEY,
  filterAlbums,
  normalizeAlbum,
  type Album,
} from "@/lib/music";
import { getOwnerStatus } from "@/lib/owner.functions";

const TITLE = "Música - Coisas de Colecionador";
const DESCRIPTION =
  "Coleção de discos em estilo pixel art: vinis, CDs e cassetes com artista, gravadora, preço pago, nota, review e fotos.";

export const Route = createFileRoute("/musica")({
  validateSearch: validateNewItemSearch,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: () => getOwnerStatus(),
  component: MusicPage,
});

function albumView(a: Album): ItemView {
  return {
    ...a,
    badges: [a.format],
    subtitle: [a.artist, a.genre].filter(Boolean).join(" • ") || "Artista não informado",
    stats: [
      { label: "Preço", value: formatPrice(a.price, a.currency) },
      { label: "Ano", value: a.releaseYear || "—" },
      { label: "Gravadora", value: a.label || "—" },
      { label: "Compra", value: formatDate(a.purchaseDate) },
    ],
    details: [
      { label: "Preço pago", value: formatPrice(a.price, a.currency) },
      { label: "Ano de lançamento", value: a.releaseYear || "—" },
      { label: "Gravadora", value: a.label || "—" },
      { label: "Data de compra", value: formatDate(a.purchaseDate) },
    ],
  };
}

function MusicPage() {
  const { owner } = Route.useLoaderData();
  const { novo } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const {
    items: albums,
    ready,
    save,
    remove,
  } = useLocalCollection<Album>(MUSIC_STORAGE_KEY, normalizeAlbum);
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Album | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Album | null>(null);

  const visible = useMemo(() => filterAlbums(albums, { search, format }), [albums, search, format]);
  const totals = useMemo(() => collectionTotals(albums), [albums]);
  const viewing = albums.find((a) => a.id === viewingId) ?? null;

  function openForm(album: Album | null) {
    setViewingId(null);
    setEditing(album);
    setFormOpen(true);
  }

  // "Adicionar Item" → Música lands here with ?novo=1.
  useEffect(() => {
    if (!novo || !ready) return;
    if (owner) openForm(null);
    void navigate({ search: {}, replace: true });
  }, [novo, ready, owner, navigate]);

  return (
    <CollectionShell
      kind="music"
      owner={owner}
      ready={ready}
      totals={totals}
      filters={
        <>
          <input
            type="search"
            aria-label="Buscar"
            placeholder="Buscar álbum, artista ou gravadora..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field field-compact w-full md:w-72"
          />
          <select
            aria-label="Filtrar por formato"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="field field-compact min-w-[9rem] flex-1 font-medium md:w-auto md:flex-none"
          >
            <option value="">Todos os Formatos</option>
            {MUSIC_FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </>
      }
    >
      <ItemsGrid kind="music" ready={ready} visible={visible.length} total={albums.length}>
        {visible.map((a) => (
          <ItemCard
            key={a.id}
            view={albumView(a)}
            placeholder="🎵"
            onOpen={() => setViewingId(a.id)}
            onEdit={owner ? () => openForm(a) : undefined}
            onDelete={owner ? () => setDeleting(a) : undefined}
          />
        ))}
      </ItemsGrid>

      <ItemDetailDialog
        view={viewing ? albumView(viewing) : null}
        placeholder="🎵"
        onClose={() => setViewingId(null)}
        onEdit={owner && viewing ? () => openForm(viewing) : undefined}
        onDelete={owner && viewing ? () => setDeleting(viewing) : undefined}
      />

      <AlbumFormDialog
        open={owner && formOpen}
        album={editing}
        onOpenChange={setFormOpen}
        onSave={(album) => {
          save(album);
          setFormOpen(false);
        }}
      />

      <ConfirmRemoveDialog
        title={owner && deleting ? deleting.title : null}
        noun="álbum"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) remove(deleting.id);
          if (deleting?.id === viewingId) setViewingId(null);
          setDeleting(null);
        }}
      />
    </CollectionShell>
  );
}
