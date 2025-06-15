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

## Inscription et Rôles

### Premier Utilisateur (Patriarche)
- Le premier utilisateur qui s'inscrit dans l'application devient automatiquement le patriarche
- Le patriarche est identifié par le champ `is_patriarch = true` dans la table `profiles`
- Le patriarche a un rôle spécial `role = 'patriarch'`
- Le patriarche est affiché au centre de l'arbre familial dans le Dashboard
- Seul le patriarche peut voir la carte complète de l'arbre familial

### Membres Suivants
- Tous les utilisateurs qui s'inscrivent après le patriarche sont des membres normaux
- Les membres ont `is_patriarch = false` et `role = 'member'`
- Les membres peuvent voir leur position dans l'arbre familial par rapport au patriarche

## Arbre Familial

### Affichage
- L'arbre familial est centré sur le patriarche
- Le patriarche est toujours affiché en haut au centre de l'arbre
- Les autres membres sont positionnés en fonction de leur relation avec le patriarche
- La carte de l'arbre familial n'est visible que pour le patriarche

### Relations
- Les relations familiales sont définies par les champs :
  - `father_id`
  - `mother_id`
  - `spouse_id`
  - `children_ids`
- Ces relations déterminent la position des membres dans l'arbre

## Sécurité
- Seul le patriarche peut voir la carte complète de l'arbre
- Les autres membres ne peuvent voir que leur position relative
- Les informations sensibles sont protégées par des règles d'accès appropriées

## Maintenance
- Le statut de patriarche est permanent et ne peut pas être transféré
- En cas de besoin, un administrateur peut modifier manuellement le statut dans la base de données
- Les modifications du statut patriarche doivent être effectuées avec précaution pour maintenir l'intégrité de l'arbre

## Résolution des problèmes CORS avec Supabase

### Problème rencontré
- Erreur CORS lors des requêtes vers l'API Supabase depuis l'application React
- Erreur "No 'Access-Control-Allow-Origin' header is present on the requested resource"
- Conflit entre la configuration CORS de Supabase et les requêtes du client

### Solution mise en place
1. **Middleware Supabase**
   - Création d'un middleware pour intercepter et modifier les requêtes
   - Ajout automatique des headers nécessaires :
     - `apikey`
     - `Authorization`
     - `Content-Type`
     - `Prefer`

2. **Client Supabase**
   - Intégration du middleware dans la configuration du client
   - Amélioration de la gestion du stockage local
   - Ajout des headers d'autorisation globaux

3. **Configuration Vite**
   - Configuration CORS explicite pour le serveur de développement
   - Autorisation des headers nécessaires
   - Support des credentials pour les requêtes cross-origin

### Configuration finale
```typescript
// middleware.ts
export const supabaseMiddleware = {
  async beforeRequest({ request }: { request: Request }) {
    const headers = new Headers(request.headers);
    headers.set('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY);
    headers.set('Authorization', `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`);
    headers.set('Content-Type', 'application/json');
    headers.set('Prefer', 'return=minimal');
    return new Request(request.url, {
      method: request.method,
      headers,
      body: request.body,
      credentials: 'include',
    });
  },
};

// vite.config.ts
export default defineConfig({
  server: {
    cors: {
      origin: ['http://localhost:8080'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'apikey', 'Prefer'],
      credentials: true
    }
  }
});
```

### Points importants à retenir
1. Toujours inclure les headers d'autorisation nécessaires
2. Configurer correctement CORS côté serveur de développement
3. Utiliser un middleware pour gérer les requêtes de manière centralisée
4. S'assurer que les variables d'environnement sont correctement chargées

## Gestion de la déconnexion et nettoyage des données

### Problème rencontré
- Erreurs CORS lors de la déconnexion
- Données persistantes non nettoyées correctement
- Cookies et tokens restant après la déconnexion

### Solution mise en place
1. **Gestion robuste de la déconnexion**
   - Fonction `handleLogout` pour une déconnexion normale
   - Fonction `forceLogout` pour un nettoyage forcé en cas d'erreur
   - Fonction `clearLocalData` pour le nettoyage des données locales

2. **Nettoyage complet**
   - Suppression des cookies Supabase
   - Nettoyage du localStorage et sessionStorage
   - Suppression des données de cache
   - Réinitialisation des états de l'application

3. **Gestion des erreurs**
   - Détection des tokens expirés
   - Gestion des erreurs d'authentification
   - Nettoyage forcé en cas d'erreur

### Points importants à retenir
1. Toujours nettoyer les données locales avant la déconnexion
2. Gérer les cas d'erreur avec un nettoyage forcé
3. S'assurer que tous les types de stockage sont nettoyés
4. Maintenir la cohérence des états de l'application
