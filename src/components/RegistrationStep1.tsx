import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ProfilePhotoUpload } from '@/components/ProfilePhotoUpload';
import { useAuth } from '@/hooks/use-auth.tsx';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Fonction pour uploader une image
const uploadImage = async (file: File, userId: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Erreur lors du téléchargement de l\'image');
  }
};

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
    password: ''
  });
  const { signUp, isLoading } = useAuth();

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
      const { user } = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        photoUrl: formData.photoUrl
      });

      if (!user) throw new Error('No user data returned');

      // 2. Si la photo est en base64, l'uploader vers Supabase
      let finalPhotoUrl = formData.photoUrl;
      if (formData.photoUrl.startsWith('data:image')) {
        const response = await fetch(formData.photoUrl);
        const blob = await response.blob();
        const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
        finalPhotoUrl = await uploadImage(file, user.id);
      }

      // 3. Mettre à jour le profil avec toutes les informations
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          photo_url: finalPhotoUrl,
          country: formData.country,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 4. Mettre à jour les métadonnées de l'utilisateur
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          photo_url: finalPhotoUrl,
          display_name: `${formData.firstName} ${formData.lastName}`
        }
      });

      if (metadataError) throw metadataError;

      onNext({
        id: user.id,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        photoUrl: finalPhotoUrl,
        country: formData.country,
        role: 'member'
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
            Rejoignez votre famille sur Familiale Tree
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

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création du compte...
                </div>
              ) : (
                "Continuer l'inscription"
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
