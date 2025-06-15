import React, { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User, RelationType } from '@/types/supabase';
import { MemberSearch } from './MemberSearch';
import { RelationTypeSelect } from './RelationTypeSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const FamilyAffiliation: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [relationType, setRelationType] = useState<RelationType>('child');

  const { mutate: createRelation, isLoading } = useMutation({
    mutationFn: async () => {
      if (!user || !selectedMember) throw new Error('Missing user or selected member');

      const { error } = await supabase
        .from('family_relations')
        .insert({
          user_id: user.id,
          related_to: selectedMember.id,
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
      setSelectedMember(null);
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Affiliation Familiale</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Rechercher un membre</h3>
          <MemberSearch
            onSelect={setSelectedMember}
            excludeIds={user ? [user.id] : []}
          />
        </div>

        {selectedMember && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedMember.photo_url} />
                <AvatarFallback>
                  {selectedMember.first_name[0]}{selectedMember.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">
                  {selectedMember.first_name} {selectedMember.last_name}
                </h3>
                <p className="text-sm text-gray-500">{selectedMember.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Type de relation</h3>
              <RelationTypeSelect
                value={relationType}
                onChange={setRelationType}
              />
            </div>

            <Button
              onClick={() => createRelation()}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer la demande'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
