
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

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
    <div className="min-h-screen bg-gradient-to-br from-earth-50 to-baobab-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-baobab-400 to-baobab-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-white text-2xl">🌳</span>
          </div>
          <CardTitle className="text-2xl font-bold text-baobab-800">Connexion</CardTitle>
          <p className="text-sm text-muted-foreground">
            Connectez-vous à votre arbre familial
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <Button 
            onClick={handleFacebookLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continuer avec Facebook
          </Button>

          <Separator className="my-4" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-baobab-600 hover:bg-baobab-700">
              Se connecter
            </Button>
          </form>

          <div className="text-center space-y-2">
            <button className="text-sm text-primary hover:underline block">
              Mot de passe oublié ?
            </button>
            <button
              onClick={onShowRegister}
              className="text-sm text-primary hover:underline"
            >
              Pas encore inscrit ? S'inscrire
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
