-- Supprimer le bucket existant s'il existe
DELETE FROM storage.buckets WHERE id = 'avatars';

-- Créer le bucket avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar uploads are allowed for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- Créer les nouvelles politiques
-- 1. Lecture publique des avatars
CREATE POLICY "Avatar access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 2. Upload pour les utilisateurs authentifiés
CREATE POLICY "Avatar uploads are allowed for authenticated users"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Mise à jour pour les propriétaires
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Suppression pour les propriétaires
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
