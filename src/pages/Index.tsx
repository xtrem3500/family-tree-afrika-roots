
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FamilyTree from '@/components/FamilyTree';
import RegistrationStep1 from '@/components/RegistrationStep1';
import RegistrationStep2Creator from '@/components/RegistrationStep2Creator';
import RegistrationStep2Member from '@/components/RegistrationStep2Member';
import Login from '@/components/Login';
import { useToast } from '@/hooks/use-toast';

type AppState = 'login' | 'register-step1' | 'register-step2-creator' | 'register-step2-member' | 'main';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('login');
  const [userData, setUserData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  // Check if this is the first user (for demo purposes, always false for now)
  const isFirstUser = false;

  const handleRegistrationStep1Complete = (data: any) => {
    setUserData(data);
    if (isFirstUser) {
      setAppState('register-step2-creator');
    } else {
      setAppState('register-step2-member');
    }
  };

  const handleRegistrationComplete = (data: any) => {
    console.log('Registration completed:', data);
    toast({
      title: data.role === 'patriarch' ? 'Arbre familial créé!' : 'Demande soumise!',
      description: data.role === 'patriarch' 
        ? 'Vous êtes maintenant le patriarche de votre arbre familial.'
        : 'Votre demande de connexion familiale a été soumise pour validation.',
    });
    setIsLoggedIn(true);
    setAppState('main');
  };

  const handleLogin = (email: string, password: string) => {
    // TODO: Implement actual login with Supabase
    console.log('Login attempt:', { email, password });
    toast({
      title: "Connexion réussie",
      description: "Bienvenue dans votre arbre familial!",
    });
    setIsLoggedIn(true);
    setAppState('main');
  };

  const handleShowRegister = () => {
    setAppState('register-step1');
  };

  const handleShowLogin = () => {
    setAppState('login');
  };

  const handleBack = () => {
    if (appState === 'register-step2-creator' || appState === 'register-step2-member') {
      setAppState('register-step1');
    }
  };

  if (appState === 'login') {
    return <Login onLogin={handleLogin} onShowRegister={handleShowRegister} />;
  }

  if (appState === 'register-step1') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20">
          <RegistrationStep1 
            onNext={handleRegistrationStep1Complete} 
            onShowLogin={handleShowLogin}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (appState === 'register-step2-creator') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20">
          <RegistrationStep2Creator 
            userData={userData}
            onComplete={handleRegistrationComplete}
            onBack={handleBack}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (appState === 'register-step2-member') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20">
          <RegistrationStep2Member 
            userData={userData}
            onComplete={handleRegistrationComplete}
            onBack={handleBack}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-whatsapp-50 via-emerald-50 to-teal-50">
      <Header />
      
      <main className="flex-1 pt-24 pb-8">
        <div className="container mx-auto p-4">
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center space-x-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-whatsapp-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl glow">
                  <span className="text-white text-3xl">🌳</span>
                </div>
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-whatsapp-600 to-emerald-600 bg-clip-text text-transparent">
                    Votre Arbre Familial
                  </h2>
                </div>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
                🌍 Explorez et découvrez les liens qui unissent votre famille africaine à travers les générations
              </p>
            </div>
            
            <FamilyTree />
            
            <div className="text-center bg-gradient-to-r from-whatsapp-100 to-emerald-100 rounded-2xl p-6 shadow-lg border border-whatsapp-200">
              <div className="space-y-2">
                <p className="text-sm text-gray-700 font-medium">
                  💡 <strong>Navigation :</strong> Cliquez sur les membres pour voir leurs descendants
                </p>
                <p className="text-sm text-gray-600">
                  📱 Utilisez le scroll pour explorer toute votre famille
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
