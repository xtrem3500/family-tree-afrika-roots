import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2, User, Users, TreePine } from 'lucide-react';
import ProfilePhotoUpload from '@/components/shared/ProfilePhotoUpload';

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  photo_url: string;
  country: string;
  is_patriarch: boolean;
  role: string;
  title: string | null;
  birth_place: string | null;
  birth_date: string | null;
}

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const refreshProfile = useCallback(async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger votre profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 to-baobab-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-baobab-800">
            Bienvenue, {profile.first_name} !
          </h1>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="text-baobab-600 hover:text-baobab-800"
          >
            Se déconnecter
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Famille
            </TabsTrigger>
            <TabsTrigger value="tree" className="flex items-center gap-2">
              <TreePine className="h-4 w-4" />
              Arbre
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Mon Profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <ProfilePhotoUpload
                    currentPhotoUrl={profile.photo_url}
                    onPhotoUploaded={async (url) => {
                      const { error } = await supabase
                        .from('profiles')
                        .update({ photo_url: url })
                        .eq('id', user.id);

                      if (error) {
                        toast({
                          title: "Erreur",
                          description: "Impossible de mettre à jour la photo",
                          variant: "destructive",
                        });
                        return;
                      }

                      await refreshProfile();
                    }}
                    userInitials={`${profile.first_name[0]}${profile.last_name[0]}`}
                    size="lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Prénom</h3>
                    <p className="mt-1">{profile.first_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                    <p className="mt-1">{profile.last_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1">{profile.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
                    <p className="mt-1">{profile.phone}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Pays</h3>
                    <p className="mt-1">{profile.country}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Rôle</h3>
                    <p className="mt-1">
                      {profile.is_patriarch ? 'Patriarche' : 'Membre'}
                    </p>
                  </div>
                </div>

                {profile.title && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Titre/Fonction</h3>
                    <p className="mt-1">{profile.title}</p>
                  </div>
                )}

                {(profile.birth_date || profile.birth_place) && (
                  <div className="grid grid-cols-2 gap-4">
                    {profile.birth_date && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Date de naissance</h3>
                        <p className="mt-1">{new Date(profile.birth_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {profile.birth_place && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Lieu de naissance</h3>
                        <p className="mt-1">{profile.birth_place}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="family">
            <Card>
              <CardHeader>
                <CardTitle>Ma Famille</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500">
                  {profile.is_patriarch
                    ? "En tant que patriarche, vous verrez ici tous les membres de votre famille."
                    : "Vous verrez ici les membres de votre famille une fois qu'ils auront rejoint l'arbre."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tree">
            <Card>
              <CardHeader>
                <CardTitle>Arbre Familial</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500">
                  {profile.is_patriarch
                    ? "En tant que patriarche, vous verrez ici l'arbre complet de votre famille."
                    : "Vous verrez ici votre position dans l'arbre familial."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
