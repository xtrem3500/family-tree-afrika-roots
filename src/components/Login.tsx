
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Header from './Header';
import Footer from './Footer';
import { Facebook, Mail, Lock, Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onShowRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onShowRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook OAuth
    console.log('Facebook login clicked');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-whatsapp-50 via-emerald-50 to-teal-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md">
          {/* Floating background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-20 h-20 bg-whatsapp-200/30 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-20 w-24 h-24 bg-teal-200/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <Card className="relative glass border-2 border-white/30 shadow-2xl animate-bounce-in">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="relative mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-whatsapp-400 via-emerald-500 to-teal-500 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-2xl glow">
                  <span className="text-white text-3xl">🌳</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gold-400 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-whatsapp-600 to-emerald-600 bg-clip-text text-transparent">
                  Connexion
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  Reconnectez-vous à votre famille 🤝
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Button 
                onClick={handleFacebookLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <Facebook className="w-5 h-5 mr-3" />
                Continuer avec Facebook
              </Button>

              <div className="relative">
                <Separator className="my-6" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3">
                  <span className="text-sm text-gray-500 font-medium">ou</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-whatsapp-500" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-2 border-gray-200 focus:border-whatsapp-400 rounded-xl py-3 transition-all duration-300"
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-whatsapp-500" />
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-2 border-gray-200 focus:border-whatsapp-400 rounded-xl py-3 transition-all duration-300"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <Button type="submit" className="w-full btn-modern text-lg py-3 mt-6">
                  Se connecter 🚀
                </Button>
              </form>

              <div className="text-center space-y-3 pt-4">
                <button className="text-sm text-whatsapp-600 hover:text-whatsapp-700 hover:underline transition-colors font-medium">
                  🔑 Mot de passe oublié ?
                </button>
                <div className="pt-2">
                  <span className="text-sm text-gray-600">Pas encore inscrit ? </span>
                  <button
                    onClick={onShowRegister}
                    className="text-sm text-whatsapp-600 hover:text-whatsapp-700 hover:underline font-semibold transition-colors"
                  >
                    S'inscrire maintenant ✨
                  </button>
                </div>
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
