import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useStorage = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File, userId: string): Promise<string> => {
    try {
      setIsUploading(true);

      // Vérifier si le bucket existe
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();

      if (bucketsError) throw bucketsError;

      // Créer le bucket s'il n'existe pas
      if (!buckets.find(b => b.name === 'avatars')) {
        const { error: createError } = await supabase
          .storage
          .createBucket('avatars', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
          });

        if (createError) throw createError;
      }

      // Générer un nom de fichier unique
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${timestamp}.${fileExt}`;

      // Uploader le fichier
      const { data, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erreur d'upload",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (path: string, bucket: string = 'avatars') => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erreur de suppression",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    uploadImage,
    isUploading,
    deleteImage,
  };
};
