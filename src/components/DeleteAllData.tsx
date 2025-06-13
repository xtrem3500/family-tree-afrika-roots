import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth.tsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';

export const DeleteAllData: React.FC = () => {
  const { deleteAllData } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const handleDelete = async () => {
    if (code !== '1432') {
      toast({
        title: "❌ Code incorrect",
        description: "Le code de sécurité saisi est incorrect.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAllData();
      setIsOpen(false);
      setCode('');
      toast({
        title: "✅ Opération terminée",
        description: "Toutes les données ont été supprimées avec succès.",
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "❌ Erreur de suppression",
        description: error.message || "Une erreur est survenue lors de la suppression des données",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="flex items-center gap-2"
          aria-label="Supprimer toutes les données"
        >
          <Trash2 className="h-4 w-4" />
          <span>Supprimer toutes les données</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        title="Supprimer toutes les données"
        description="Cette action est irréversible. Toutes les données seront définitivement supprimées. Veuillez entrer le code de sécurité pour confirmer."
      >
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="delete-code">Code de sécurité</Label>
            <Input
              id="delete-code"
              type="password"
              placeholder="Entrez le code de sécurité"
              value={code}
              onChange={handleCodeChange}
              className="text-center text-lg tracking-widest"
              maxLength={4}
              autoFocus
              aria-label="Code de sécurité"
              aria-describedby="delete-code-description"
              disabled={isDeleting}
            />
            <p id="delete-code-description" className="text-xs text-gray-500">
              Le code doit contenir exactement 4 chiffres
            </p>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || code !== '1432'}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression en cours...
              </>
            ) : (
              'Supprimer'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
