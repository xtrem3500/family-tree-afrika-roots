import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Trash2,
  Sparkles,
  User,
  Users,
  LogOut,
  Settings,
  LayoutDashboard,
  MessageCircle,
  Bell,
  Facebook,
  Share2
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';

const Header: React.FC = () => {
  const [deleteCode, setDeleteCode] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAll = async () => {
    if (deleteCode === '1432') {
      try {
        if (!import.meta.env.VITE_ADMIN_PASSWORD) {
          throw new Error('Configuration admin manquante');
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-all-users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            password: import.meta.env.VITE_ADMIN_PASSWORD
          })
        });

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
          console.error('Error response:', data);
          throw new Error(data.error || data.message || 'Erreur lors de la suppression des données');
        }

        setIsDeleteDialogOpen(false);
        setDeleteCode('');

        toast({
          title: "✅ Opération terminée",
          description: "Toutes les données et utilisateurs ont été supprimés avec succès.",
        });

        navigate('/login');
      } catch (error: any) {
        console.error('Delete all error details:', {
          message: error.message,
          stack: error.stack,
          response: error.response
        });
        toast({
          title: "❌ Erreur de suppression",
          description: error.message || "Une erreur est survenue lors de la suppression des données",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "❌ Code incorrect",
        description: "Le code de sécurité saisi est incorrect.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (!user) return '?';
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-whatsapp-500 via-emerald-500 to-teal-500 backdrop-blur-xl border-b border-white/20 shadow-2xl">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo et titre */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg transition-all duration-300 hover:scale-110">
              <img src="/images/profile01.png" alt="Familiale Tree" className="h-8 w-8" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-400 rounded-full animate-pulse"></div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="text-2xl font-bold text-white drop-shadow-lg hover:text-white/90 transition-colors animate-fade-in">
                Arbre Familial
              </Link>
              <Sparkles className="w-5 h-5 text-gold-300 animate-pulse" />
            </div>
            <p className="text-sm text-white/80 font-medium animate-slide-in-right">Par Thierry Gogo</p>
          </div>
        </div>

        {/* Barre d'icônes sociales et menu utilisateur */}
        <div className="flex items-center gap-4">
          {/* Icônes sociales - toujours visibles avec animations */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 animate-fade-in">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-full hover:bg-white/20 text-white transition-all duration-300 hover:scale-110 hover:rotate-12"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 rounded-full hover:bg-white/20 text-white transition-all duration-300 hover:scale-110"
              >
                <Bell className="w-4 h-4" />
              </Button>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-full hover:bg-white/20 text-white transition-all duration-300 hover:scale-110 hover:rotate-12"
            >
              <Facebook className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-full hover:bg-white/20 text-white transition-all duration-300 hover:scale-110"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {user && (
            <>
              {/* Menu utilisateur */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full animate-bounce-in">
                    <Avatar className="h-10 w-10 border-2 border-white/20 transition-all duration-300 hover:scale-110">
                      <AvatarImage
                        src={user.user_metadata?.photo_url}
                        alt={getUserInitials()}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-whatsapp-400 to-emerald-500 text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white shadow-2xl animate-scale-in" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/tree" className="cursor-pointer">
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span>Arbre Familial</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/members" className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Mes membres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mon Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* Bouton Delete All */}
          <Button
            variant="destructive"
            size="sm"
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 animate-pulse-slow"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            🧨 Delete All
          </Button>

          {/* Dialog de confirmation */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent
              className="sm:max-w-md bg-white/95 backdrop-blur-xl border-2 border-white/30 animate-scale-in"
              description="Confirmez la suppression de toutes les données en entrant le code de sécurité."
            >
              <DialogHeader>
                <DialogTitle className="text-red-600 text-xl font-bold flex items-center">
                  <Trash2 className="w-6 h-6 mr-2" />
                  Suppression totale
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
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
                    className="text-center text-lg font-mono border-2 focus:border-red-400 rounded-xl transition-all duration-300 focus:scale-105"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    className="flex-1 border-2 hover:bg-gray-50 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAll}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Confirmer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
};

export default Header;
