-- Ajout des colonnes manquantes à la table profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member',
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS birth_place TEXT,
ADD COLUMN IF NOT EXISTS current_location TEXT,
ADD COLUMN IF NOT EXISTS title TEXT;

-- Mise à jour des contraintes
ALTER TABLE profiles
ADD CONSTRAINT valid_role CHECK (role IN ('patriarch', 'member'));

-- Suppression des anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Création des nouvelles politiques RLS
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Création d'un index sur la colonne role pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
