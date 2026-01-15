# SayCal - Voice-Driven Calendar App

Application calendrier minimaliste avec création d'événements par la voix. Stack: TanStack Start + React 19 + Cloudflare Workers.

## Commandes essentielles

```bash
bun run dev          # Serveur dev (port 3000)
bun run build        # Build production
bun run check        # Lint + format (Biome)
bun run test         # Tests Vitest
bun run db:push      # Push schema vers Neon
bun run db:studio    # Interface Drizzle Studio
```

## Architecture

```
src/
├── routes/          # Routing fichier-based (TanStack Router)
├── features/        # Composants par feature (landing/, etc.)
├── components/ui/   # Composants shadcn/ui
├── db/              # Schema Drizzle ORM
├── paraglide/       # Runtime i18n auto-généré
└── lib/utils.ts     # Helper cn() pour classes
messages/            # Traductions JSON (en, fr, de)
```

## Conventions de code

### Imports
Utiliser l'alias `@/` pour tous les imports internes:
```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

### Styling
Tailwind uniquement. Fusionner les classes avec `cn()`:
```typescript
className={cn("px-4 py-2", isActive && "bg-primary")}
```

### i18n (Paraglide)
Importer les messages depuis le runtime généré:
```typescript
import { m } from "@/paraglide/messages"
<h1>{m.hero_title()}</h1>
```
Les fichiers `messages/*.json` sont la source. Le runtime se régénère au `bun run dev`.

### Composants
- Functional components uniquement
- shadcn/ui pour les primitives UI
- Feature-based organization dans `src/features/`

## Base de données

Neon PostgreSQL + Drizzle ORM. Schema dans `src/db/schema.ts`.

```typescript
import { getClient } from "@/db"
const sql = await getClient()
```

Workflow migrations:
1. Modifier `src/db/schema.ts`
2. `bun run db:generate` (génère migration)
3. `bun run db:push` (applique)

## Fichiers auto-générés (ne pas éditer)

- `src/routeTree.gen.ts` - Arbre de routes
- `src/paraglide/*` - Runtime i18n

## Design System

- **Primaire:** #B552D9 (violet)
- **Secondaire:** #FA8485 (pêche)
- **Gradient:** violet → pêche (135deg)

## Déploiement

Cloudflare Workers. Build et deploy:
```bash
bun run deploy
```

## Variables d'environnement

Requises dans `.env.local`:
- `VITE_DATABASE_URL` - URL Neon directe
- `VITE_DATABASE_URL_POOLER` - URL Neon pooler
