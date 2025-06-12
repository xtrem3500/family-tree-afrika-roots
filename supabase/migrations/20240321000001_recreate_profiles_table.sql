-- Supprimer les types existants s'ils existent
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS relationship_type CASCADE;

-- Supprimer la table profiles si elle existe
DROP TABLE IF EXISTS profiles CASCADE;

-- Recréer la table profiles avec la structure originale
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  is_patriarch BOOLEAN DEFAULT false,
  birth_date DATE,
  birth_place TEXT,
  current_location TEXT,
  title TEXT,
  father_id UUID REFERENCES profiles(id),
  mother_id UUID REFERENCES profiles(id),
  spouse_id UUID REFERENCES profiles(id),
  children_ids UUID[] DEFAULT '{}',
  relationship_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Créer des index pour améliorer les performances
CREATE INDEX idx_profiles_is_patriarch ON profiles(is_patriarch);
CREATE INDEX idx_profiles_father_id ON profiles(father_id);
CREATE INDEX idx_profiles_mother_id ON profiles(mother_id);
CREATE INDEX idx_profiles_spouse_id ON profiles(spouse_id);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Créer le trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ajouter des commentaires pour la documentation
COMMENT ON TABLE profiles IS 'Table des profils utilisateurs avec relations familiales';
COMMENT ON COLUMN profiles.is_patriarch IS 'Indique si l''utilisateur est le patriarche de la famille';
COMMENT ON COLUMN profiles.father_id IS 'ID du père de l''utilisateur';
COMMENT ON COLUMN profiles.mother_id IS 'ID de la mère de l''utilisateur';
COMMENT ON COLUMN profiles.spouse_id IS 'ID du conjoint de l''utilisateur';
COMMENT ON COLUMN profiles.children_ids IS 'Liste des IDs des enfants de l''utilisateur';
COMMENT ON COLUMN profiles.relationship_type IS 'Type de relation familiale';
