-- Ajouter les colonnes de relations familiales à la table profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS father_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS mother_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS spouse_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS children_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS relationship_type TEXT;

-- Mettre à jour les types TypeScript
COMMENT ON TABLE profiles IS 'Table des profils utilisateurs avec relations familiales';
COMMENT ON COLUMN profiles.father_id IS 'ID du père de l''utilisateur';
COMMENT ON COLUMN profiles.mother_id IS 'ID de la mère de l''utilisateur';
COMMENT ON COLUMN profiles.spouse_id IS 'ID du conjoint de l''utilisateur';
COMMENT ON COLUMN profiles.children_ids IS 'Liste des IDs des enfants de l''utilisateur';
COMMENT ON COLUMN profiles.relationship_type IS 'Type de relation familiale';
