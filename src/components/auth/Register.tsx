import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ProfilePhotoUpload } from '@/components/ProfilePhotoUpload';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Facebook, UserPlus, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { addCorsHeaders, handleOptionsRequest } from '@/integrations/supabase/middleware';

const ADMIN_SECRET_CODE = '1432';

export const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    photoUrl: '',
    birthDate: '',
    birthPlace: '',
    currentLocation: '',
    title: '',
    role: 'member'
  });
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [pendingRole, setPendingRole] = useState<'member' | 'admin' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirection si déjà connecté
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  React.useEffect(() => {
    const checkFirstUser = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setIsFirstUser(count === 0);
    };

    checkFirstUser();
  }, []);

  // Mettre à jour le rôle quand isFirstUser change
  useEffect(() => {
    if (isFirstUser) {
      setFormData(prev => ({ ...prev, role: 'patriarch' }));
    }
  }, [isFirstUser]);

  const countries = [
    'Bénin', 'Burkina Faso', 'Cameroun', 'Côte d\'Ivoire', 'Ghana', 'Guinée',
    'Mali', 'Niger', 'Nigeria', 'Sénégal', 'Togo', 'République Démocratique du Congo',
    'Congo', 'Gabon', 'Tchad', 'République Centrafricaine', 'France', 'Canada', 'États-Unis'
  ];

  const handlePhotoUploaded = (url: string) => {
    setFormData({ ...formData, photoUrl: url });
  };

  const handleFacebookSignUp = async () => {
    // TODO: Implement Facebook OAuth signup
    console.log('Facebook signup clicked');
  };

  const handleRoleChange = (value: string) => {
    if (value === 'admin') {
      setPendingRole('admin');
      setShowAdminDialog(true);
    } else {
      setFormData(prev => ({ ...prev, role: value as 'member' }));
    }
  };

  const handleAdminCodeSubmit = () => {
    if (adminCode === ADMIN_SECRET_CODE) {
      setFormData(prev => ({ ...prev, role: 'admin' }));
      setShowAdminDialog(false);
      setAdminCode('');
      toast({
        title: "Code admin validé",
        description: "Vous avez maintenant les droits d'administrateur",
      });
    } else {
      toast({
        title: "Code incorrect",
        description: "Le code admin n'est pas valide",
        variant: "destructive",
      });
      setFormData(prev => ({ ...prev, role: 'member' }));
    }
    setPendingRole(null);
  };

  const handleAdminDialogClose = () => {
    setShowAdminDialog(false);
    setAdminCode('');
    setPendingRole(null);
    setFormData(prev => ({ ...prev, role: 'member' }));
  };

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

      // Créer l'utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            country: formData.country,
            phone: formData.phone,
            photo_url: formData.photoUrl,
            birth_date: formData.birthDate,
            birth_place: formData.birthPlace,
            current_location: formData.currentLocation,
            title: formData.title,
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
              role: formData.role,
              country: formData.country,
              phone: formData.phone,
              photo_url: formData.photoUrl,
              birth_date: formData.birthDate,
              birth_place: formData.birthPlace,
              current_location: formData.currentLocation,
              title: formData.title,
              is_patriarch: formData.role === 'patriarch',
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
          description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
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

  if (isFirstUser === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4 pt-24">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="space-y-1 bg-gradient-to-br from-blue-50 to-blue-100/50 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold">
                    {isFirstUser ? "Créer votre arbre généalogique" : "Rejoindre l'arbre familial"}
                  </CardTitle>
                  <CardDescription>
                    {isFirstUser
                      ? "Créez votre compte pour commencer à construire votre arbre généalogique"
                      : "Créez votre compte pour rejoindre l'arbre généalogique de votre famille"}
                  </CardDescription>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-6">
                <div className="flex justify-center mb-6">
                  <ProfilePhotoUpload
                    currentPhotoUrl={formData.photoUrl}
                    onPhotoUploaded={handlePhotoUploaded}
                    userInitials={`${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Votre prénom"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Votre nom"
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
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rôle dans la famille</Label>
                  <Select
                    value={formData.role}
                    onValueChange={handleRoleChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-blue-600" />
                          Administrateur
                        </div>
                      </SelectItem>
                      <SelectItem value="member">Membre</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.role === 'admin' && (
                    <p className="text-xs text-blue-600 mt-1">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Vous aurez accès à toutes les fonctionnalités d'administration
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500">
                    Le mot de passe doit contenir au moins 6 caractères
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="transition-all duration-300 focus:scale-105"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                  >
                    <SelectTrigger className="transition-all duration-300 focus:scale-105">
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
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthPlace">Lieu de naissance</Label>
                  <Input
                    id="birthPlace"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    placeholder="Ex: Cotonou, Bénin"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentLocation">Localisation actuelle</Label>
                  <Input
                    id="currentLocation"
                    value={formData.currentLocation}
                    onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                    placeholder="Ex: Cotonou, Bénin"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Titre/Fonction</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Étudiant, Ingénieur..."
                    required
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isSubmitting || authLoading || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création du compte...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {isFirstUser ? "Créer mon compte" : "Rejoindre la famille"}
                    </>
                  )}
                </Button>
                <div className="text-center text-sm text-gray-500">
                  Déjà un compte ?{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                  >
                    Se connecter
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
        <Footer />
      </div>

      <Dialog
        open={showAdminDialog}
        onOpenChange={handleAdminDialogClose}
      >
        <DialogContent
          title="Code d'accès administrateur"
          description="Pour devenir administrateur, veuillez entrer le code secret à 4 chiffres. Ce code est nécessaire pour accéder aux fonctionnalités d'administration."
        >
          <div className="py-4">
            <Input
              type="password"
              placeholder="Entrez le code secret"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className="text-center text-lg tracking-widest"
              maxLength={4}
              autoFocus
              aria-label="Code secret administrateur"
              aria-describedby="admin-code-description"
            />
            <p id="admin-code-description" className="text-xs text-gray-500 mt-2">
              Le code doit contenir exactement 4 chiffres
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleAdminDialogClose}
              aria-label="Annuler la saisie du code"
            >
              Annuler
            </Button>
            <Button
              onClick={handleAdminCodeSubmit}
              className="bg-blue-600 hover:bg-blue-700"
              aria-label="Valider le code administrateur"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validation...
                </>
              ) : (
                'Valider'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Register;
