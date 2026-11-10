import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmRemoveDialogProps {
  /** Title of the item being removed; null keeps the dialog closed. */
  title: string | null;
  /** "jogo", "álbum", "livro". */
  noun: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmRemoveDialog({ title, noun, onCancel, onConfirm }: ConfirmRemoveDialogProps) {
  return (
    <AlertDialog open={title !== null} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className="pixel-border rounded-2xl bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>Remover {noun}?</AlertDialogTitle>
          <AlertDialogDescription>
            Deseja realmente remover "{title}" da sua coleção? As fotos também serão apagadas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={onConfirm}>
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
