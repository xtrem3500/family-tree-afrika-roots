
# Documentation Charte Graphique - Familiale Tree

## Fichiers de Style et Charte Graphique

### 1. Configuration principale des couleurs et design system
- `src/index.css` - Définition complète du design system, couleurs, animations
- `tailwind.config.ts` - Configuration Tailwind avec couleurs personnalisées

### 2. Composants UI de base
- `src/components/ui/` - Tous les composants shadcn/ui personnalisés
- `src/components/ui/card.tsx` - Cartes avec styles personnalisés
- `src/components/ui/button.tsx` - Boutons avec variants personnalisés
- `src/components/ui/avatar.tsx` - Composant avatar pour photos de profil

### 3. Composants spécifiques à l'application
- `src/components/Header.tsx` - En-tête avec navigation
- `src/components/Footer.tsx` - Pied de page avec informations développeur
- `src/components/FamilyTree.tsx` - Arbre généalogique avec style moderne
- `src/components/Login.tsx` - Page de connexion avec design glassmorphisme
- `src/components/RegistrationStep1.tsx` - Première étape inscription
- `src/components/RegistrationStep2Creator.tsx` - Inscription patriarche
- `src/components/RegistrationStep2Member.tsx` - Inscription membre

### 4. Pages principales
- `src/pages/Index.tsx` - Page d'accueil avec gestion des états

## Palette de Couleurs Utilisée

### Couleurs Principales
- **WhatsApp Green** : `#25D366` (primary)
- **Emerald** : Variantes d'émeraude pour les dégradés
- **Teal** : Couleurs complémentaires
- **Earth tones** : Tons terreux pour l'aspect africain
- **Baobab** : Couleurs inspirées du baobab (arbre emblématique)

### Dégradés
- Dégradés principaux : WhatsApp -> Emerald -> Teal
- Arrière-plans : Earth tones avec transparence
- Effets glassmorphisme avec backdrop-blur

### Typographie
- Font principale : System fonts avec fallbacks
- Tailles responsives avec classes Tailwind
- Font weights : 400, 500, 600, 700

## Comment Utiliser l'Application

### 1. Première Connexion
1. **Page de connexion** : Accueil avec options Facebook ou email/mot de passe
2. **Inscription nouvelle** : 
   - Remplir informations personnelles (étape 1)
   - Si premier utilisateur → devient patriarche (étape 2A)
   - Si utilisateur suivant → validation familiale (étape 2B)

### 2. Navigation Principale
- **En-tête** : Logo, titre, navigation principale
- **Contenu principal** : Arbre généalogique interactif
- **Pied de page** : Informations développeur et liens

### 3. Gestion de l'Arbre Familial
- **Visualisation** : Arbre en format moderne avec cartes interactives
- **Navigation** : Clic sur membres pour voir descendants
- **Ajout de membres** : Via formulaires de demande de connexion
- **Validation** : Système d'approbation par le patriarche

### 4. Profils Utilisateurs
- **Photo de profil** : Upload et affichage circulaire
- **Informations** : Nom, lieu de naissance, localisation actuelle
- **Relations** : Liens familiaux validés et affichés

### 5. Fonctionnalités Avancées
- **Recherche familiale** : Trouver des membres existants
- **Demandes de connexion** : Système de validation
- **Gestion des rôles** : Patriarche, membres, etc.
- **Authentification** : Sécurisé via Supabase

## Architecture Technique

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le styling
- **Shadcn/UI** pour les composants
- **Lucide React** pour les icônes

### Backend
- **Supabase** pour base de données
- **Authentication** Supabase Auth
- **Storage** pour les photos de profil
- **RLS** (Row Level Security) pour la sécurité

### Base de Données
- **profiles** : Informations utilisateurs
- **family_trees** : Arbres familiaux
- **relationships** : Relations entre membres
- **join_requests** : Demandes d'adhésion
- **family_members** : Membership aux arbres

