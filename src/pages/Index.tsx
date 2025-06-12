
import React, { useState } from 'react';
import Header from '@/components/Header';
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
      <RegistrationStep1 
        onNext={handleRegistrationStep1Complete} 
        onShowLogin={handleShowLogin}
      />
    );
  }

  if (appState === 'register-step2-creator') {
    return (
      <RegistrationStep2Creator 
        userData={userData}
        onComplete={handleRegistrationComplete}
        onBack={handleBack}
      />
    );
  }

  if (appState === 'register-step2-member') {
    return (
      <RegistrationStep2Member 
        userData={userData}
        onComplete={handleRegistrationComplete}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 container mx-auto p-4">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Votre Arbre Familial
            </h2>
            <p className="text-muted-foreground">
              Explorez et découvrez les liens qui unissent votre famille
            </p>
          </div>
          
          <FamilyTree />
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Naviguez dans l'arbre en cliquant sur les membres pour voir leurs descendants.</p>
            <p>Utilisez le scroll pour explorer toute votre famille.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
