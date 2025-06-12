
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const [deleteCode, setDeleteCode] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDeleteAll = () => {
    if (deleteCode === '1432') {
      // TODO: Implement Supabase Edge Function call to delete all data
      toast({
        title: "Données supprimées",
        description: "Toutes les données ont été supprimées avec succès.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      setDeleteCode('');
    } else {
      toast({
        title: "Code incorrect",
        description: "Le code de sécurité saisi est incorrect.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-baobab-400 to-baobab-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🌳</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Arbre Familial</h1>
            <p className="text-xs text-muted-foreground">Par Thierry Gogo</p>
          </div>
        </div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              🧨 Delete All
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-destructive">Suppression totale</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Cette action supprimera définitivement toutes les données de l'arbre familial. 
                Veuillez saisir le code de sécurité pour confirmer.
              </p>
              <Input
                type="password"
                placeholder="Code de sécurité"
                value={deleteCode}
                onChange={(e) => setDeleteCode(e.target.value)}
                className="text-center"
              />
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAll}
                  className="flex-1"
                >
                  Confirmer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};

export default Header;
