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

const ADMIN_SECRET_CODE = '1432';

export const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    photoUrl: '',
    country: '',
    role: 'member'
  });
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [pendingRole, setPendingRole] = useState<'member' | 'admin' | null>(null);

  // Redirection si déjà connecté
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

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
    setIsSubmitting(true);

    // Validation des champs obligatoires
    const requiredFields = ['email', 'password', 'firstName', 'lastName'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast({
        title: "❌ Champs manquants",
        description: `Veuillez remplir les champs suivants : ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validation du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "❌ Email invalide",
        description: "Veuillez entrer une adresse email valide",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validation du mot de passe
    if (formData.password.length < 6) {
      toast({
        title: "❌ Mot de passe trop court",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
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
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('Database error saving new user')) {
          throw new Error('Erreur lors de la création du compte. Veuillez vérifier vos informations et réessayer.');
        }
        throw signUpError;
      }

      if (!user) {
        throw new Error('Erreur lors de la création du compte. Veuillez réessayer.');
      }

      // Création du profil utilisateur
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            country: formData.country,
            phone: formData.phone,
            photo_url: formData.photoUrl,
            is_patriarch: formData.role === 'patriarch',
          },
        ]);

      if (profileError) {
        // Si erreur lors de la création du profil, supprimer l'utilisateur
        await supabase.auth.admin.deleteUser(user.id);
        throw new Error('Erreur lors de la création du profil. Veuillez réessayer.');
      }

      toast({
        title: "✅ Compte créé avec succès",
        description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
      });

      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "❌ Erreur d'inscription",
        description: error.message || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isSubmitting || authLoading}
                >
                  {isSubmitting ? (
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
