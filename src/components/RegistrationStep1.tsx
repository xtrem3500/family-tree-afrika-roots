import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import ProfilePhotoUpload from '@/components/shared/ProfilePhotoUpload';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Lock, Unlock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useStorage } from '@/hooks/use-storage';

interface RegistrationStep1Props {
  onNext: (data: any) => void;
  onShowLogin: () => void;
}

const RegistrationStep1: React.FC<RegistrationStep1Props> = ({ onNext, onShowLogin }) => {
  const [formData, setFormData] = useState({
    photoUrl: '',
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    phone: '',
    password: '',
    title: '',
    birthPlace: '',
    birthDate: '',
    relationship_type: '',
    father_id: '',
    mother_id: ''
  });
  const { signUp, isLoading } = useAuth();
  const { uploadImage } = useStorage();
  const [isFirstUser, setIsFirstUser] = useState<boolean | null>(null);
  const [unlockedFields, setUnlockedFields] = useState({
    title: false,
    birthDate: false,
    birthPlace: false
  });

  useEffect(() => {
    const checkFirstUser = async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (!error) {
        setIsFirstUser(count === 0);
      }
    };
    checkFirstUser();
  }, []);

  const countries = [
    'Bénin', 'Burkina Faso', 'Cameroun', 'Côte d\'Ivoire', 'Ghana', 'Guinée',
    'Mali', 'Niger', 'Nigeria', 'Sénégal', 'Togo', 'République Démocratique du Congo',
    'Congo', 'Gabon', 'Tchad', 'République Centrafricaine', 'France', 'Canada', 'États-Unis'
  ];

  const handlePhotoUploaded = (url: string) => {
    setFormData({ ...formData, photoUrl: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Créer l'utilisateur dans auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            photo_url: formData.photoUrl,
            is_patriarch: false, // Sera déterminé par le trigger
            role: 'member', // Sera déterminé par le trigger
            title: unlockedFields.title ? formData.title : null,
            birth_place: unlockedFields.birthPlace ? formData.birthPlace : null,
            birth_date: unlockedFields.birthDate ? formData.birthDate : null
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      // Attendre que le trigger ait fini (1-2s)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Si la photo est en base64, l'uploader vers Supabase
      let finalPhotoUrl = formData.photoUrl;
      /* Temporairement commenté pour garder l'ancienne méthode
      if (formData.photoUrl.startsWith('data:image')) {
        const response = await fetch(formData.photoUrl);
        const blob = await response.blob();
        const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
        finalPhotoUrl = await uploadImage(file, authData.user.id);
      }
      */

      // 3. Mettre à jour le profil avec les informations supplémentaires
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          photo_url: finalPhotoUrl,
          country: formData.country,
          title: unlockedFields.title ? formData.title : null,
          birth_place: unlockedFields.birthPlace ? formData.birthPlace : null,
          birth_date: unlockedFields.birthDate ? formData.birthDate : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Récupérer le profil final
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (fetchError) throw fetchError;

      // Afficher le message de succès
      toast({
        title: "Inscription réussie !",
        description: profile.is_patriarch
          ? "Vous êtes maintenant le patriarche de votre arbre familial."
          : "Bienvenue dans l'arbre familial !",
        variant: "default",
      });

      onNext({
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        photoUrl: profile.photo_url,
        country: profile.country,
        is_patriarch: profile.is_patriarch,
        role: profile.role,
        title: profile.title,
        birthPlace: profile.birth_place,
        birthDate: profile.birth_date
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook OAuth
    console.log('Facebook login clicked');
  };

  const getUserInitials = () => {
    const firstInitial = formData.firstName.charAt(0).toUpperCase();
    const lastInitial = formData.lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}` || 'PR';
  };

  const toggleFieldLock = (field: keyof typeof unlockedFields) => {
    setUnlockedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 to-baobab-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-baobab-400 to-baobab-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-white text-2xl">🌳</span>
          </div>
          <CardTitle className="text-2xl font-bold text-baobab-800">Familiale Tree</CardTitle>
          <p className="text-sm text-muted-foreground">par Thierry Gogo</p>
          <p className="text-sm text-center text-muted-foreground">
            {isFirstUser
              ? "Devenez le patriarche de votre arbre familial"
              : "Rejoignez votre arbre familial"}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            onClick={handleFacebookLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continuer avec Facebook
          </Button>

          <Separator className="my-4" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center">
              <ProfilePhotoUpload
                currentPhotoUrl={formData.photoUrl}
                onPhotoUploaded={handlePhotoUploaded}
                userInitials={getUserInitials()}
                size="md"
              />
            </div>

            {/* Champs obligatoires */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {/* Champs spécifiques au patriarche */}
            {isFirstUser && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {/* Champs optionnels (toujours visibles) */}
            <Separator className="my-4" />
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500">Informations optionnelles</h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title" className="flex items-center gap-2">
                    Titre/Fonction
                    <button
                      type="button"
                      onClick={() => toggleFieldLock('title')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {unlockedFields.title ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </button>
                  </Label>
                </div>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Ingénieur, Médecin, etc."
                  disabled={!unlockedFields.title}
                  className={!unlockedFields.title ? "bg-gray-100" : ""}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="birthDate" className="flex items-center gap-2">
                      Date de naissance
                      <button
                        type="button"
                        onClick={() => toggleFieldLock('birthDate')}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {unlockedFields.birthDate ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </button>
                    </Label>
                  </div>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    disabled={!unlockedFields.birthDate}
                    className={!unlockedFields.birthDate ? "bg-gray-100" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="birthPlace" className="flex items-center gap-2">
                      Lieu de naissance
                      <button
                        type="button"
                        onClick={() => toggleFieldLock('birthPlace')}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {unlockedFields.birthPlace ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </button>
                    </Label>
                  </div>
                  <Input
                    id="birthPlace"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    placeholder="Ex: Abidjan, Côte d'Ivoire"
                    disabled={!unlockedFields.birthPlace}
                    className={!unlockedFields.birthPlace ? "bg-gray-100" : ""}
                  />
                </div>
              </div>
            </div>

            {/* Champs spécifiques aux membres */}
            {!isFirstUser && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500">Relation familiale</h3>
                  <div className="space-y-2">
                    <Label htmlFor="relationship_type">Relation avec le patriarche</Label>
                    <Select
                      value={formData.relationship_type}
                      onValueChange={(value) => setFormData({ ...formData, relationship_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre relation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="child">Enfant</SelectItem>
                        <SelectItem value="spouse">Conjoint(e)</SelectItem>
                        <SelectItem value="sibling">Frère/Soeur</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="father_id">ID du père (optionnel)</Label>
                    <Input
                      id="father_id"
                      value={formData.father_id}
                      onChange={(e) => setFormData({ ...formData, father_id: e.target.value })}
                      placeholder="ID du père dans l'arbre"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mother_id">ID de la mère (optionnel)</Label>
                    <Input
                      id="mother_id"
                      value={formData.mother_id}
                      onChange={(e) => setFormData({ ...formData, mother_id: e.target.value })}
                      placeholder="ID de la mère dans l'arbre"
                    />
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isFirstUser ? "Création du patriarche..." : "Création du compte..."}
                </div>
              ) : (
                isFirstUser ? "Créer le patriarche" : "Rejoindre l'arbre familial"
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={onShowLogin}
              className="text-sm text-primary hover:underline"
            >
              Déjà inscrit ? Se connecter
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationStep1;
