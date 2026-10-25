# Fogoinfo

Reconstruction indépendante de [fogoinfos.com](https://fogoinfos.com) (anciennement sur Base44).

- **Next.js 16** (App Router) + **Tailwind CSS 4**
- **Supabase** : base de données (articles, vidéos, administrateurs), connexion par lien e-mail, stockage des images
- Sans Supabase configuré, le site tourne en **mode démo** sur `src/data/seed.json`.

## Pages

| URL | Contenu |
| --- | --- |
| `/` | Accueil : à la une, dernières actualités, les plus lus, tribunes, vidéos, rubriques |
| `/actualites`, `/politique`, `/economie`, `/societe`, `/culture`, `/international`, `/tribunes` | Rubriques |
| `/article/[id]` | Article (compteur de vues, partage, articles liés) |
| `/videos`, `/videos/[id]` | Vidéos (YouTube ou fichier) |
| `/recherche?q=` | Recherche |
| `/admin` | Espace rédaction : articles, vidéos, administrateurs |

Les anciennes adresses Base44 (`/Politique`, `/Article?id=…`, `/InviterAdmin`…) redirigent vers les nouvelles (`src/proxy.ts`).

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:3000 (mode démo)
```

## Mise en production

1. **Supabase** : créez un projet sur [supabase.com](https://supabase.com), puis exécutez `supabase/schema.sql` dans *SQL Editor*.
   Le script crée les tables, la sécurité (lecture publique, écriture réservée aux admins), le bucket d'images `media`,
   et ajoute les premiers administrateurs (modifiez la liste en bas du fichier si besoin).
2. **Authentification** : dans *Authentication > URL Configuration*, mettez l'adresse du site dans *Site URL*
   et ajoutez `https://votre-domaine/admin` dans *Redirect URLs*.
3. **Variables** : copiez `.env.example` en `.env.local` et remplissez les clés (*Project Settings > API*).
4. **Import des données Base44** (articles, vidéos et copie des images dans Supabase) :
   ```bash
   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/import-base44.mjs
   ```
   `node scripts/import-base44.mjs --export` fait seulement une sauvegarde JSON.
   À faire **avant** de fermer l'application Base44, sinon les images hébergées chez Base44 seront perdues.
5. **Hébergement** : importez le dépôt sur [Vercel](https://vercel.com) (ou tout hébergeur Node), renseignez les mêmes
   variables d'environnement, puis pointez le domaine `fogoinfos.com` vers le nouvel hébergement.

## Administration

Exécutez aussi `supabase/002_roles_pays.sql` puis `supabase/003_role_admin.sql` (rôles et pays) après `schema.sql`.

- **Super admin** (un seul, beecleverch@gmail.com) : gère tout (articles, « à la une », vidéos, administrateurs, import).
- **Admin** : articles de tous les pays, « à la une », vidéos ; ajoute ou retire des rédacteurs, mais pas d'admins.
- **Rédacteur** : rattaché à un pays, il ajoute, modifie et supprime uniquement les articles de ce pays.
  Ces règles sont appliquées par la base de données elle-même.

Connexion sur `/admin` avec un lien envoyé par e-mail. Seules les adresses présentes dans la table `admins` ont accès.
Un administrateur peut en ajouter d'autres depuis l'onglet *Administrateurs* : la personne invitée se connecte
ensuite simplement sur `/admin` avec son adresse.

Les pages publiques sont mises en cache 60 secondes : une modification apparaît sur le site en moins d'une minute.
