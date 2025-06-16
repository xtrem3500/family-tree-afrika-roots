import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/use-auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FamilyTree from '@/components/FamilyTree';

const TreePage: React.FC = () => {
  const { user, loading } = useAuth();

  console.log('TreePage state:', { loading, hasUser: !!user });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-whatsapp-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-600 mx-auto mb-4"></div>
          <p className="text-whatsapp-800">Chargement de la page...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-whatsapp-50 via-emerald-50 to-teal-50">
      <Header />
      <main className="flex-1 pt-24 pb-32">
        <div className="container mx-auto px-4">
          <FamilyTree />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TreePage;
