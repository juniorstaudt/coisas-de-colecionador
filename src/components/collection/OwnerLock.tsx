import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Lock, LockOpen } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { lockOwner, unlockOwner } from "@/lib/owner.functions";

/** Lock button: opens the owner password prompt, or leaves owner mode. */
export function OwnerLock({ owner }: { owner: boolean }) {
  const router = useRouter();
  const unlock = useServerFn(unlockOwner);
  const lock = useServerFn(lockOwner);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { ok } = await unlock({ data: { password } });
      if (!ok) {
        setError(true);
        return;
      }
      setOpen(false);
      setPassword("");
      await router.invalidate();
      toast.success("Modo dono ativado.");
    } catch {
      toast.error("Não foi possível verificar a senha.");
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    await lock();
    await router.invalidate();
    toast("Modo dono desativado.");
  }

  return (
    <>
      <Button
        variant="tool"
        size="icon"
        onClick={owner ? () => void leave() : () => setOpen(true)}
        className="pixel-border absolute left-4 top-4"
        aria-label={owner ? "Sair do modo dono" : "Entrar no modo dono"}
        title={owner ? "Sair do modo dono" : "Modo dono"}
      >
        {owner ? <LockOpen /> : <Lock />}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          setError(false);
        }}
      >
        <DialogContent className="pixel-border max-w-sm rounded-2xl bg-card">
          <DialogTitle>Modo dono</DialogTitle>
          <DialogDescription>Digite sua senha para adicionar, editar e remover jogos.</DialogDescription>
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              aria-label="Senha"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className="field"
            />
            {error && <p className="text-sm font-semibold text-destructive">Senha incorreta.</p>}
            <Button type="submit" disabled={busy || !password}>
              Entrar
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
