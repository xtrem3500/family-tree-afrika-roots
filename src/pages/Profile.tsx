import React, { useState, useEffect, useCallback } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
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
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const countries = [
    'Bénin', 'Burkina Faso', 'Cameroun', 'Côte d\'Ivoire', 'Ghana', 'Guinée',
    'Mali', 'Niger', 'Nigeria', 'Sénégal', 'Togo', 'République Démocratique du Congo',
    'Congo', 'Gabon', 'Tchad', 'République Centrafricaine', 'France', 'Canada', 'États-Unis'
  ];

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setFormData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          phone: data.phone || '',
          country: data.country || '',
          photoUrl: data.photo_url || '',
          currentLocation: data.current_location || '',
          situation: data.situation || '',
          birthDate: data.birth_date || '',
          birthPlace: data.birth_place || '',
          title: data.title || ''
        });
      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, toast]);

  const handlePhotoUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, photoUrl: url }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowPhotoModal(true);
    }
  };

  const handleConfirmPhoto = async () => {
    if (selectedFile) {
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`${Date.now()}-${selectedFile.name}`, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(uploadData.path);

        setFormData(prev => ({ ...prev, photoUrl: publicUrl }));
        setShowPhotoModal(false);
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: "Erreur lors de l'upload de la photo",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancelPhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowPhotoModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour mettre à jour votre profil",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || null,
        country: formData.country || null,
        photo_url: formData.photoUrl || null,
        current_location: formData.currentLocation || null,
        situation: formData.situation || null,
        birth_date: formData.birthDate || null,
        birth_place: formData.birthPlace || null,
        title: formData.title || null,
        updated_at: new Date().toISOString()
      };

      // Mettre à jour le profil via l'API Edge
      await updateUser(updateData);

      // Rafraîchir les données du profil depuis la base de données
      const { data: refreshedData, error: refreshError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (refreshError) throw refreshError;

      // Mettre à jour l'état local avec les données fraîches
      setFormData({
        firstName: refreshedData.first_name || '',
        lastName: refreshedData.last_name || '',
        phone: refreshedData.phone || '',
        country: refreshedData.country || '',
        photoUrl: refreshedData.photo_url || '',
        currentLocation: refreshedData.current_location || '',
        situation: refreshedData.situation || '',
        birthDate: refreshedData.birth_date || '',
        birthPlace: refreshedData.birth_place || '',
        title: refreshedData.title || ''
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
        description: error.message || "Une erreur est survenue lors de la mise à jour du profil",
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

  if (isLoading) {
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
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={previewUrl || formData.photoUrl} />
                      <AvatarFallback className="text-4xl">
                        {formData.firstName?.[0]}{formData.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={!isEditing}
                    />
                    <label
                      htmlFor="photo"
                      className={`absolute inset-0 flex items-center justify-center rounded-full transition-colors ${
                        isEditing ? 'hover:bg-black/20 cursor-pointer' : 'opacity-0 cursor-not-allowed'
                      }`}
                    >
                      <Camera className="h-8 w-8 text-white" />
                    </label>
                  </div>
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

      {/* Modal de confirmation de la photo */}
      <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
        <DialogContent className="sm:max-w-md" aria-describedby="photo-modal-description">
          <DialogHeader>
            <DialogTitle>Confirmer la photo de profil</DialogTitle>
          </DialogHeader>
          <div id="photo-modal-description" className="sr-only">
            Prévisualisation de la photo de profil sélectionnée
          </div>
          <div className="flex justify-center py-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={previewUrl || ''} />
              <AvatarFallback className="text-4xl">
                {formData.firstName?.[0]}{formData.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelPhoto}>
              Annuler
            </Button>
            <Button onClick={handleConfirmPhoto}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
