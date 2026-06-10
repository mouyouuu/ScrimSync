# ScrimSync

Planifiez les scrims de votre équipe League of Legends sans friction.

Application web progressive (PWA) construite avec Next.js 15, TypeScript, Tailwind CSS et Supabase.

---

## Table des matières

1. [Prérequis](#1-prérequis)
2. [Structure du projet](#2-structure-du-projet)
3. [Configuration Supabase](#3-configuration-supabase)
4. [Variables d'environnement](#4-variables-denvironnement)
5. [Lancement local](#5-lancement-local)
6. [Publier sur GitHub](#6-publier-sur-github)
7. [Déploiement Vercel](#7-déploiement-vercel)
8. [Connexion d'un nom de domaine](#8-connexion-dun-nom-de-domaine)
9. [Icônes PWA — comment ajouter vos images](#9-icônes-pwa--comment-ajouter-vos-images)
10. [Installation PWA sur iPhone](#10-installation-pwa-sur-iphone)
11. [Installation PWA sur Android](#11-installation-pwa-sur-android)
12. [Liens joueurs — partage](#12-liens-joueurs--partage)
13. [Personnalisation](#13-personnalisation)

---

## 1. Prérequis

- Node.js 18+ installé
- Un compte [Supabase](https://supabase.com) (gratuit)
- Un compte [Vercel](https://vercel.com) (gratuit)
- Un compte [GitHub](https://github.com)

---

## 2. Structure du projet

```
scrimsync/
├── app/                    Pages et API routes Next.js
│   ├── admin/              Page administration
│   ├── player/[token]/     Page joueur (lien personnel)
│   ├── scrim/[id]/         Fiche détail d'un scrim
│   └── api/                Routes API (auth, availability, scrims)
├── components/             Composants React
│   ├── ui/                 Composants de base (Button, Card, Modal…)
│   ├── availability/       Grilles de disponibilités
│   ├── scrims/             Composants scrims
│   └── pwa/                Aide installation PWA
├── lib/                    Fonctions utilitaires
├── config/app.ts           Configuration centrale (heures, joueurs…)
├── types/index.ts          Types TypeScript
├── supabase/schema.sql     Schéma base de données
└── public/icons/           Icônes PWA
```

---

## 3. Configuration Supabase

### 3.1 Créer le projet

1. Connectez-vous sur [supabase.com](https://supabase.com)
2. Cliquez **New project**
3. Choisissez un nom (ex : `scrimsync`) et une région proche de vous (Europe West)
4. Choisissez un mot de passe de base de données fort → **notez-le**
5. Attendez 1-2 minutes que le projet soit prêt

### 3.2 Exécuter le schéma SQL

1. Dans votre projet Supabase, ouvrez **SQL Editor** (menu gauche)
2. Cliquez **New query**
3. Copiez-collez entièrement le contenu du fichier `supabase/schema.sql`
4. Cliquez **Run** (ou Ctrl+Enter)
5. Vérifiez que vous voyez "Success" en bas

Cela va créer :
- La table `players` avec 5 joueurs de test
- La table `availability`
- La table `availability_submissions`
- La table `scrims`
- La table `team_settings`
- Tous les index nécessaires

### 3.3 Récupérer les clés API

1. Allez dans **Settings → API** dans votre projet Supabase
2. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Ne jamais exposer publiquement

---

## 4. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet (copiez `.env.example`) :

```bash
cp .env.example .env.local
```

Remplissez les valeurs :

```env
# Supabase — récupérées dans Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Mot de passe admin — choisissez quelque chose de fort
ADMIN_PASSWORD=mon-mot-de-passe-secret
```

> **Important :** Ne commitez jamais `.env.local` sur GitHub. Il est déjà dans le `.gitignore`.

---

## 5. Lancement local

```bash
# Dans le dossier scrimsync/
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

**Liens de test joueurs :**
- [http://localhost:3000/player/shaark-test-token](http://localhost:3000/player/shaark-test-token)
- [http://localhost:3000/player/top-test-token](http://localhost:3000/player/top-test-token)
- [http://localhost:3000/player/jungle-test-token](http://localhost:3000/player/jungle-test-token)
- [http://localhost:3000/player/adc-test-token](http://localhost:3000/player/adc-test-token)
- [http://localhost:3000/player/support-test-token](http://localhost:3000/player/support-test-token)

**Page admin :** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 6. Publier sur GitHub

### 6.1 Créer un dépôt GitHub

1. Connectez-vous sur [github.com](https://github.com)
2. Cliquez **New repository** (bouton vert en haut à droite)
3. Nommez-le `scrimsync`
4. Laissez en **Private** (recommandé — l'app est pour votre équipe)
5. **Ne cochez pas** "Add README" (vous en avez déjà un)
6. Cliquez **Create repository**

### 6.2 Pousser le code

Dans votre terminal, dans le dossier `scrimsync/` :

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "feat: initial ScrimSync setup"

# Connecter au dépôt GitHub (remplacez VOTRE-USERNAME)
git remote add origin https://github.com/VOTRE-USERNAME/scrimsync.git

# Pousser
git branch -M main
git push -u origin main
```

> Si Git vous demande vos identifiants GitHub, utilisez votre email et un **Personal Access Token** (pas votre mot de passe). Créez-en un dans GitHub → Settings → Developer settings → Personal access tokens.

---

## 7. Déploiement Vercel

### 7.1 Importer le projet

1. Connectez-vous sur [vercel.com](https://vercel.com)
2. Cliquez **Add New → Project**
3. Cliquez **Import Git Repository**
4. Autorisez Vercel à accéder à votre GitHub si nécessaire
5. Sélectionnez le dépôt `scrimsync`
6. Vercel détecte automatiquement Next.js ✓

### 7.2 Configurer les variables d'environnement

**Avant de déployer**, cliquez sur **Environment Variables** et ajoutez :

| Nom | Valeur |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Votre URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Votre clé anon Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Votre clé service role |
| `ADMIN_PASSWORD` | Votre mot de passe admin |

### 7.3 Déployer

1. Cliquez **Deploy**
2. Attendez 1-3 minutes
3. Vercel vous donne une URL du type `scrimsync-xxx.vercel.app`

### 7.4 Re-déployer après une modification

À chaque `git push` sur la branche `main`, Vercel redéploie automatiquement.

```bash
git add .
git commit -m "fix: correction du bug XYZ"
git push
```

---

## 8. Connexion d'un nom de domaine

### Si vous avez un domaine (ex : scrimsync.monequipe.fr)

1. Dans Vercel, ouvrez votre projet
2. Allez dans **Settings → Domains**
3. Tapez votre domaine → **Add**
4. Vercel vous donne les DNS à configurer chez votre registrar :
   - Type **A** → `76.76.21.21`
   - Ou type **CNAME** → `cname.vercel-dns.com`
5. Configurez ces enregistrements chez votre hébergeur de domaine
6. Attendez 5-30 minutes que les DNS se propagent

### Si vous n'avez pas de domaine

L'URL Vercel `scrimsync-xxx.vercel.app` fonctionne parfaitement pour une équipe privée.

---

## 9. Icônes PWA — comment ajouter vos images

### Icônes à placer dans `public/icons/`

| Fichier | Taille | Usage |
|---------|--------|-------|
| `icon-192.png` | 192×192 px | Android Chrome |
| `icon-512.png` | 512×512 px | Android (haute résolution) |
| `apple-touch-icon.png` | 180×180 px | iPhone/iPad |
| `maskable-icon.png` | 512×512 px | Android (icône adaptative) |

### Étapes avec vos images ScrimSync

1. **Sauvegardez l'icône** (le carré avec le "S") comme `icon-512.png` dans `public/icons/`
2. **Redimensionnez** en 192×192 → sauvez comme `icon-192.png`
3. **Redimensionnez** en 180×180 → sauvez comme `apple-touch-icon.png`
4. Pour `maskable-icon.png` : ajoutez un fond de 10% de padding sur fond `#09090b` autour de l'icône

**Outils gratuits :**
- Redimensionner PNG : [squoosh.app](https://squoosh.app)
- Créer une maskable icon : [maskable.app](https://maskable.app)

---

## 10. Installation PWA sur iPhone

1. Ouvrez Safari (obligatoire, pas Chrome)
2. Allez sur votre URL ScrimSync
3. Appuyez sur l'icône **Partager** (carré avec flèche vers le haut)
4. Faites défiler et appuyez sur **Sur l'écran d'accueil**
5. Appuyez sur **Ajouter**

L'app apparaît sur votre écran d'accueil comme une vraie application.

---

## 11. Installation PWA sur Android

1. Ouvrez Chrome
2. Allez sur votre URL ScrimSync
3. Appuyez sur le menu **⋮** (3 points en haut à droite)
4. Appuyez sur **Ajouter à l'écran d'accueil**
5. Appuyez sur **Ajouter**

Ou Chrome peut afficher automatiquement une bannière d'installation en bas de l'écran.

---

## 12. Liens joueurs — partage

Chaque joueur a un lien personnel unique. Envoyez ces liens (Discord, WhatsApp…) :

**Format :** `https://votre-domaine.com/player/TOKEN`

**Tokens par défaut (à changer en production) :**

| Joueur | Lien |
|--------|------|
| Shaark | `/player/shaark-test-token` |
| Top | `/player/top-test-token` |
| Jungle | `/player/jungle-test-token` |
| ADC | `/player/adc-test-token` |
| Support | `/player/support-test-token` |

### Changer les tokens en production

Pour des tokens plus sécurisés, exécutez dans Supabase SQL Editor :

```sql
-- Générer des tokens aléatoires
update players set token = encode(gen_random_bytes(16), 'hex') where name = 'Shaark';
update players set token = encode(gen_random_bytes(16), 'hex') where name = 'Top';
-- etc.

-- Récupérer les nouveaux tokens
select name, token from players;
```

---

## 13. Personnalisation

### Changer les heures disponibles

Dans `config/app.ts` :

```typescript
availableHours: [18, 19, 20, 21, 22, 23] as const,
```

### Changer le nombre de joueurs attendus

```typescript
expectedPlayers: 5,
```

### Changer les noms des joueurs

Dans Supabase SQL Editor :

```sql
update players set name = 'NouveauPseudo' where name = 'AncienPseudo';
```

### Changer les tokens

```sql
update players set token = 'mon-nouveau-token' where name = 'Shaark';
```

---

## Support

En cas de problème, vérifiez :
1. Les variables d'environnement dans Vercel (Settings → Environment Variables)
2. Que le SQL a bien été exécuté dans Supabase
3. Les logs dans Vercel (onglet Deployments → cliquez sur un déploiement → Logs)

---

*ScrimSync — Fait pour les équipes esport semi-sérieuses.*
