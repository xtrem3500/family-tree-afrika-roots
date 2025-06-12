
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RegistrationStep2CreatorProps {
  userData: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

const RegistrationStep2Creator: React.FC<RegistrationStep2CreatorProps> = ({ userData, onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    birthDate: '',
    birthPlace: '',
    currentLocation: '',
    title: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ ...userData, ...formData, role: 'patriarch' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 to-baobab-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-baobab-400 to-baobab-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-white text-2xl">👑</span>
          </div>
          <CardTitle className="text-xl font-bold">Ajouter vos informations complémentaires</CardTitle>
          <p className="text-sm text-muted-foreground">
            En tant que premier membre, vous devenez le patriarche de l'arbre familial
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Ville, Pays"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentLocation">Localisation actuelle</Label>
              <Input
                id="currentLocation"
                value={formData.currentLocation}
                onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                placeholder="Ville, Pays"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Titre/Fonction</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="ex: Chef d'entreprise, Médecin..."
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Retour
              </Button>
              <Button type="submit" className="flex-1 bg-baobab-600 hover:bg-baobab-700">
                Terminer votre inscription
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationStep2Creator;
