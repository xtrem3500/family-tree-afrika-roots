
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RegistrationStep2MemberProps {
  userData: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

const RegistrationStep2Member: React.FC<RegistrationStep2MemberProps> = ({ userData, onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    birthDate: '',
    birthPlace: '',
    currentLocation: '',
    title: '',
    fatherName: '',
    motherName: '',
    relatedMember: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ ...userData, ...formData, role: 'member' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 to-baobab-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-whatsapp-400 to-whatsapp-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-white text-2xl">🤝</span>
          </div>
          <CardTitle className="text-xl font-bold">Validation de votre lien familial</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pour rejoindre l'arbre, vérifions votre connexion familiale
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
                placeholder="ex: Étudiant, Ingénieur..."
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Section Parents</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Nom / Prénom du père</Label>
                  <Input
                    id="fatherName"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="Prénom Nom"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherName">Nom / Prénom de la mère</Label>
                  <Input
                    id="motherName"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    placeholder="Prénom Nom"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Section Connexion</h3>
              <div className="space-y-2">
                <Label htmlFor="relatedMember">Rechercher un membre existant à relier</Label>
                <Input
                  id="relatedMember"
                  value={formData.relatedMember}
                  onChange={(e) => setFormData({ ...formData, relatedMember: e.target.value })}
                  placeholder="Tapez le nom d'un membre de la famille..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Recherchez un membre déjà inscrit pour établir votre lien familial
                </p>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Retour
              </Button>
              <Button type="submit" className="flex-1 bg-whatsapp-600 hover:whatsapp-700">
                Soumettre la demande
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationStep2Member;
