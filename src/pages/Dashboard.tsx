
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TreePine, UserPlus, Settings } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
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

      <main className="flex-1 pt-24 pb-8">
        <div className="container mx-auto p-4">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-whatsapp-600 to-emerald-600 bg-clip-text text-transparent">
                Bienvenue dans votre Arbre Familial
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Gérez et explorez votre famille à travers les générations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/tree'}>
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

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/members'}>
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

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/profile'}>
                <CardHeader className="text-center">
                  <Settings className="w-12 h-12 mx-auto text-gray-600" />
                  <CardTitle>Profil</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center">
                    Gérez votre profil personnel
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button
                onClick={() => window.location.href = '/tree'}
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
