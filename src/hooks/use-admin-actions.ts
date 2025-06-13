import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAdminActions = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const openDeleteDialog = () => setIsDeleteDialogOpen(true);
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSecretCode('');
  };

  const handleDeleteAll = async () => {
    if (secretCode === '1432') {
      setIsDeleting(true);
      try {
        // Appel de la fonction edge delete-all-data
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-all-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Erreur lors de la suppression des données');
        }

        // Déconnexion de l'utilisateur après la suppression
        const user = await supabase.auth.getUser();
        if (user.data.user) {
          const logoutResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ user_id: user.data.user.id })
          });

          if (!logoutResponse.ok) {
            throw new Error('Erreur lors de la déconnexion');
          }

          // Nettoyer la session localement
          await supabase.auth.signOut();
        }

        closeDeleteDialog();
        toast({
          title: "✅ Opération terminée",
          description: "Toutes les données ont été supprimées avec succès.",
        });

        navigate('/login', { replace: true });
      } catch (error: any) {
        console.error('Delete all error:', error);
        toast({
          title: "❌ Erreur de suppression",
          description: error.message || "Une erreur est survenue lors de la suppression des données",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    } else {
      toast({
        title: "❌ Code incorrect",
        description: "Le code de sécurité saisi est incorrect.",
        variant: "destructive",
      });
    }
  };

  return {
    isDeleteDialogOpen,
    secretCode,
    setSecretCode,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteAll,
    isDeleting,
  };
};
