-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Lock patriarch status" ON profiles;
DROP POLICY IF EXISTS "Prevent patriarch deletion" ON profiles;
DROP POLICY IF EXISTS "Allow profile reading" ON profiles;
DROP POLICY IF EXISTS "Allow profile insertion" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Protect patriarch status and role" ON profiles;

-- Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Créer les nouvelles politiques
-- 1. Lecture : tout le monde peut voir les profils
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- 2. Insertion : les utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 3. Mise à jour : les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 4. Suppression : les utilisateurs peuvent supprimer leur propre profil
CREATE POLICY "Users can delete their own profile"
ON profiles FOR DELETE
USING (auth.uid() = id);

-- Accorder les permissions nécessaires
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
