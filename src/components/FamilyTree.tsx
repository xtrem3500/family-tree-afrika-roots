import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/types/profile';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FamilyMember {
  id: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  role: string;
  generation: number;
  birth_date?: string;
  birth_place?: string;
  current_location?: string;
  title?: string;
  father_id?: string;
  mother_id?: string;
  spouse_id?: string;
  children_ids?: string[];
  relationship_type?: 'father' | 'mother' | 'child' | 'grandchild' | 'sibling' | 'spouse';
  father?: {
    id: string;
    first_name: string;
    last_name: string;
    photo_url: string;
  } | null;
  mother?: {
    id: string;
    first_name: string;
    last_name: string;
    photo_url: string;
  } | null;
  spouse?: {
    id: string;
    first_name: string;
    last_name: string;
    photo_url: string;
  } | null;
}

interface ProfileBasic {
  id: string;
  first_name: string;
  last_name: string;
  photo_url: string;
}

const MemberCard: React.FC<{ member: FamilyMember; onClick: (member: FamilyMember) => void }> = ({ member, onClick }) => {
  const getRelationshipLabel = (member: FamilyMember) => {
    if (member.role === 'patriarch') return 'Patriarche';
    if (member.role === 'spouse') return 'Époux/se';
    if (member.relationship_type === 'father') return 'Père';
    if (member.relationship_type === 'mother') return 'Mère';
    if (member.relationship_type === 'child') return 'Enfant';
    if (member.relationship_type === 'grandchild') return 'Petit-enfant';
    if (member.relationship_type === 'sibling') return 'Frère/Sœur';
    return member.role;
  };

  return (
    <div
      onClick={() => onClick(member)}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer p-4 w-64"
    >
      <div className="flex flex-col items-center space-y-3">
        <Avatar className="h-16 w-16 border-2 border-whatsapp-200">
          <AvatarImage src={member.photo_url} alt={`${member.first_name} ${member.last_name}`} />
          <AvatarFallback className="bg-gradient-to-br from-whatsapp-400 to-emerald-500 text-white text-lg">
            {member.first_name.charAt(0)}{member.last_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="text-center space-y-1">
          <h3 className="text-base font-semibold text-gray-900">
            {member.first_name} {member.last_name}
          </h3>
          <p className="text-sm text-whatsapp-600 font-medium">
            {getRelationshipLabel(member)}
          </p>
          {member.title && (
            <p className="text-xs text-gray-500">{member.title}</p>
          )}
          {member.current_location && (
            <p className="text-xs text-gray-500">{member.current_location}</p>
          )}
        </div>
        {member.children_ids && member.children_ids.length > 0 && (
          <div className="text-xs text-whatsapp-600 font-medium">
            {member.children_ids.length} descendant(s)
          </div>
        )}
      </div>
    </div>
  );
};

const FamilyTreeNode: React.FC<{ member: FamilyMember; level: number }> = ({ member, level }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'patriarch': return 'bg-baobab-500 text-white';
      case 'spouse': return 'bg-earth-400 text-white';
      case 'child': return 'bg-primary text-primary-foreground';
      case 'grandchild': return 'bg-whatsapp-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getNodeClasses = (role: string) => {
    const base = "tree-node interactive";
    return role === 'patriarch' ? `${base} patriarch` : base;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Card className={getNodeClasses(member.role)} onClick={() => setIsExpanded(!isExpanded)}>
        <CardContent className="p-4 text-center min-w-[200px]">
          <div className="flex justify-center mb-2">
            <span className="text-2xl">👤</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">{member.first_name} {member.last_name}</h3>
          <Badge className={`${getRoleColor(member.role)} mb-2`}>
            {member.role === 'patriarch' ? 'Patriarche' :
             member.role === 'spouse' ? 'Époux/se' :
             member.role === 'child' ? 'Enfant' : 'Petit-enfant'}
          </Badge>
          {member.title && <p className="text-sm text-muted-foreground mb-1">{member.title}</p>}
          {member.current_location && <p className="text-xs text-muted-foreground">{member.current_location}</p>}
          {member.children_ids && member.children_ids.length > 0 && (
            <p className="text-xs mt-2 text-primary">
              {isExpanded ? '▼' : '▶'} {member.children_ids.length} descendant(s)
            </p>
          )}
        </CardContent>
      </Card>

      {isExpanded && member.children_ids && member.children_ids.length > 0 && (
        <div className="flex space-x-8 animate-fade-in">
          {member.children_ids.map((childId) => (
            <div key={childId} className="relative">
              <div className="absolute -top-4 left-1/2 w-px h-4 bg-border"></div>
              <FamilyTreeNode member={member} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FamilyTree: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [currentGeneration, setCurrentGeneration] = useState(0);
  const [generations, setGenerations] = useState<FamilyMember[][]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: profiles, isLoading, error: profilesError } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, photo_url, role, birth_date, birth_place, current_location, title, created_at')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des profils:', error);
        throw error;
      }

      return data as Profile[];
    }
  });

  // Fonction utilitaire pour récupérer un profil par ID
  const getProfileById = async (id: string): Promise<ProfileBasic | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, photo_url')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Erreur lors de la récupération du profil ${id}:`, error);
      return null;
    }

    return data as ProfileBasic;
  };

  // Fonction pour calculer la génération d'un membre
  const calculateGeneration = (profile: any, allProfiles: any[]): number => {
    if (profile.role === 'patriarch') return 0;
    if (!profile.father_id && !profile.mother_id) return 0;

    const father = allProfiles.find(p => p.id === profile.father_id);
    const mother = allProfiles.find(p => p.id === profile.mother_id);

    if (father) {
      return calculateGeneration(father, allProfiles) + 1;
    }
    if (mother) {
      return calculateGeneration(mother, allProfiles) + 1;
    }

    return 0;
  };

  useEffect(() => {
    if (profiles) {
      try {
        // Organiser les membres par génération
        const organizedGenerations: FamilyMember[][] = [];

        profiles.forEach(profile => {
          const generation = profile.role === 'patriarch' ? 0 : 1;
          if (!organizedGenerations[generation]) {
            organizedGenerations[generation] = [];
          }
          organizedGenerations[generation].push(profile as FamilyMember);
        });

        setGenerations(organizedGenerations);
        setError(null);
      } catch (error: any) {
        console.error('Erreur lors de l\'organisation des générations:', error);
        setError(`Erreur lors de l'organisation des données: ${error.message}`);
      }
    }
  }, [profiles]);

  const handleMemberClick = (member: FamilyMember) => {
    setSelectedMember(member as Profile);
    setCurrentGeneration(member.generation);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-baobab-600" />
      </div>
    );
  }

  if (profilesError) {
    return (
      <div className="text-center text-red-600 p-4">
        Une erreur est survenue lors du chargement de l'arbre familial
      </div>
    );
  }

  if (!generations.length) {
    return (
      <div className="text-center p-8 space-y-4">
        <p className="text-gray-600">
          Votre arbre familial est vide. Commencez par ajouter des membres.
        </p>
        <Button
          variant="default"
          onClick={() => {/* TODO: Implémenter l'ajout de membres */}}
          className="mt-4"
        >
          Ajouter un membre
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentGeneration(prev => Math.max(0, prev - 1))}
          disabled={currentGeneration === 0}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Génération précédente</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentGeneration(prev => Math.min(generations.length - 1, prev + 1))}
          disabled={currentGeneration === generations.length - 1}
          className="flex items-center space-x-2"
        >
          <span>Génération suivante</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="h-[600px] rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generations[currentGeneration]?.map((member) => (
            <Card
              key={member.id}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedMember?.id === member.id ? 'ring-2 ring-baobab-500' : ''
              }`}
              onClick={() => handleMemberClick(member)}
            >
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16 border-2 border-baobab-200">
                  <AvatarImage src={member.photo_url} alt={`${member.first_name} ${member.last_name}`} />
                  <AvatarFallback className="bg-gradient-to-br from-baobab-400 to-baobab-600 text-white">
                    {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      {member.first_name} {member.last_name}
                    </h3>
                    <Badge variant={member.role === 'patriarch' ? 'default' : 'secondary'}>
                      {member.role === 'patriarch' ? 'Patriarche' : 'Membre'}
                    </Badge>
                  </div>
                  {member.title && (
                    <p className="text-sm text-gray-600">{member.title}</p>
                  )}
                  {member.birth_date && (
                    <p className="text-sm text-gray-600">
                      Né(e) le {new Date(member.birth_date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {member.birth_place && ` à ${member.birth_place}`}
                    </p>
                  )}
                  {member.current_location && (
                    <p className="text-sm text-gray-600">
                      Vit à {member.current_location}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {selectedMember && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-2 border-baobab-200">
                <AvatarImage src={selectedMember.photo_url} alt={`${selectedMember.first_name} ${selectedMember.last_name}`} />
                <AvatarFallback className="bg-gradient-to-br from-baobab-400 to-baobab-600 text-white text-2xl">
                  {selectedMember.first_name.charAt(0)}{selectedMember.last_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedMember.first_name} {selectedMember.last_name}
                </h2>
                <Badge variant={selectedMember.role === 'patriarch' ? 'default' : 'secondary'} className="mt-2">
                  {selectedMember.role === 'patriarch' ? 'Patriarche' : 'Membre'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {user && (
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
      )}
    </div>
  );
};

export default FamilyTree;
