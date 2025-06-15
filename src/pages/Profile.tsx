import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfilePhotoUpload from '@/components/shared/ProfilePhotoUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { CustomUser } from '@/types/user';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    photoUrl: '',
    currentLocation: '',
    situation: '',
    birthDate: '',
    birthPlace: '',
    title: ''
  });

  const countries = [
    'Bénin', 'Burkina Faso', 'Cameroun', 'Côte d\'Ivoire', 'Ghana', 'Guinée',
    'Mali', 'Niger', 'Nigeria', 'Sénégal', 'Togo', 'République Démocratique du Congo',
    'Congo', 'Gabon', 'Tchad', 'République Centrafricaine', 'France', 'Canada', 'États-Unis'
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        phone: user.phone || '',
        country: user.country || '',
        photoUrl: user.photo_url || '',
        currentLocation: user.current_location || '',
        situation: user.situation || '',
        birthDate: user.birth_date || '',
        birthPlace: user.birth_place || '',
        title: user.title || ''
      });
    }
  }, [user]);

  const handlePhotoUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, photoUrl: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mettre à jour le profil dans Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          country: formData.country,
          photo_url: formData.photoUrl,
          current_location: formData.currentLocation,
          situation: formData.situation,
          birth_date: formData.birthDate,
          birth_place: formData.birthPlace,
          title: formData.title,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Mettre à jour les métadonnées de l'utilisateur
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          photo_url: formData.photoUrl,
          current_location: formData.currentLocation,
          situation: formData.situation,
          birth_date: formData.birthDate,
          birth_place: formData.birthPlace,
          title: formData.title,
        }
      });

      if (userError) throw userError;

      // Mettre à jour l'utilisateur local
      await updateUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        country: formData.country,
        photo_url: formData.photoUrl,
        current_location: formData.currentLocation,
        situation: formData.situation,
        birth_date: formData.birthDate,
        birth_place: formData.birthPlace,
        title: formData.title,
      });

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-whatsapp-50 via-emerald-50 to-teal-50">
      <Header />

      <main className="flex-1 pt-24 pb-32">
        <div className="container mx-auto p-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold text-whatsapp-800">
                Mon Profil
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="text-whatsapp-600 hover:text-whatsapp-700"
              >
                {isEditing ? 'Annuler' : 'Modifier'}
              </Button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center">
                  <ProfilePhotoUpload
                    currentPhotoUrl={user.photo_url}
                    onPhotoUploaded={handlePhotoUploaded}
                    userInitials={`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`}
                    size="lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-100' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-100' : ''}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={!isEditing ? 'bg-gray-100' : ''}>
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
                  <Label htmlFor="birthDate">Date de naissance</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthPlace">Lieu de naissance</Label>
                  <Input
                    id="birthPlace"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                    placeholder="Ex: Cotonou, Bénin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentLocation">Localisation actuelle</Label>
                  <Input
                    id="currentLocation"
                    value={formData.currentLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentLocation: e.target.value }))}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                    placeholder="Ex: Cotonou, Bénin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Titre/Fonction</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                    placeholder="Ex: Étudiant, Ingénieur..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="situation">Situation professionnelle</Label>
                  <Input
                    id="situation"
                    value={formData.situation}
                    onChange={(e) => setFormData(prev => ({ ...prev, situation: e.target.value }))}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                    placeholder="Ex: CADRE A LA RETRAITE, ancien douanier"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Indiquez votre situation actuelle ou votre dernier poste occupé
                  </p>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Mise à jour...
                        </div>
                      ) : (
                        "Enregistrer les modifications"
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
