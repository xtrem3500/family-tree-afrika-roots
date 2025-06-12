import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FamilyTree from '@/components/FamilyTree';
import RegistrationStep1 from '@/components/RegistrationStep1';
import RegistrationStep2Creator from '@/components/RegistrationStep2Creator';
import RegistrationStep2Member from '@/components/RegistrationStep2Member';
import Login from '@/components/Login';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type AppState = 'login' | 'register-step1' | 'register-step2-creator' | 'register-step2-member' | 'main';

const Index: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('login');
  const [userData, setUserData] = useState<any>(null);
  const [isFirstUser, setIsFirstUser] = useState<boolean | null>(null);
  const [patriarch, setPatriarch] = useState<any>(null);
  const { toast } = useToast();
  const { signIn, user, isLoading } = useAuth();

  useEffect(() => {
    const checkFirstUser = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, is_patriarch')
          .limit(1);

        if (error) {
          console.error('Erreur lors de la vérification des profils:', error);
          return;
        }

        // Vérifier si un patriarche existe déjà
        const { data: patriarchData, error: patriarchError } = await supabase
          .from('profiles')
          .select('id')
          .eq('is_patriarch', true)
          .maybeSingle();

        if (patriarchError) {
          console.error('Erreur lors de la vérification du patriarche:', patriarchError);
          return;
        }

        setIsFirstUser(!patriarchData);
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
      }
    };

    checkFirstUser();
  }, []);

  useEffect(() => {
    const fetchPatriarch = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_patriarch', true)
          .maybeSingle();

        if (error) {
          console.error('Erreur lors de la récupération du patriarche:', error);
          return;
        }

        if (data) {
          setPatriarch(data);
        } else {
          console.log('Aucun patriarche trouvé');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du patriarche:', error);
      }
    };

    if (user) {
      fetchPatriarch();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setAppState('main');
    }
  }, [user]);

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
    setAppState('main');
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      setAppState('main');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    }
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

  if (isLoading || isFirstUser === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-baobab-600"></div>
      </div>
    );
  }

  if (!user) {
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
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-whatsapp-50 via-emerald-50 to-teal-50">
      <Header />

      <main className="flex-1 pt-24 pb-8">
        <div className="container mx-auto p-4">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center space-x-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-whatsapp-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl glow overflow-hidden">
                  {patriarch?.photo_url ? (
                    <img
                      src={patriarch.photo_url}
                      alt={`${patriarch.first_name} ${patriarch.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-3xl">🌳</span>
                  )}
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
