import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, X } from 'lucide-react';
import { ImagePreviewDialog } from './ImagePreviewDialog';

interface ProfilePhotoUploadProps {
  currentPhotoUrl: string;
  onPhotoUploaded: (url: string) => void;
  userInitials: string;
  size?: 'sm' | 'md' | 'lg';
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhotoUrl,
  onPhotoUploaded,
  userInitials,
  size = 'md'
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentPhotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Vérifier la taille du fichier (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Le fichier est trop volumineux. Taille maximum : 5MB');
        }

        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          throw new Error('Le fichier doit être une image');
        }

        // Créer une URL pour la prévisualisation
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setPreviewUrl(base64String);
          onPhotoUploaded(base64String);
        };
        reader.readAsDataURL(file);
      } catch (error: any) {
        console.error('Error selecting image:', error);
        alert(error.message || 'Une erreur est survenue lors de la sélection de l\'image');
      }
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl('');
    onPhotoUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        id="photo-upload"
      />
      <label htmlFor="photo-upload">
        <div className="relative cursor-pointer group">
          <Avatar className={`${sizeClasses[size]} border-2 border-gray-200`}>
            <AvatarImage src={previewUrl} alt="Photo de profil" />
            <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>
      </label>

      {previewUrl && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-2 rounded-full bg-white shadow-md hover:bg-gray-100"
          onClick={handleRemovePhoto}
        >
          <X className="w-4 h-4" />
        </Button>
      )}

      <ImagePreviewDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        previewUrl={previewUrl}
        userInitials={userInitials}
        onChoosePhoto={() => fileInputRef.current?.click()}
        onRemovePhoto={handleRemovePhoto}
      />
    </div>
  );
};

export default ProfilePhotoUpload;
