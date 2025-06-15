import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface ImagePreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  previewUrl: string;
  userInitials: string;
  onChoosePhoto: () => void;
  onRemovePhoto: () => void;
}

export const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  isOpen,
  onOpenChange,
  previewUrl,
  userInitials,
  onChoosePhoto,
  onRemovePhoto
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier la photo de profil</DialogTitle>
          <DialogDescription>
            Choisissez une nouvelle photo de profil. Les formats acceptés sont JPG, PNG et GIF.
            La taille maximale est de 5MB.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center">
            <Avatar className="w-32 h-32">
              <AvatarImage src={previewUrl} alt="Aperçu" />
              <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={onChoosePhoto}
            >
              Choisir une photo
            </Button>
            {previewUrl && (
              <Button
                variant="destructive"
                onClick={onRemovePhoto}
              >
                Supprimer
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
