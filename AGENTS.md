<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- The game collection lives only in this browser's localStorage (`colecionador_jogos`) via `useGameCollection`; there is no login and the app does not read or write Supabase (the old `games` table and `game-images` bucket are unused). Why: single-owner personal catalog, owner dropped login.
- Uploaded photos (covers, gallery) are stored as blobs in IndexedDB via `src/lib/image-store.ts`; games keep only image ids, and removing a game or photo deletes its blobs. Why: localStorage is too small for images.
- Exchange rates come from the public Frankfurter API in the browser (`src/lib/exchange-rates.ts`), with fixed fallback rates in `src/lib/games.ts`. Prices are always stored in BRL. Why: no key needed, CORS-enabled, works offline with fallback.
- Theme: `dark` class on <html> is the SSR default; an inline head script removes it when the visitor chose light (`src/hooks/use-theme.ts`). Why: avoids a light/dark flash on load.
- Collection types are listed in `COLLECTION_KINDS`; new kinds (music, books) should get their own model module and route rather than overloading `Game`. Why: keeps each collection's fields independent.
- Collection business rules (currency rates, cost per hour, platinum, filters) live as pure functions in `src/lib/games.ts` with tests in `src/test/games.test.ts`. Why: keeps rules testable and separate from UI.
- The owner's spreadsheet lives as generated data in `src/data/imported-games.json` (built with `src/lib/spreadsheet-import.ts`) and is merged once per browser into the local collection, guarded by a localStorage flag. Why: the owner wanted the games in without signing in.
