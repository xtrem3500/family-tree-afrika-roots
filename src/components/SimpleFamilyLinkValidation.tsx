import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleFamilyLinkValidationProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

export const SimpleFamilyLinkValidation: React.FC<SimpleFamilyLinkValidationProps> = ({ onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    birthDate: null as Date | null,
    birthPlace: '',
    currentLocation: '',
    occupation: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
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
              <Label>Date de naissance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.birthDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.birthDate ? (
                      format(formData.birthDate, "dd/MM/yyyy", { locale: fr })
                    ) : (
                      <span>jj/mm/aaaa</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.birthDate || undefined}
                    onSelect={(date) => setFormData({ ...formData, birthDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
              <Label htmlFor="occupation">Titre/Fonction</Label>
              <Input
                id="occupation"
                placeholder="ex: Étudiant, Ingénieur..."
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
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
              >
                Soumettre la demande
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
