import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import ProfilePhotoUpload from '@/components/shared/ProfilePhotoUpload';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, UserPlus, Shield, Lock, Unlock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RegistrationStep1 from '@/components/RegistrationStep1';

// Fonction pour uploader une image
const uploadImage = async (file: File, userId: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Erreur lors du téléchargement de l\'image');
  }
};

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNext = (data: any) => {
    setRegistrationData(data);
    setStep(step + 1);
  };

  const handleShowLogin = () => {
    navigate('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // La logique d'inscription est maintenant dans RegistrationStep1
      navigate('/dashboard');
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-whatsapp-50 via-emerald-50 to-teal-50">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 pt-24 pb-32">
        {step === 1 && (
          <RegistrationStep1
            onNext={handleNext}
            onShowLogin={handleShowLogin}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Register;
