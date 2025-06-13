
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserPlus } from 'lucide-react';

const MembersPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['family-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  if (authLoading || profilesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-whatsapp-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-whatsapp-50 via-emerald-50 to-teal-50">
      <Header />

      <main className="flex-1 pt-24 pb-32">
        <div className="container mx-auto p-4">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-whatsapp-600 to-emerald-600 bg-clip-text text-transparent">
                  Membres de la Famille
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  {profiles?.length || 0} membre(s) dans votre famille
                </p>
              </div>
              <Button className="bg-gradient-to-r from-whatsapp-600 to-emerald-600 hover:from-whatsapp-700 hover:to-emerald-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Inviter un membre
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles?.map((profile) => (
                <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <Avatar className="h-20 w-20 mx-auto border-2 border-whatsapp-200">
                      <AvatarImage src={profile.photo_url} alt={`${profile.first_name} ${profile.last_name}`} />
                      <AvatarFallback className="bg-gradient-to-br from-whatsapp-400 to-emerald-500 text-white text-lg">
                        {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl">
                      {profile.first_name} {profile.last_name}
                    </CardTitle>
                    <Badge variant={profile.role === 'patriarch' ? 'default' : 'secondary'}>
                      {profile.role === 'patriarch' ? 'Patriarche' : 'Membre'}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {profile.title && (
                      <p className="text-sm text-gray-600 text-center">{profile.title}</p>
                    )}
                    {profile.current_location && (
                      <p className="text-sm text-gray-600 text-center">📍 {profile.current_location}</p>
                    )}
                    {profile.country && (
                      <p className="text-sm text-gray-600 text-center">🌍 {profile.country}</p>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => window.location.href = `/profile/${profile.id}`}
                    >
                      Voir le profil
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!profiles?.length && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Aucun membre trouvé</p>
                <Button className="mt-4 bg-gradient-to-r from-whatsapp-600 to-emerald-600 hover:from-whatsapp-700 hover:to-emerald-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Inviter le premier membre
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MembersPage;
