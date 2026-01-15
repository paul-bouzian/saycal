# SayCal - Voice-Driven Calendar App

Minimalist calendar application with voice-driven event creation. Stack: Next.js 16 + React 19 + Neon PostgreSQL.

## Essential Commands

**IMPORTANT: Always use Bun, never NPM.**

```bash
bun run dev          # Dev server (port 3000)
bun run build        # Production build
bun run start        # Run production build
bun run lint         # ESLint
bunx drizzle-kit generate   # Generate Drizzle migration
bunx drizzle-kit migrate    # Apply migrations
bunx drizzle-kit studio     # Drizzle Studio interface
```

## Architecture

```
src/
├── app/                    # Next.js App Router
│   └── [locale]/           # Internationalized routes (fr, en)
├── components/
│   ├── calendar/           # Calendar components
│   └── ui/                 # shadcn/ui components
├── db/                     # Drizzle ORM schema & connection
├── features/               # Feature modules (landing, dashboard, voice)
├── hooks/                  # Custom React hooks
├── i18n/                   # next-intl configuration
└── lib/                    # Utilities, actions & AI services
messages/                   # Translations (fr.json, en.json)
```

## Code Conventions

### Language
**All code and documentation must be in English:**
- Variable, function, and class names
- Code comments (always in English, even though the UI is translated)
- Git branch names (e.g., `feat/voice-assistant`)
- Commit messages
- PR titles and descriptions
- Technical documentation

Note: The application's user interface is translated into French and English via i18n, but all code, comments, commits, and PRs must remain in English.

### Imports
Use the `@/` alias for all internal imports:
```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

### Styling
Tailwind CSS only. Merge classes with `cn()`:
```typescript
className={cn("px-4 py-2", isActive && "bg-primary")}
```

### i18n (next-intl)
Use the `useTranslations` hook or `getTranslations` for server components:
```typescript
import { useTranslations } from "next-intl"
const t = useTranslations("landing")
<h1>{t("hero.title")}</h1>
```
Translations are in `messages/fr.json` and `messages/en.json`.

### Components
- Functional components only
- shadcn/ui for UI primitives
- Feature-based organization in `src/features/`
- TanStack Query for data fetching

## Database

Neon PostgreSQL + Drizzle ORM. Schema in `src/db/schema.ts`.

Tables:
- `events` - Calendar events (title, startAt, endAt, color, createdVia)
- `user_subscriptions` - User plans and voice usage tracking
- `neon_auth.user` - Users (managed by Neon Auth)

Migration workflow:
1. Modify `src/db/schema.ts`
2. `bunx drizzle-kit generate` (generate migration)
3. `bunx drizzle-kit migrate` (apply)

## Authentication

Neon Auth (BetterAuth) with email OTP authentication.
- Client: `src/lib/auth.ts`
- Server: `src/lib/auth-server.ts`

## AI Services

Voice features powered by:
- **Deepgram** - Speech-to-text transcription
- **Google Gemini** - Natural language event parsing

Located in `src/lib/ai/`.

## Design System

- **Primary:** #B552D9 (violet)
- **Secondary:** #FA8485 (peach)
- **Gradient:** violet → peach (135deg)

## Environment Variables

Required in `.env.local`:
```env
# Database
DATABASE_URL=postgresql://...

# Auth (Neon Auth)
NEXT_PUBLIC_NEON_AUTH_URL=https://your-project.auth.neon.tech
NEON_AUTH_BASE_URL=https://your-project.auth.neon.tech

# AI Services
DEEPGRAM_API_KEY=your_deepgram_key
GEMINI_API_KEY=your_gemini_key
```

## Deployment

Vercel. Push to main branch for automatic deployment.
