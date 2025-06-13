import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth.tsx';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface RegistrationStep2MemberProps {
  userData: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

const RegistrationStep2Member: React.FC<RegistrationStep2MemberProps> = ({
  userData,
  onComplete,
  onBack
}) => {
  const [formData, setFormData] = useState({
    birthDate: '',
    birthPlace: '',
    currentLocation: '',
    title: '',
    fatherName: '',
    motherName: '',
    familyMemberEmail: ''
  });
  const { updateProfile, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        ...formData,
        role: 'member',
        status: 'pending'
      });

      onComplete({
        ...userData,
        ...formData,
        role: 'member',
        status: 'pending'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 to-baobab-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-baobab-800">
            Validation de votre lien familial
          </CardTitle>
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
                placeholder="Ville, Pays"
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentLocation">Localisation actuelle</Label>
              <Input
                id="currentLocation"
                placeholder="Ville, Pays"
                value={formData.currentLocation}
                onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Titre/Fonction</Label>
              <Input
                id="title"
                placeholder="ex: Étudiant, Ingénieur..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherName">Nom du père</Label>
              <Input
                id="fatherName"
                placeholder="Nom complet du père"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherName">Nom de la mère</Label>
              <Input
                id="motherName"
                placeholder="Nom complet de la mère"
                value={formData.motherName}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyMemberEmail">Membre de la famille déjà inscrit</Label>
              <Input
                id="familyMemberEmail"
                placeholder="Email ou nom du membre"
                value={formData.familyMemberEmail}
                onChange={(e) => setFormData({ ...formData, familyMemberEmail: e.target.value })}
                required
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                Retour
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Soumission...
                  </div>
                ) : (
                  "Soumettre la demande"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationStep2Member;
