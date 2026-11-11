import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { BookFormDialog } from "@/components/collection/BookFormDialog";
import { ConfirmRemoveDialog } from "@/components/collection/ConfirmRemoveDialog";
import { ItemCard, ItemDetailDialog, type ItemView } from "@/components/collection/ItemCard";
import { CollectionShell, ItemsGrid } from "@/components/layout/CollectionShell";
import { useLocalCollection } from "@/hooks/use-local-collection";
import {
  BOOKS_STORAGE_KEY,
  BOOK_FORMATS,
  BOOK_STATUSES,
  filterBooks,
  normalizeBook,
  type Book,
} from "@/lib/books";
import { collectionTotals, formatDate, formatPrice, validateNewItemSearch } from "@/lib/games";
import { getOwnerStatus } from "@/lib/owner.functions";

const TITLE = "Livros - Coisas de Colecionador";
const DESCRIPTION =
  "Estante de livros em estilo pixel art: autor, editora, formato, páginas, status de leitura, preço pago, nota, review e fotos.";

export const Route = createFileRoute("/livros")({
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
  component: BooksPage,
});

function bookView(b: Book): ItemView {
  return {
    ...b,
    badges: [b.format, b.status],
    subtitle: [b.author, b.genre].filter(Boolean).join(" • ") || "Autor não informado",
    stats: [
      { label: "Preço", value: formatPrice(b.price, b.currency) },
      { label: "Páginas", value: b.pages ? String(b.pages) : "—" },
      { label: "Editora", value: b.publisher || "—" },
      { label: "Compra", value: formatDate(b.purchaseDate) },
    ],
    details: [
      { label: "Preço pago", value: formatPrice(b.price, b.currency) },
      { label: "Páginas", value: b.pages ? String(b.pages) : "—" },
      { label: "Editora", value: b.publisher || "—" },
      { label: "Data de compra", value: formatDate(b.purchaseDate) },
    ],
  };
}

function BooksPage() {
  const { owner } = Route.useLoaderData();
  const { novo } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const {
    items: books,
    ready,
    save,
    remove,
  } = useLocalCollection<Book>(BOOKS_STORAGE_KEY, normalizeBook);
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState("");
  const [status, setStatus] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Book | null>(null);

  const visible = useMemo(
    () => filterBooks(books, { search, format, status }),
    [books, search, format, status],
  );
  const totals = useMemo(() => collectionTotals(books), [books]);
  const viewing = books.find((b) => b.id === viewingId) ?? null;

  function openForm(book: Book | null) {
    setViewingId(null);
    setEditing(book);
    setFormOpen(true);
  }

  // "Adicionar Item" → Livro lands here with ?novo=1.
  useEffect(() => {
    if (!novo || !ready) return;
    if (owner) openForm(null);
    void navigate({ search: {}, replace: true });
  }, [novo, ready, owner, navigate]);

  const selectClass = "field field-compact min-w-[9rem] flex-1 font-medium md:w-auto md:flex-none";

  return (
    <CollectionShell
      kind="books"
      owner={owner}
      ready={ready}
      totals={totals}
      filters={
        <>
          <input
            type="search"
            aria-label="Buscar"
            placeholder="Buscar livro, autor ou editora..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field field-compact w-full md:w-72"
          />
          <select
            aria-label="Filtrar por formato"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className={selectClass}
          >
            <option value="">Todos os Formatos</option>
            {BOOK_FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={selectClass}
          >
            <option value="">Todos os Status</option>
            {BOOK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </>
      }
    >
      <ItemsGrid kind="books" ready={ready} visible={visible.length} total={books.length}>
        {visible.map((b) => (
          <ItemCard
            key={b.id}
            view={bookView(b)}
            placeholder="📚"
            onOpen={() => setViewingId(b.id)}
            onEdit={owner ? () => openForm(b) : undefined}
            onDelete={owner ? () => setDeleting(b) : undefined}
          />
        ))}
      </ItemsGrid>

      <ItemDetailDialog
        view={viewing ? bookView(viewing) : null}
        placeholder="📚"
        onClose={() => setViewingId(null)}
        onEdit={owner && viewing ? () => openForm(viewing) : undefined}
        onDelete={owner && viewing ? () => setDeleting(viewing) : undefined}
      />

      <BookFormDialog
        open={owner && formOpen}
        book={editing}
        onOpenChange={setFormOpen}
        onSave={(book) => {
          save(book);
          setFormOpen(false);
        }}
      />

      <ConfirmRemoveDialog
        title={owner && deleting ? deleting.title : null}
        noun="livro"
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
