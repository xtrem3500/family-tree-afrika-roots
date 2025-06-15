import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { User, FamilyRelation } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { RelationshipType } from '@/components/family/RelationshipTypeSelect';

interface CreateRelationParams {
  userId: string;
  relatedToId: string;
  relationType: RelationshipType;
}

export const useFamilyAffiliation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: createRelation, isPending: isCreating } = useMutation({
    mutationFn: async ({ userId, relatedToId, relationType }: CreateRelationParams) => {
      const { error } = await supabase
        .from('family_relations')
        .insert({
          user_id: userId,
          related_to: relatedToId,
          relation_type: relationType,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Demande envoyée',
        description: 'La demande de relation a été envoyée avec succès.',
      });
      queryClient.invalidateQueries({ queryKey: ['family-relations'] });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi de la demande.',
        variant: 'destructive',
      });
      console.error('Error creating relation:', error);
    },
  });

  const { mutate: updateRelationStatus, isPending: isUpdating } = useMutation({
    mutationFn: async ({ relationId, status }: { relationId: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('family_relations')
        .update({ status })
        .eq('id', relationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de la relation a été mis à jour avec succès.',
      });
      queryClient.invalidateQueries({ queryKey: ['family-relations'] });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour du statut.',
        variant: 'destructive',
      });
      console.error('Error updating relation:', error);
    },
  });

  const { data: pendingRelations, isLoading: isLoadingPending } = useQuery({
    queryKey: ['family-relations', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_relations')
        .select(`
          *,
          user:user_id(*),
          related_to:related_to(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (FamilyRelation & {
        user: User;
        related_to: User;
      })[];
    },
  });

  const { data: approvedRelations, isLoading: isLoadingApproved } = useQuery({
    queryKey: ['family-relations', 'approved'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_relations')
        .select(`
          *,
          user:user_id(*),
          related_to:related_to(*)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (FamilyRelation & {
        user: User;
        related_to: User;
      })[];
    },
  });

  return {
    createRelation,
    updateRelationStatus,
    pendingRelations,
    approvedRelations,
    isCreating,
    isUpdating,
    isLoadingPending,
    isLoadingApproved,
  };
};
