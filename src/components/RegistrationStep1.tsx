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
import { Loader2, Lock, Unlock, Camera, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useStorage } from '@/hooks/use-storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom';

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
    mother_id: '',
    isPatriarch: false
  });
  const { signUp, isLoading } = useAuth();
  const { uploadImage } = useStorage();
  const [isFirstUser, setIsFirstUser] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [unlockedFields, setUnlockedFields] = useState({
    title: false,
    birthDate: false,
    birthPlace: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const checkFirstUser = async () => {
      try {
        console.log('Checking for patriarch...');

        // Requête directe à l'API REST de Supabase
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=*&is_patriarch=eq.true`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Direct API response:', data);

        const hasPatriarch = Array.isArray(data) && data.length > 0;

        if (isMounted) {
          setIsFirstUser(!hasPatriarch);
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Error in checkFirstUser:', error);
        if (isMounted) {
          setIsChecking(false);
          toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la vérification. Veuillez réessayer.",
            variant: "destructive",
          });
        }
      }
    };

    checkFirstUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // Si nous sommes encore en train de vérifier, ne rien afficher
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-earth-50 to-baobab-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-baobab-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si isFirstUser est null après la vérification, afficher une erreur
  if (isFirstUser === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-earth-50 to-baobab-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="text-center p-8">
            <p className="text-red-600">Une erreur est survenue lors de la vérification du patriarche.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const countries = [
    'Bénin', 'Burkina Faso', 'Cameroun', 'Côte d\'Ivoire', 'Ghana', 'Guinée',
    'Mali', 'Niger', 'Nigeria', 'Sénégal', 'Togo', 'République Démocratique du Congo',
    'Congo', 'Gabon', 'Tchad', 'République Centrafricaine', 'France', 'Canada', 'États-Unis'
  ];

  const handlePhotoUploaded = (url: string) => {
    setFormData({ ...formData, photoUrl: url });
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

  const handleConfirmPhoto = () => {
    setShowPhotoModal(false);
  };

  const handleCancelPhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowPhotoModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Vérifier si une photo a été sélectionnée
      if (!selectedFile) {
        toast({
          title: "Photo requise",
          description: "Veuillez sélectionner une photo de profil",
          variant: "destructive",
        });
        return;
      }

      // Vérifier la taille du fichier (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale autorisée est de 5MB",
          variant: "destructive",
        });
        return;
      }

      // Vérifier si l'email existe déjà
      const { data: existingUser, error: emailCheckError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        toast({
          title: "Email déjà utilisé",
          description: "Cette adresse email est déjà associée à un compte",
          variant: "destructive",
        });
        return;
      }

      // Upload de la photo avec des options optimisées
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${Date.now()}-${selectedFile.name}`, selectedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: selectedFile.type,
          duplex: 'half'
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Obtenir l'URL publique de la photo
      const { data: { publicUrl: finalPhotoUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);

      // Préparer les données d'inscription
      const registrationData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || null,
        photo_url: finalPhotoUrl,
        country: formData.country || null,
        title: formData.title || null,
        birth_place: formData.birthPlace || null,
        birth_date: formData.birthDate || null,
        is_patriarch: isFirstUser,
        relationship_type: formData.relationship_type || null,
        father_id: formData.father_id || null,
        mother_id: formData.mother_id || null
      };

      // Appeler notre fonction Edge pour l'inscription
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'inscription');
      }

      const responseData = await response.json();

      // Connexion automatique après l'inscription
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        throw signInError;
      }

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
      });

      // Rediriger vers le dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            <div className="space-y-2">
              <Label htmlFor="photo">Photo de profil</Label>
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
                  />
                  <label
                    htmlFor="photo"
                    className="absolute inset-0 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-whatsapp-600/20 cursor-pointer group"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-whatsapp-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                      <Camera className="h-8 w-8 text-whatsapp-600 group-hover:text-whatsapp-700 transition-all duration-300 group-hover:scale-110" />
                    </div>
                  </label>
                </div>
              </div>
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
              <div className="relative">
              <Input
                id="password"
                  type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-9"
                required
              />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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

      {/* Modal de confirmation de la photo */}
      <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la photo de profil</DialogTitle>
          </DialogHeader>
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

export default RegistrationStep1;
