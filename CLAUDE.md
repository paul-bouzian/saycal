# SayCal - Voice-Driven Calendar App

Minimalist calendar application with voice-driven event creation. Stack: TanStack Start + React 19 + Cloudflare Workers.

## Essential Commands

```bash
bun run dev          # Dev server (port 3000)
bun run build        # Production build
bun run check        # Lint + format (Biome)
bun run test         # Vitest tests
bun run db:push      # Push schema to Neon
bun run db:studio    # Drizzle Studio interface
```

## Architecture

```
src/
├── routes/          # File-based routing (TanStack Router)
├── features/        # Feature-based components (landing/, etc.)
├── components/ui/   # shadcn/ui components
├── db/              # Drizzle ORM schema
├── paraglide/       # Auto-generated i18n runtime
└── lib/utils.ts     # cn() helper for classes
messages/            # JSON translations (en, fr, de)
```

## Code Conventions

### Language
**All code must be in English:**
- Variable, function, and class names
- Code comments
- Git branch names (e.g., `feat/voice-assistant`)
- Commit messages
- PR titles and descriptions
- Technical documentation

### Imports
Use the `@/` alias for all internal imports:
```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

### Styling
Tailwind only. Merge classes with `cn()`:
```typescript
className={cn("px-4 py-2", isActive && "bg-primary")}
```

### i18n (Paraglide)
Import messages from the generated runtime:
```typescript
import { m } from "@/paraglide/messages"
<h1>{m.hero_title()}</h1>
```
The `messages/*.json` files are the source. The runtime regenerates on `bun run dev`.

### Components
- Functional components only
- shadcn/ui for UI primitives
- Feature-based organization in `src/features/`

## Database

Neon PostgreSQL + Drizzle ORM. Schema in `src/db/schema.ts`.

```typescript
import { db } from "@/db/index"

// Query with Drizzle ORM
const events = await db.query.events.findMany()

// Insert with Drizzle ORM
await db.insert(events).values({ ... })
```

Migration workflow:
1. Modify `src/db/schema.ts`
2. `bun run db:generate` (generate migration)
3. `bun run db:push` (apply)

## Auto-generated Files (do not edit)

- `src/routeTree.gen.ts` - Route tree
- `src/paraglide/*` - i18n runtime

## Design System

- **Primary:** #B552D9 (violet)
- **Secondary:** #FA8485 (peach)
- **Gradient:** violet → peach (135deg)

## Deployment

Cloudflare Workers. Build and deploy:
```bash
bun run deploy
```

## Environment Variables

Required in `.env.local`:
- `VITE_DATABASE_URL` - Direct Neon URL
- `VITE_DATABASE_URL_POOLER` - Neon pooler URL
