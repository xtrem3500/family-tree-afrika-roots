-- Ajouter la colonne situation à la table profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS situation TEXT;

-- Mettre à jour les politiques RLS pour inclure la nouvelle colonne
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Accorder les permissions nécessaires
GRANT SELECT, UPDATE ON profiles TO authenticated;
