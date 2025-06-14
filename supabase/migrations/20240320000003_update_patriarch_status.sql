-- Mettre à jour le statut du premier utilisateur en patriarche
UPDATE profiles
SET is_patriarch = true
WHERE id = (
    SELECT id 
    FROM profiles 
    ORDER BY created_at ASC 
    LIMIT 1
); 