# SayCal

Application de calendrier moderne avec authentification et gestion d'événements.

## Stack technique

- **Framework** : [Next.js 16](https://nextjs.org/) (App Router)
- **Auth** : [Neon Auth](https://neon.tech/docs/guides/neon-authorize) (BetterAuth)
- **Base de données** : [Neon PostgreSQL](https://neon.tech/) (Serverless)
- **ORM** : [Drizzle ORM](https://orm.drizzle.team/)
- **Data Fetching** : [TanStack Query](https://tanstack.com/query)
- **UI** : [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Animations** : [Framer Motion](https://www.framer.com/motion/)
- **i18n** : [next-intl](https://next-intl-docs.vercel.app/) (FR/EN)
- **Validation** : [Zod](https://zod.dev/)
- **Package Manager** : [Bun](https://bun.sh/)

## Prérequis

- [Bun](https://bun.sh/) >= 1.0
- Compte [Neon](https://neon.tech/) pour la base de données

## Installation

```bash
# Cloner le repo
git clone https://github.com/paul-bouzian/saycal.git
cd saycal

# Installer les dépendances
bun install
```

## Configuration

Créer un fichier `.env.local` à la racine :

```env
# Database (Neon)
DATABASE_URL=postgresql://...

# Auth (Neon Auth)
# URL de votre instance Neon Auth (depuis le dashboard Neon)
NEXT_PUBLIC_NEON_AUTH_URL=https://your-project.auth.neon.tech
NEON_AUTH_BASE_URL=https://your-project.auth.neon.tech
```

## Base de données

```bash
# Générer les migrations
bun run db:generate

# Appliquer les migrations
bun run db:migrate

# Ouvrir Drizzle Studio
bun run db:studio
```

## Développement

```bash
# Lancer le serveur de développement
bun run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Build

```bash
# Build de production
bun run build

# Lancer en production
bun run start
```

## Structure du projet

```
src/
├── app/                    # App Router (pages)
│   └── [locale]/          # Routes internationalisées
├── components/
│   ├── calendar/          # Composants calendrier
│   └── ui/                # Composants shadcn/ui
├── db/                    # Schema Drizzle & connexion
├── features/              # Features (landing, dashboard)
├── i18n/                  # Configuration next-intl
├── lib/                   # Utilitaires & actions serveur
└── messages/              # Traductions (fr.json, en.json)
```

## Déploiement

Le projet est optimisé pour [Vercel](https://vercel.com/).

```bash
# Déployer via Vercel CLI
vercel
```

## Licence

MIT
