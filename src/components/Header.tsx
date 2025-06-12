
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Sparkles } from 'lucide-react';

const Header = () => {
  const [deleteCode, setDeleteCode] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDeleteAll = () => {
    if (deleteCode === '1432') {
      // TODO: Implement Supabase Edge Function call to delete all data
      toast({
        title: "🗑️ Données supprimées",
        description: "Toutes les données ont été supprimées avec succès.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      setDeleteCode('');
    } else {
      toast({
        title: "❌ Code incorrect",
        description: "Le code de sécurité saisi est incorrect.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-whatsapp-500 via-emerald-500 to-teal-500 backdrop-blur-xl border-b border-white/20 shadow-2xl">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
              <span className="text-white font-bold text-2xl">🌳</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">Arbre Familial</h1>
              <Sparkles className="w-5 h-5 text-gold-300 animate-pulse" />
            </div>
            <p className="text-sm text-white/80 font-medium">Par Thierry Gogo</p>
          </div>
        </div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              🧨 Delete All
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md glass border-2 border-white/30">
            <DialogHeader>
              <DialogTitle className="text-red-600 text-xl font-bold flex items-center">
                <Trash2 className="w-6 h-6 mr-2" />
                Suppression totale
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ <strong>Attention :</strong> Cette action supprimera définitivement toutes les données de l'arbre familial.
                </p>
                <p className="text-sm text-red-700 mt-2">
                  Veuillez saisir le code de sécurité pour confirmer cette action irréversible.
                </p>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Code de sécurité</label>
                <Input
                  type="password"
                  placeholder="••••"
                  value={deleteCode}
                  onChange={(e) => setDeleteCode(e.target.value)}
                  className="text-center text-lg font-mono border-2 focus:border-red-400 rounded-xl"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="flex-1 border-2 hover:bg-gray-50 rounded-xl"
                >
                  Annuler
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAll}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl shadow-lg"
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
