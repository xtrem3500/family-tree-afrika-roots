-- D'abord, réinitialiser tous les statuts patriarche à false
UPDATE profiles
SET is_patriarch = false;

-- Ensuite, définir le premier utilisateur comme patriarche
UPDATE profiles
SET is_patriarch = true
WHERE id = (
    SELECT id 
    FROM profiles 
    ORDER BY created_at ASC 
    LIMIT 1
);

-- Vérification (pour le débogage)
SELECT id, first_name, last_name, is_patriarch, created_at
FROM profiles
ORDER BY created_at ASC; 