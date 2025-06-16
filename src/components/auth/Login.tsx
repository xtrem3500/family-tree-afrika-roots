import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Sparkles, Facebook, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading, user } = useAuth();
  const navigate = useNavigate();

  // Redirection si déjà connecté
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // L'erreur est déjà gérée dans le hook useAuth
      console.error('Login error:', error);
    }
  };

  const handleFacebookLogin = async () => {
    // TODO: Implement Facebook OAuth
    console.log('Facebook login clicked');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-whatsapp-50 via-emerald-50 to-teal-50">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 pt-24 pb-32">
        <div className="w-full max-w-md">
          {/* Floating background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-20 h-20 bg-whatsapp-200/30 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-20 w-24 h-24 bg-teal-200/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <Card className="relative shadow-2xl animate-fade-in">
            <CardHeader className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-whatsapp-400 to-whatsapp-600 rounded-full mx-auto flex items-center justify-center mb-4 animate-bounce-in">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-whatsapp-800">Familiale Tree</CardTitle>
              <p className="text-sm text-muted-foreground">par Thierry Gogo</p>
              <p className="text-sm text-center text-muted-foreground">
                Connectez-vous à votre arbre familial
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button
                onClick={handleFacebookLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Continuer avec Facebook
              </Button>

              <Separator className="my-4" />

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 transition-all duration-300 focus:scale-105"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 transition-all duration-300 focus:scale-105"
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

                <Button
                  type="submit"
                  className="w-full bg-whatsapp-600 hover:bg-whatsapp-700 transition-all duration-300 hover:scale-105"
                  disabled={loading}
                >
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
              </form>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => navigate('/register')}
                  className="text-sm text-primary hover:scale-105 transition-transform duration-300"
                >
                  Pas encore inscrit ? Créer un compte
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

export default Login;
