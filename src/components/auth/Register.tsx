
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ProfilePhotoUpload } from '@/components/ProfilePhotoUpload';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Sparkles, Facebook } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    photoUrl: '',
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    phone: '',
    password: ''
  });
  const [isFirstUser, setIsFirstUser] = useState<boolean | null>(null);
  const { signUp, isLoading, user } = useAuth();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user } = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        photoUrl: formData.photoUrl
      });

      if (!user) throw new Error('No user data returned');

      // Si c'est le premier utilisateur, il devient patriarche automatiquement
      const role = isFirstUser ? 'patriarch' : 'member';

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          photo_url: formData.photoUrl,
          country: formData.country,
          role: role,
          is_patriarch: isFirstUser,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: isFirstUser ? "Arbre familial créé!" : "Inscription réussie!",
        description: isFirstUser 
          ? "Vous êtes maintenant le patriarche de votre arbre familial."
          : "Votre compte a été créé avec succès.",
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

  const getUserInitials = () => {
    const firstInitial = formData.firstName.charAt(0).toUpperCase();
    const lastInitial = formData.lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}` || 'PR';
  };

  if (isFirstUser === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-earth-50 to-baobab-100">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 pt-24 pb-32">
        <div className="w-full max-w-md">
          {/* Floating background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-20 h-20 bg-baobab-200/30 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-10 w-32 h-32 bg-earth-200/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-20 w-24 h-24 bg-whatsapp-200/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <Card className="shadow-2xl animate-fade-in">
            <CardHeader className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-baobab-400 to-baobab-600 rounded-full mx-auto flex items-center justify-center mb-4 animate-bounce-in">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-baobab-800">Familiale Tree</CardTitle>
              <p className="text-sm text-muted-foreground">par Thierry Gogo</p>
              <p className="text-sm text-center text-muted-foreground">
                {isFirstUser 
                  ? "Créez votre arbre familial" 
                  : "Rejoignez votre famille sur Familiale Tree"
                }
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button
                onClick={handleFacebookSignUp}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105"
              >
                <Facebook className="w-4 h-4 mr-2" />
                S'inscrire avec Facebook
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
                      className="transition-all duration-300 focus:scale-105"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="transition-all duration-300 focus:scale-105"
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
                    className="transition-all duration-300 focus:scale-105"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
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
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="transition-all duration-300 focus:scale-105"
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
                    className="transition-all duration-300 focus:scale-105"
                    required
                  />
                </div>

                {!isFirstUser && (
                  <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200 animate-slide-in-right">
                    <h3 className="font-semibold text-amber-800">Informations familiales</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fatherName">Nom du père</Label>
                        <Input
                          id="fatherName"
                          placeholder="Nom complet"
                          className="transition-all duration-300 focus:scale-105"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="motherName">Nom de la mère</Label>
                        <Input
                          id="motherName"
                          placeholder="Nom complet"
                          className="transition-all duration-300 focus:scale-105"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="familyMember">Membre de la famille déjà inscrit</Label>
                      <Input
                        id="familyMember"
                        placeholder="Email ou nom du membre"
                        className="transition-all duration-300 focus:scale-105"
                        required
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création du compte...
                    </div>
                  ) : (
                    isFirstUser ? "Créer mon arbre familial" : "Rejoindre la famille"
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => window.location.href = '/login'}
                  className="text-sm text-primary hover:scale-105 transition-transform duration-300"
                >
                  Déjà inscrit ? Se connecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
