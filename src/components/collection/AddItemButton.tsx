import { useNavigate } from "@tanstack/react-router";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { COLLECTION_KINDS } from "@/lib/games";

/** "Adicionar Item": pick Jogo, Música or Livro, then that section opens its new-item form. */
export function AddItemButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Button variant="arcade" size="xl" onClick={() => setOpen(true)} className="w-full md:w-auto">
        <PlusCircle /> Adicionar Item
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="pixel-border max-w-md rounded-2xl bg-card p-5 sm:rounded-2xl sm:p-6">
          <DialogTitle className="font-pixel text-xs leading-relaxed sm:text-sm">
            Adicionar Item
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            O que você quer cadastrar?
          </DialogDescription>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {COLLECTION_KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  void navigate({ to: k.to, search: { novo: 1 } });
                }}
                className="pixel-border flex flex-col items-center gap-2 rounded-xl bg-muted px-3 py-4 font-bold transition hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-3xl" aria-hidden>
                  {k.emoji}
                </span>
                {k.item}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
