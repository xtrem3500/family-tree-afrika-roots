
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FamilyTree from '@/components/FamilyTree';

const TreePage: React.FC = () => {
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

      <main className="flex-1 pt-24 pb-32">
        <div className="container mx-auto p-4">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-whatsapp-600 to-emerald-600 bg-clip-text text-transparent">
                Votre Arbre Familial
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                🌍 Explorez et découvrez les liens qui unissent votre famille à travers les générations
              </p>
            </div>

            <FamilyTree />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TreePage;
