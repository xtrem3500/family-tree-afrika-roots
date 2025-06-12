
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUploaded: (url: string) => void;
  userInitials: string;
  size?: 'sm' | 'md' | 'lg';
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhotoUrl,
  onPhotoUploaded,
  userInitials,
  size = 'lg'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const uploadPhoto = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Veuillez sélectionner une image valide');
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('L\'image ne doit pas dépasser 5MB');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('Uploading file:', fileName);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Erreur d'upload: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      setPreviewUrl(publicUrl);
      onPhotoUploaded(publicUrl);

      toast({
        title: "Photo mise à jour",
        description: "Votre photo de profil a été mise à jour avec succès",
      });

    } catch (error: any) {
      console.error('Photo upload error:', error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible de télécharger la photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload file
      uploadPhoto(file);
    }
  };

  const removePhoto = () => {
    setPreviewUrl(null);
    onPhotoUploaded('');
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} cursor-pointer transition-all duration-300 hover:scale-105 ring-4 ring-whatsapp-200 hover:ring-whatsapp-400`}>
          <AvatarImage 
            src={previewUrl || ''} 
            alt="Photo de profil"
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-whatsapp-400 to-emerald-500 text-white text-lg font-semibold">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay avec icône camera */}
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Camera className="w-8 h-8 text-white" />
        </div>
        
        {/* Input file caché */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
          disabled={isUploading}
        />
        
        {/* Bouton supprimer */}
        {previewUrl && (
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
            onClick={removePhoto}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      {isUploading && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Upload className="w-4 h-4 animate-pulse" />
          <span>Upload en cours...</span>
        </div>
      )}
      
      <p className="text-xs text-center text-muted-foreground max-w-xs">
        Cliquez sur l'avatar pour changer votre photo de profil
        <br />
        <span className="text-xs">Formats acceptés : JPG, PNG (max 5MB)</span>
      </p>
    </div>
  );
};

export default ProfilePhotoUpload;
