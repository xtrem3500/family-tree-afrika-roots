-- Fonction pour supprimer toutes les données
CREATE OR REPLACE FUNCTION public.delete_all_data(auth_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier le code d'authentification
  IF auth_code != 'GOGO-DELETE-CODE-2024' THEN
    RAISE EXCEPTION 'Code d''authentification invalide';
  END IF;

  -- Supprimer les données dans l'ordre pour respecter les contraintes de clés étrangères
  DELETE FROM relationships WHERE TRUE;
  DELETE FROM join_requests WHERE TRUE;
  DELETE FROM family_members WHERE TRUE;
  DELETE FROM family_trees WHERE TRUE;
  DELETE FROM profiles WHERE TRUE;
END;
$$;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.delete_all_data(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_all_data(text) TO postgres;
GRANT EXECUTE ON FUNCTION public.delete_all_data(text) TO authenticated;

-- Commentaire sur la fonction
COMMENT ON FUNCTION public.delete_all_data(text) IS 'Supprime toutes les données des tables de l''application';
