# Workflow de l'Application Familiale Tree

## État Actuel (Version 1.0)

### 1. Authentification et Inscription
- **Fichiers impliqués**:
  - `src/components/RegistrationStep1.tsx`
  - `src/hooks/use-auth.ts`
  - `src/integrations/supabase/client.ts`

- **Fonctionnalités implémentées**:
  - Inscription avec validation des champs
  - Upload de photo de profil
  - Détection automatique du premier utilisateur comme patriarche
  - Gestion des rôles (patriarche/membre)
  - Connexion/Déconnexion
  - Redirection automatique

### 2. Dashboard Principal
- **Fichiers impliqués**:
  - `src/components/Dashboard.tsx`
  - `src/components/ProfilePhotoUpload.tsx`
  - `src/components/FamilyTree.tsx`

- **Fonctionnalités implémentées**:
  - Interface utilisateur avec onglets (Arbre, Membres, Profil)
  - Gestion du profil utilisateur (CRUD)
  - Upload et mise à jour de la photo de profil
  - Affichage des informations du patriarche
  - Système d'invitation (en développement)
  - Intégration des réseaux sociaux (UI seulement)

### 3. Base de Données (Supabase)
- **Tables implémentées**:
  - `profiles`: Informations des utilisateurs
  - `family_trees`: Arbres familiaux
  - `family_relationships`: Relations familiales (en développement)

- **Politiques de sécurité**:
  - RLS pour les profils
  - RLS pour le stockage des avatars
  - Gestion des rôles utilisateur

## Prochaines Étapes

### 1. Gestion des Relations Familiales
- [ ] Implémenter la table `family_relationships`
- [ ] Créer l'interface de gestion des relations
- [ ] Ajouter les types de relations (parent, enfant, conjoint, etc.)
- [ ] Implémenter la validation des relations

### 2. Arbre Généalogique
- [ ] Améliorer le composant `FamilyTree.tsx`
- [ ] Implémenter la visualisation interactive
- [ ] Ajouter la navigation dans l'arbre
- [ ] Gérer les différents niveaux de profondeur
- [ ] Ajouter les filtres de visualisation

### 3. Système d'Invitation
- [ ] Finaliser l'intégration WhatsApp
- [ ] Implémenter le système de validation des invitations
- [ ] Ajouter les notifications par email
- [ ] Gérer les invitations en attente

### 4. Fonctionnalités Sociales
- [ ] Implémenter le chat en direct
- [ ] Ajouter le système de notifications
- [ ] Intégrer le partage sur les réseaux sociaux
- [ ] Créer un système de publications familiales

### 5. Améliorations Techniques
- [ ] Optimiser les performances de l'arbre
- [ ] Améliorer la gestion du cache
- [ ] Ajouter des tests unitaires et d'intégration
- [ ] Implémenter le système de sauvegarde automatique

## Notes de Développement
- L'application utilise React avec TypeScript
- Supabase pour la base de données et l'authentification
- Tailwind CSS pour le style
- Composants UI personnalisés avec shadcn/ui

## Problèmes Connus
1. Gestion des photos de profil à améliorer
   - **Problème**: Erreur 400 (Bad Request) lors de l'upload vers Supabase Storage
   - **Cause**:
     - Chemin de bucket incorrect (`avatars/avatars/` au lieu de `avatars/`)
     - Politiques RLS potentiellement mal configurées
     - Format de réponse incorrect (HTML au lieu de JSON)
   - **Solution proposée**:
     ```sql
     -- 1. Vérifier et corriger les politiques RLS pour le bucket 'avatars'
     CREATE POLICY "Avatar images are publicly accessible"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'avatars');

     CREATE POLICY "Users can upload avatar images"
     ON storage.objects FOR INSERT
     WITH CHECK (
       bucket_id = 'avatars'
       AND auth.role() = 'authenticated'
     );

     -- 2. Modifier le code d'upload pour utiliser le bon chemin
     const filePath = `${user.id}/${fileName}`; // Au lieu de 'avatars/avatars/...'
     ```

2. Système d'invitation en cours de développement
3. Visualisation de l'arbre à optimiser
4. Gestion des relations familiales à implémenter

## Dernière Mise à Jour
- Date: 2024-03-19
- Version: 1.0.1
- Dernières modifications:
  - Implémentation du système de patriarche
  - Ajout de l'interface de profil
  - Mise en place du système d'invitation (UI)
  - Intégration des icônes sociales
  - Correction du problème d'upload des photos de profil (en cours)

## Notes Techniques
### Configuration Supabase Storage
1. **Structure des buckets**:
   - Bucket principal: `avatars`
   - Structure des fichiers: `{user_id}/{timestamp}.{extension}`
   - Taille maximale: 5MB
   - Types acceptés: image/jpeg, image/png, image/gif

2. **Politiques de sécurité**:
   ```sql
   -- Politiques RLS pour le bucket 'avatars'
   -- Lecture publique
   CREATE POLICY "Avatar images are publicly accessible"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'avatars');

   -- Upload authentifié
   CREATE POLICY "Users can upload avatar images"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'avatars'
     AND auth.role() = 'authenticated'
   );

   -- Suppression par propriétaire
   CREATE POLICY "Users can delete their own avatar images"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'avatars'
     AND auth.role() = 'authenticated'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

3. **Gestion des erreurs**:
   - Validation des types de fichiers
   - Vérification de la taille
   - Gestion des erreurs d'upload
   - Nettoyage des anciennes photos
# Workflow de l'Application Familiale Tree

// ... existing code ...

## Problèmes Connus
1. Gestion des photos de profil à améliorer
   - **Problème**: Erreur 400 (Bad Request) lors de l'upload vers Supabase Storage
   - **Cause**:
     - Chemin de bucket incorrect (`avatars/avatars/` au lieu de `avatars/`)
     - Politiques RLS potentiellement mal configurées
     - Format de réponse incorrect (HTML au lieu de JSON)
   - **Solution proposée**:
     ```sql
     -- 1. Vérifier et corriger les politiques RLS pour le bucket 'avatars'
     CREATE POLICY "Avatar images are publicly accessible"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'avatars');

     CREATE POLICY "Users can upload avatar images"
     ON storage.objects FOR INSERT
     WITH CHECK (
       bucket_id = 'avatars'
       AND auth.role() = 'authenticated'
     );

     -- 2. Modifier le code d'upload pour utiliser le bon chemin
     const filePath = `${user.id}/${fileName}`; // Au lieu de 'avatars/avatars/...'
     ```

2. Système d'invitation en cours de développement
3. Visualisation de l'arbre à optimiser
4. Gestion des relations familiales à implémenter

## Dernière Mise à Jour
- Date: 2024-03-19
- Version: 1.0.1
- Dernières modifications:
  - Implémentation du système de patriarche
  - Ajout de l'interface de profil
  - Mise en place du système d'invitation (UI)
  - Intégration des icônes sociales
  - Correction du problème d'upload des photos de profil (en cours)

## Notes Techniques
### Configuration Supabase Storage
1. **Structure des buckets**:
   - Bucket principal: `avatars`
   - Structure des fichiers: `{user_id}/{timestamp}.{extension}`
   - Taille maximale: 5MB
   - Types acceptés: image/jpeg, image/png, image/gif

2. **Politiques de sécurité**:
   ```sql
   -- Politiques RLS pour le bucket 'avatars'
   -- Lecture publique
   CREATE POLICY "Avatar images are publicly accessible"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'avatars');

   -- Upload authentifié
   CREATE POLICY "Users can upload avatar images"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'avatars'
     AND auth.role() = 'authenticated'
   );

   -- Suppression par propriétaire
   CREATE POLICY "Users can delete their own avatar images"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'avatars'
     AND auth.role() = 'authenticated'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

3. **Gestion des erreurs**:
   - Validation des types de fichiers
   - Vérification de la taille
   - Gestion des erreurs d'upload
   - Nettoyage des anciennes photos

// ... rest of existing code ...
