import React, { useState, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useStorage } from '@/hooks/use-storage';
import { ImagePreviewDialog } from './ImagePreviewDialog';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUploaded: (url: string) => void;
  userInitials: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhotoUrl,
  onPhotoUploaded,
  userInitials,
  size = 'lg'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const [tempPreviewUrl, setTempPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { uploadImage } = useStorage();

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "L'image ne doit pas dépasser 5MB",
        variant: "destructive",
      });
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format non supporté",
        description: "Veuillez sélectionner une image (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Créer un aperçu temporaire
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target?.result as string;
      setTempPreviewUrl(base64Image);
      setIsPreviewOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmUpload = async () => {
    if (!tempPreviewUrl) return;

    try {
      setIsUploading(true);
      setPreviewUrl(tempPreviewUrl);

      // Si l'utilisateur est authentifié, uploader vers Supabase
      if (user) {
        const response = await fetch(tempPreviewUrl);
        const blob = await response.blob();
        const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
        const publicUrl = await uploadImage(file, user.id);
        setPreviewUrl(publicUrl);
        onPhotoUploaded(publicUrl);
      } else {
        // Sinon, utiliser l'aperçu temporaire
        onPhotoUploaded(tempPreviewUrl);
      }

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
      // Réinitialiser l'aperçu en cas d'erreur
      setPreviewUrl(currentPhotoUrl || null);
    } finally {
      setIsUploading(false);
      setIsPreviewOpen(false);
      setTempPreviewUrl(null);
    }
  };

  const handleCancelUpload = () => {
    setTempPreviewUrl(null);
    setIsPreviewOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = () => {
    setPreviewUrl(null);
    onPhotoUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="relative group">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />

        <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-blue-500 transition-all duration-300`}>
          <Avatar className={`${sizeClasses[size]} cursor-pointer`}>
            {previewUrl ? (
              <AvatarImage
                src={previewUrl}
                alt="Photo de profil"
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-2xl">
                {userInitials.toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-white hover:text-white hover:bg-white/20"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-5 h-5" />
            </Button>
            {previewUrl && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white hover:text-white hover:bg-white/20"
                onClick={removePhoto}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <ImagePreviewDialog
        isOpen={isPreviewOpen}
        onClose={handleCancelUpload}
        onConfirm={handleConfirmUpload}
        imageUrl={tempPreviewUrl}
        isLoading={isUploading}
      />
    </>
  );
};
