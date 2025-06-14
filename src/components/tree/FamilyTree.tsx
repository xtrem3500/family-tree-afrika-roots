import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { addCorsHeaders } from '@/integrations/supabase/middleware';

interface FamilyMember {
  id: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  role: string;
  birth_date?: string;
  birth_place?: string;
  current_location?: string;
  title?: string;
  country?: string;
  is_patriarch?: boolean;
}

const FamilyTree: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const { data: profiles, isLoading, error: profilesError } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      try {
        const headers = new Headers();
        addCorsHeaders(headers);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Erreur Supabase:', error);
          throw new Error(error.message);
        }

        if (!data) {
          throw new Error('Aucune donnée reçue');
        }

        return data as FamilyMember[];
      } catch (error: any) {
        console.error('Erreur lors de la récupération des profils:', error);
        throw new Error(error.message || 'Erreur lors de la récupération des profils');
      }
    },
    enabled: !!user && !authLoading,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const handleMemberClick = (member: FamilyMember) => {
    setSelectedMember(member);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-whatsapp-600" />
      </div>
    );
  }

  if (profilesError) {
    console.error('Erreur lors de la récupération des profils:', profilesError);
    return (
      <div className="text-center text-red-600 p-4">
        <p className="mb-4">Une erreur est survenue lors du chargement de l'arbre familial.</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (!profiles?.length) {
    return (
      <div className="text-center p-8 space-y-4">
        <p className="text-gray-600">
          Votre arbre familial est vide. Commencez par ajouter des membres.
        </p>
        <Button
          variant="default"
          onClick={() => toast({
            title: "Fonctionnalité à venir",
            description: "L'ajout de nouveaux membres sera bientôt disponible!",
          })}
          className="mt-4"
        >
          Ajouter un membre
        </Button>
      </div>
    );
  }

  // Séparer le patriarche des autres membres
  const patriarch = profiles.find(p => p.is_patriarch || p.role === 'patriarch');
  const members = profiles.filter(p => !p.is_patriarch && p.role !== 'patriarch');

  return (
    <div className="space-y-8">
      <ScrollArea className="h-[600px] rounded-lg border p-6">
        <div className="space-y-8">
          {/* Patriarche */}
          {patriarch && (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-whatsapp-700 mb-4">Patriarche</h3>
              <Card
                className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg max-w-sm mx-auto ${
                  selectedMember?.id === patriarch.id ? 'ring-2 ring-whatsapp-500' : ''
                }`}
                onClick={() => handleMemberClick(patriarch)}
              >
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-20 w-20 border-2 border-whatsapp-200">
                    <AvatarImage src={patriarch.photo_url} alt={`${patriarch.first_name} ${patriarch.last_name}`} />
                    <AvatarFallback className="bg-gradient-to-br from-whatsapp-400 to-whatsapp-600 text-white text-lg">
                      {patriarch.first_name.charAt(0)}{patriarch.last_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">
                      {patriarch.first_name} {patriarch.last_name}
                    </h3>
                    <Badge className="mt-2 bg-whatsapp-600">Patriarche</Badge>
                    {patriarch.title && (
                      <p className="text-sm text-gray-600 mt-1">{patriarch.title}</p>
                    )}
                    {patriarch.current_location && (
                      <p className="text-sm text-gray-600">📍 {patriarch.current_location}</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Ligne de séparation */}
          {patriarch && members.length > 0 && (
            <div className="flex items-center justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-whatsapp-300 to-transparent w-full max-w-md"></div>
            </div>
          )}

          {/* Membres */}
          {members.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-whatsapp-700 mb-4 text-center">
                Membres de la famille ({members.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <Card
                    key={member.id}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedMember?.id === member.id ? 'ring-2 ring-whatsapp-500' : ''
                    }`}
                    onClick={() => handleMemberClick(member)}
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16 border-2 border-whatsapp-200">
                        <AvatarImage src={member.photo_url} alt={`${member.first_name} ${member.last_name}`} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white">
                          {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold">
                          {member.first_name} {member.last_name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          Membre
                        </Badge>
                        {member.title && (
                          <p className="text-sm text-gray-600">{member.title}</p>
                        )}
                        {member.current_location && (
                          <p className="text-sm text-gray-600">📍 {member.current_location}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Détails du membre sélectionné */}
      {selectedMember && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-2 border-whatsapp-200">
                <AvatarImage src={selectedMember.photo_url} alt={`${selectedMember.first_name} ${selectedMember.last_name}`} />
                <AvatarFallback className="bg-gradient-to-br from-whatsapp-400 to-whatsapp-600 text-white text-2xl">
                  {selectedMember.first_name.charAt(0)}{selectedMember.last_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedMember.first_name} {selectedMember.last_name}
                </h2>
                <Badge
                  variant={selectedMember.is_patriarch ? 'default' : 'secondary'}
                  className="mt-2"
                >
                  {selectedMember.is_patriarch ? 'Patriarche' : 'Membre'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {selectedMember.title && (
                <div>
                  <h3 className="font-semibold text-gray-700">Titre</h3>
                  <p>{selectedMember.title}</p>
                </div>
              )}
              {selectedMember.birth_date && (
                <div>
                  <h3 className="font-semibold text-gray-700">Date de naissance</h3>
                  <p>{new Date(selectedMember.birth_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              )}
              {selectedMember.birth_place && (
                <div>
                  <h3 className="font-semibold text-gray-700">Lieu de naissance</h3>
                  <p>{selectedMember.birth_place}</p>
                </div>
              )}
              {selectedMember.current_location && (
                <div>
                  <h3 className="font-semibold text-gray-700">Lieu de résidence</h3>
                  <p>{selectedMember.current_location}</p>
                </div>
              )}
              {selectedMember.country && (
                <div>
                  <h3 className="font-semibold text-gray-700">Pays</h3>
                  <p>{selectedMember.country}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Bouton d'ajout */}
      <div className="text-center mt-8">
        <Button
          variant="outline"
          className="flex items-center space-x-2 mx-auto"
          onClick={() => toast({
            title: "Fonctionnalité à venir",
            description: "L'ajout de nouveaux membres sera bientôt disponible!",
          })}
        >
          <UserPlus className="w-4 h-4" />
          <span>Ajouter un membre</span>
        </Button>
      </div>
    </div>
  );
};

export default FamilyTree;
