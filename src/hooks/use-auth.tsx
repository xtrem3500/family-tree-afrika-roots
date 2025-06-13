import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User as CustomUser } from '@/types/user';

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<CustomUser>) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<CustomUser>) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Convertir l'utilisateur Supabase en notre type personnalisé
  const convertSupabaseUser = (supabaseUser: SupabaseUser | null): CustomUser | null => {
    if (!supabaseUser) return null;

    const metadata = supabaseUser.user_metadata || {};
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      first_name: metadata.first_name || '',
      last_name: metadata.last_name || '',
      photo_url: metadata.photo_url,
      is_patriarch: metadata.is_patriarch || false,
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

  const signUp = async (email: string, password: string, userData: Partial<CustomUser>) => {
    // Validation des champs obligatoires
    if (!email || !password) {
      throw new Error('Email et mot de passe requis');
    }

    // Validation du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Format d\'email invalide');
    }

    // Validation du mot de passe
    if (password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }

    // Validation des données utilisateur
    if (!userData.first_name?.trim() || !userData.last_name?.trim()) {
      throw new Error('Prénom et nom requis');
    }

    try {
      // Vérifier si l'email existe déjà dans la table profiles
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email.trim())
        .maybeSingle();

      if (profileCheckError) {
        console.error('Erreur lors de la vérification du profil:', profileCheckError);
        throw new Error('Erreur lors de la vérification de l\'email');
      }

      if (existingProfile) {
        throw new Error('Cet email est déjà utilisé');
      }

      // Créer l'utilisateur
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: userData.first_name.trim(),
            last_name: userData.last_name.trim(),
            photo_url: userData.photo_url || null,
            is_patriarch: userData.is_patriarch || false,
            role: userData.role || 'member',
            country: userData.country?.trim() || null,
            phone: userData.phone?.trim() || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error('Erreur lors de la création de l\'utilisateur:', signUpError);
        if (signUpError.message.includes('User already registered')) {
          throw new Error('Cet email est déjà utilisé');
        }
        throw new Error('Erreur lors de la création du compte. Veuillez réessayer.');
      }

      if (!user) {
        throw new Error('Erreur lors de la création du compte');
      }

      // Créer le profil utilisateur avec tous les champs requis
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: email.trim(),
            first_name: userData.first_name.trim(),
            last_name: userData.last_name.trim(),
            photo_url: userData.photo_url || null,
            is_patriarch: userData.is_patriarch || false,
            role: userData.role || 'member',
            country: userData.country?.trim() || null,
            phone: userData.phone?.trim() || null,
            birth_date: null,
            birth_place: null,
            current_location: null,
            title: null,
            relationship_type: null,
            father_id: null,
            mother_id: null,
            spouse_id: null,
            children_ids: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (profileError) {
        console.error('Erreur lors de la création du profil:', profileError);
        // Si erreur lors de la création du profil, supprimer l'utilisateur
        try {
          await supabase.auth.admin.deleteUser(user.id);
        } catch (deleteError) {
          console.error('Erreur lors de la suppression de l\'utilisateur:', deleteError);
        }

        if (profileError.code === '23505') { // Code d'erreur pour violation de contrainte unique
          throw new Error('Cet email est déjà utilisé');
        }
        throw new Error('Erreur lors de la création du profil. Veuillez réessayer.');
      }

      toast({
        title: "✅ Inscription réussie",
        description: "Votre compte a été créé avec succès. Veuillez vérifier votre email pour confirmer votre compte.",
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "❌ Erreur d'inscription",
        description: error.message || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const user = supabase.auth.getUser();
      if (!user) return;

      // Appel de notre fonction edge logout
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ user_id: (await user).data.user?.id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la déconnexion');
      }

      // Nettoyer la session localement
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateUser = async (data: Partial<CustomUser>) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          photo_url: data.photo_url,
          is_patriarch: data.is_patriarch,
        },
      });
      if (error) throw error;

      // Mettre à jour l'utilisateur local
      if (user) {
        setUser({
          ...user,
          ...data,
          updated_at: new Date().toISOString(),
        });
      }

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
    } catch (error: any) {
      console.error('Update user error:', error);
      toast({
        title: "Erreur de mise à jour",
        description: error.message,
        variant: "destructive",
      });
      throw new Error(error.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
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
