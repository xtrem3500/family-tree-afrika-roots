import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/use-auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TreePine, UserPlus, Settings, Phone, MapPin } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: patriarch } = useQuery({
    queryKey: ['patriarch'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_patriarch', true)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp-600"></div>
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
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-whatsapp-600 to-emerald-600 bg-clip-text text-transparent">
                Bienvenue dans votre Arbre Familial
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Gérez et explorez votre famille à travers les générations autour du patriarche
              </p>

              {/* Section du patriarche */}
              {patriarch && (
                <div className="mt-4 flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-whatsapp-600 shadow-lg">
                      <AvatarImage src={patriarch.photo_url || undefined} alt={`${patriarch.first_name} ${patriarch.last_name}`} />
                      <AvatarFallback className="text-4xl bg-gradient-to-br from-whatsapp-600 to-emerald-600 text-white">
                        {patriarch.first_name?.[0]}{patriarch.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2 bg-whatsapp-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      Patriarche
                    </div>
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {patriarch.first_name} {patriarch.last_name}
                    </h2>
                    <p className="text-gray-600">Patriarche de la famille</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleNavigation('/tree')}>
                <CardHeader className="text-center">
                  <TreePine className="w-12 h-12 mx-auto text-whatsapp-600" />
                  <CardTitle>Arbre Familial</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center">
                    Visualisez votre généalogie interactive
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleNavigation('/members')}>
                <CardHeader className="text-center">
                  <Users className="w-12 h-12 mx-auto text-emerald-600" />
                  <CardTitle>Membres</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center">
                    Gérez les membres de la famille
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <UserPlus className="w-12 h-12 mx-auto text-teal-600" />
                  <CardTitle>Inviter</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center">
                    Invitez de nouveaux membres
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 cursor-pointer" onClick={() => handleNavigation('/profile')}>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-whatsapp-800">
                    Mon Profil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user?.photo_url} />
                      <AvatarFallback className="bg-whatsapp-100 text-whatsapp-800 text-xl">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-medium text-whatsapp-900">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-sm text-whatsapp-600">
                        {user?.email}
                      </p>
                      {user?.phone && (
                        <p className="text-sm text-whatsapp-600 flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {user.phone}
                        </p>
                      )}
                      {user?.country && (
                        <p className="text-sm text-whatsapp-600 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {user.country}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button
                onClick={() => handleNavigation('/tree')}
                className="bg-gradient-to-r from-whatsapp-600 to-emerald-600 hover:from-whatsapp-700 hover:to-emerald-700 text-white px-8 py-3 text-lg"
              >
                Explorer l'Arbre Familial
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
