-- Politique pour empêcher la modification manuelle du statut de patriarche
CREATE POLICY "Lock patriarch status"
ON profiles
FOR UPDATE
USING (
  auth.uid() = id
  AND (
    -- Permettre la mise à jour si l'utilisateur n'est pas patriarche
    is_patriarch = FALSE
    OR
    -- Ou si c'est la première insertion (count = 0)
    (SELECT COUNT(*) FROM profiles) = 0
  )
);

-- Politique pour empêcher la suppression d'un patriarche
CREATE POLICY "Prevent patriarch deletion"
ON profiles
FOR DELETE
USING (
  is_patriarch = FALSE
  OR
  auth.uid() = id
);

-- Politique pour la lecture des profils
CREATE POLICY "Allow profile reading"
ON profiles
FOR SELECT
USING (
  -- Tout le monde peut voir les profils
  true
);

-- Politique pour l'insertion de profils
CREATE POLICY "Allow profile insertion"
ON profiles
FOR INSERT
WITH CHECK (
  -- Vérifier si c'est le premier utilisateur
  (SELECT COUNT(*) FROM profiles) = 0
  OR
  -- Ou si l'utilisateur n'est pas patriarche
  is_patriarch = FALSE
);
