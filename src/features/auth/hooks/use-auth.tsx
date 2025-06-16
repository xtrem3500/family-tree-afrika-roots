import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ user: User }>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Convertir l'utilisateur Supabase en notre type personnalisé
  const convertSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null;

    const metadata = supabaseUser.user_metadata || {};
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      first_name: metadata.first_name || '',
      last_name: metadata.last_name || '',
      photo_url: metadata.photo_url,
      is_patriarch: metadata.is_patriarch || false,
      role: metadata.role || 'member',
      country: metadata.country,
      phone: metadata.phone,
      birth_date: metadata.birth_date,
      birth_place: metadata.birth_place,
      current_location: metadata.current_location,
      title: metadata.title,
      relationship_type: metadata.relationship_type,
      father_id: metadata.father_id,
      mother_id: metadata.mother_id,
      spouse_id: metadata.spouse_id,
      children_ids: metadata.children_ids || [],
      created_at: supabaseUser.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_metadata: metadata,
    };
  };

  useEffect(() => {
    // Vérifier la session actuelle
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          setUser(convertSupabaseUser(session.user));
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(convertSupabaseUser(session.user));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'USER_UPDATED' && session?.user) {
        setUser(convertSupabaseUser(session.user));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans votre arbre familial!",
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
      throw new Error(error.message || 'Erreur lors de la connexion');
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>): Promise<{ user: User }> => {
    try {
      console.log('Début de l\'inscription...');

      // Vérifier si c'est le premier utilisateur
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Erreur lors du comptage des utilisateurs:', countError);
        throw new Error('Erreur lors de la vérification des utilisateurs');
      }

      const isFirstUser = count === 0;
      console.log('Nombre d\'utilisateurs existants:', count);
      console.log('Est premier utilisateur:', isFirstUser);

      // Vérifier si l'email existe déjà
      const { data: existingUser, error: emailCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim())
        .single();

      if (emailCheckError && emailCheckError.code !== 'PGRST116') {
        console.error('Erreur lors de la vérification de l\'email:', emailCheckError);
        throw new Error('Erreur lors de la vérification de l\'email');
      }

      if (existingUser) {
        throw new Error('Cet email est déjà utilisé');
      }

      // Créer l'utilisateur avec le bon rôle
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: userData.first_name?.trim() || '',
            last_name: userData.last_name?.trim() || '',
            photo_url: userData.photo_url || null,
            is_patriarch: isFirstUser,
            role: isFirstUser ? 'patriarch' : 'member',
            country: userData.country?.trim() || null,
            phone: userData.phone?.trim() || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('Erreur lors de la création du compte');

      // Créer le profil utilisateur
      const profileData = {
        id: user.id,
        email: email.trim(),
        first_name: userData.first_name?.trim() || '',
        last_name: userData.last_name?.trim() || '',
        photo_url: userData.photo_url || null,
        is_patriarch: isFirstUser,
        role: isFirstUser ? 'patriarch' : 'member',
        country: userData.country?.trim() || null,
        phone: userData.phone?.trim() || null,
        birth_date: userData.birth_date || null,
        birth_place: userData.birth_place || null,
        current_location: userData.current_location || null,
        title: userData.title || null,
        relationship_type: userData.relationship_type || null,
        father_id: userData.father_id || null,
        mother_id: userData.mother_id || null,
        spouse_id: userData.spouse_id || null,
        children_ids: userData.children_ids || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Données du profil à créer:', profileData);

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select();

      if (profileError) {
        console.error('Erreur lors de la création du profil:', profileError);
        throw new Error(`Erreur lors de la création du profil: ${profileError.message}`);
      }

      // Si c'est le premier utilisateur, envoyer une notification
      if (isFirstUser) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([
            {
              user_id: user.id,
              type: 'patriarch_created',
              title: 'Nouveau Patriarche',
              message: `Un nouveau patriarche a été créé : ${userData.first_name} ${userData.last_name}`,
              data: { email: email.trim() },
              read: false,
              created_at: new Date().toISOString(),
            },
          ]);

        if (notificationError) {
          console.error('Erreur lors de la création de la notification:', notificationError);
        }
      }

      const createdUser = convertSupabaseUser(user);
      if (!createdUser) throw new Error('Erreur lors de la conversion de l\'utilisateur');

      toast({
        title: isFirstUser ? "Patriarche créé avec succès" : "Compte créé avec succès",
        description: isFirstUser
          ? "Vous êtes maintenant le patriarche de votre arbre familial!"
          : "Votre compte a été créé avec succès.",
      });

      return { user: createdUser };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      // Nettoyage des données locales avant la déconnexion
      clearLocalData();

      // Tentative de déconnexion via Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
        // En cas d'erreur, on force quand même le nettoyage
        forceLogout();
      } else {
        // Déconnexion réussie
        setUser(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error);
      // En cas d'erreur inattendue, on force le nettoyage
      forceLogout();
    }
  };

  const forceLogout = () => {
    // Nettoyage complet des données
    clearLocalData();

    // Suppression des cookies Supabase
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name.includes('supabase')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    });

    // Nettoyage du localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('family-tree')) {
        localStorage.removeItem(key);
      }
    });

    // Nettoyage du sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('family-tree')) {
        sessionStorage.removeItem(key);
      }
    });

    // Réinitialisation des états
    setUser(null);
    setLoading(false);
  };

  const clearLocalData = () => {
    // Nettoyage des données de l'application
    localStorage.removeItem('family-tree-auth');
    localStorage.removeItem('family-tree-session');
    localStorage.removeItem('family-tree-user');

    // Nettoyage des données de cache
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('family-tree')) {
            caches.delete(cacheName);
          }
        });
      });
    }
  };

  // Gestion des erreurs d'authentification
  useEffect(() => {
    const handleAuthError = (error: any) => {
      console.error('Erreur d\'authentification:', error);
      if (error?.message?.includes('JWT expired') ||
          error?.message?.includes('Invalid token') ||
          error?.status === 401) {
        forceLogout();
      }
    };

    // Écoute des erreurs d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        forceLogout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateUser = async (data: Partial<User>) => {
    try {
      if (!user?.id) {
        throw new Error("Utilisateur non connecté");
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user-metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          user_id: user.id,
          metadata: data,
          update_profile: true
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur lors de la mise à jour des métadonnées');
      }

      // Mettre à jour l'utilisateur local avec les données retournées
      if (responseData.data?.user) {
        setUser(responseData.data.user);
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    isLoading: loading,
    signIn,
    signUp,
    signOut: handleLogout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
