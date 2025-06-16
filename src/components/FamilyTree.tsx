import React from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import FamilyMemberCard from './FamilyMemberCard';
import FamilyTreeConnector from './FamilyTreeConnector';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface FamilyMember {
  id: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  birth_date?: string;
  birth_place?: string;
  title?: string;
  parent_id?: string;
  is_patriarch: boolean;
  children?: FamilyMember[];
}

const FamilyTree: React.FC = () => {
  const { user } = useAuth();

  const { data: familyMembers, isLoading, error } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: async () => {
      console.log('Fetching family members...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching family members:', error);
        throw error;
      }

      console.log('Family members fetched:', data);
      return data as FamilyMember[];
    },
  });

  console.log('Render state:', { isLoading, error, membersCount: familyMembers?.length });

  const buildFamilyTree = (members: FamilyMember[]) => {
    // Filtrer le membre spécifique avant de construire l'arbre
    const filteredMembers = members.filter(member => member.id !== "1749999119290-papagogo");
    const memberMap = new Map<string, FamilyMember>();
    const root: FamilyMember[] = [];

    // First pass: Create a map of all members
    filteredMembers.forEach(member => {
      memberMap.set(member.id, { ...member, children: [] });
    });

    // Second pass: Build the tree structure
    filteredMembers.forEach(member => {
      const memberWithChildren = memberMap.get(member.id)!;
      if (member.parent_id) {
        const parent = memberMap.get(member.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(memberWithChildren);
        }
      } else if (member.is_patriarch) {
        root.push(memberWithChildren);
      }
    });

    return root;
  };

  const renderMember = (member: FamilyMember, level: number = 0) => {
    // Ne pas afficher ce membre spécifique
    if (member.id === "1749999119290-papagogo") {
      return null;
    }

    const hasChildren = member.children && member.children.length > 0;
    const isCurrentUser = member.id === user?.id;

    return (
      <div key={member.id} className="flex flex-col items-center">
        <FamilyMemberCard
          member={{
            ...member,
            is_current_user: isCurrentUser,
          }}
          size="md"
        />

        {hasChildren && (
          <>
            <FamilyTreeConnector type="vertical" length={80} className="my-8" />
            <div className="relative">
              <FamilyTreeConnector
                type="horizontal"
                length={member.children!.length * 400}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
              <div className="flex justify-center space-x-40">
                {member.children!.map((child, index) => (
                  <div key={child.id} className="relative">
                    <FamilyTreeConnector
                      type="vertical"
                      length={80}
                      className="mb-8"
                    />
                    {index > 0 && (
                      <FamilyTreeConnector
                        type="diagonal"
                        length={200}
                        className="absolute top-0 left-1/2 transform -translate-x-1/2"
                      />
                    )}
                    {renderMember(child, level + 1)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-baobab-600 mx-auto mb-4"></div>
          <p className="text-baobab-800">Chargement de l'arbre généalogique...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="mb-4">Une erreur est survenue lors du chargement de l'arbre familial.</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const familyTree = familyMembers ? buildFamilyTree(familyMembers) : [];
  const patriarch = familyMembers?.find(member => member.is_patriarch);

  console.log('Tree state:', {
    familyTreeLength: familyTree.length,
    hasPatriarch: !!patriarch,
    membersCount: familyMembers?.length
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp-50 via-emerald-50 to-teal-50 p-2">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-whatsapp-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Votre Arbre Familial
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            🌍 Explorez et découvrez les liens qui unissent votre famille à travers les générations
          </p>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-whatsapp-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Membres de la Famille
          </h2>
        </header>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg mb-4 relative overflow-hidden">
          {/* Éléments décoratifs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-whatsapp-100 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-baobab-100 rounded-full opacity-20 blur-3xl"></div>
          </div>

          <div className="relative">
            {/* Section du Patriarche */}
            {patriarch && (
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 mb-1 ring-4 ring-yellow-400 animate-pulse">
                    <AvatarImage src={patriarch.photo_url} />
                    <AvatarFallback className="text-2xl">
                      {`${patriarch.first_name[0]}${patriarch.last_name[0]}`}
                    </AvatarFallback>
                  </Avatar>
                  <Badge
                    className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 animate-bounce"
                  >
                    Patriarche
                  </Badge>
                </div>
                <h2 className="text-lg font-semibold text-baobab-700">
                  {`${patriarch.first_name} ${patriarch.last_name}`}
                </h2>
                <p className="text-xs text-baobab-600">Patriarche de la famille</p>
              </div>
            )}

            {/* Statistiques rapides */}
            <div className="flex justify-center gap-4 mb-2">
              <div className="bg-white/60 rounded-xl p-2 shadow-sm">
                <p className="text-xl font-bold text-baobab-700">{familyMembers?.length || 0}</p>
                <p className="text-xs text-baobab-600">Membres</p>
              </div>
              <div className="bg-white/60 rounded-xl p-2 shadow-sm">
                <p className="text-xl font-bold text-baobab-700">
                  {familyMembers?.filter(m => m.children?.length).length || 0}
                </p>
                <p className="text-xs text-baobab-600">Générations</p>
              </div>
              <div className="bg-white/60 rounded-xl p-2 shadow-sm">
                <p className="text-xl font-bold text-baobab-700">
                  {familyMembers?.filter(m => m.is_patriarch).length || 0}
                </p>
                <p className="text-xs text-baobab-600">Patriarches</p>
              </div>
            </div>

            {/* Liste des membres affiliés */}
            <div className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {familyMembers?.filter(member =>
                  member.id !== "1749999119290-papagogo" && !member.is_patriarch
                ).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-3 p-4 bg-white/80 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group"
                  >
                    <Avatar className="w-12 h-12 ring-2 ring-whatsapp-100 group-hover:ring-whatsapp-400 transition-all duration-300">
                      <AvatarImage src={member.photo_url} />
                      <AvatarFallback className="text-sm bg-gradient-to-br from-whatsapp-600 to-emerald-600 text-white">
                        {member.first_name[0]}{member.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.first_name} {member.last_name}
                      </p>
                      {member.title && (
                        <p className="text-xs text-gray-500 truncate">{member.title}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {member.is_patriarch && (
                        <Badge className="bg-yellow-400 text-yellow-900">Patriarche</Badge>
                      )}
                      {member.id === user?.id && (
                        <Badge className="bg-whatsapp-600 text-white">Vous</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto bg-white/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="min-w-max">
            {familyTree.map(member => renderMember(member))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyTree;
