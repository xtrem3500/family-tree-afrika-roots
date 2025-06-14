import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    country: '',
    phone: '',
    photoUrl: '',
    birthDate: '',
    birthPlace: '',
    currentLocation: '',
    title: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Vérifier si l'utilisateur existe déjà
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        setError('Un compte existe déjà avec cet email');
        setLoading(false);
        return;
      }

      // Vérifier si c'est le premier utilisateur
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const isFirstUser = count === 0;

      // Créer l'utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: isFirstUser ? 'patriarch' : 'member',
            country: formData.country,
            phone: formData.phone,
            photo_url: formData.photoUrl,
            birth_date: formData.birthDate,
            birth_place: formData.birthPlace,
            current_location: formData.currentLocation,
            title: formData.title,
            is_patriarch: isFirstUser,
          },
        },
      });

      if (authError) throw authError;

      if (authData?.user) {
        // Créer le profil
        const headers = new Headers();
        addCorsHeaders(headers);

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              first_name: formData.firstName,
              last_name: formData.lastName,
              role: isFirstUser ? 'patriarch' : 'member',
              country: formData.country,
              phone: formData.phone,
              photo_url: formData.photoUrl,
              birth_date: formData.birthDate,
              birth_place: formData.birthPlace,
              current_location: formData.currentLocation,
              title: formData.title,
              is_patriarch: isFirstUser,
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error(`Erreur lors de la création du profil: ${profileError.message}`);
        }

        toast({
          title: "✅ Compte créé avec succès",
          description: isFirstUser
            ? "Votre compte a été créé avec succès. Vous êtes maintenant le patriarche de votre arbre familial."
            : "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
        });

        // Rediriger vers la page de connexion
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Form code */}
    </div>
  );
};

export default Register;
