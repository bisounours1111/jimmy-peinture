# Jimmy Peinture - Drive & Click-and-Collect

Application web de vente de peintures avec système de retrait en magasin (Drive).

## 🛠 Pré-requis

- Node.js (v16+)
- Compte Supabase (Gratuit)
- Compte Stripe (Optionnel pour le paiement en ligne)

## 🚀 Installation

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configuration Supabase**
   - Créez un nouveau projet sur [Supabase](https://supabase.com).
   - Allez dans l'éditeur SQL de Supabase.
   - Copiez-collez le contenu du fichier `db_schema.sql` (à la racine du projet) et exécutez-le.
   - Cela créera toutes les tables, la sécurité (RLS) et le compte admin initial (via la table auth).

3. **Variables d'environnement**
   Créez un fichier `.env` à la racine basé sur `.env.example` :
   ```env
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anon
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Lancer le projet**
   ```bash
   npm run dev
   ```

## 🔐 Accès Admin

Pour devenir administrateur :
1. Inscrivez-vous via l'interface publique (ou créez un utilisateur dans Supabase Auth).
2. Dans la table `public.users` de votre base de données, passez le champ `is_admin` à `true` pour votre utilisateur.
3. Connectez-vous sur `/admin/login`.

## 📦 Fonctionnalités

### Client
- Catalogue produits avec stock en temps réel.
- Panier d'achat.
- Tunnel de commande en 3 étapes.
- **Gestion intelligente des créneaux** :
  - Vérification des disponibilités.
  - Blocage des créneaux < 24h.
  - 2 semaines de visibilité.

### Admin
- **Dashboard** : KPIs (Ventes, Commandes, Produits).
- **Produits** : Ajout, modification, suppression, gestion du stock.
- **Commandes** : 
  - Vue détaillée.
  - Validation (décrémente le stock automatiquement).
  - Annulation.

## 🏗 Architecture

- **Vue 3** (Composition API) + **Vite**
- **Pinia** pour le State Management (Cart, Auth, Products).
- **Tailwind CSS** pour le design.
- **Supabase** pour Auth, DB et Realtime.
