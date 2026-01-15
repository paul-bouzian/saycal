# Technical Architecture: SayCal

## Architecture Overview

**Philosophy**: Architecture edge-first, minimaliste et orientée action. Priorité à la simplicité et à la rapidité d'exécution. Chaque choix technologique vise à réduire la friction utilisateur tout en maintenant des coûts d'infrastructure proches de zéro au démarrage.

**Tech Stack Summary**:
- Framework: TanStack Start (TypeScript, edge runtime)
- Deployment: Cloudflare Workers
- Database: Neon PostgreSQL + Drizzle ORM
- Authentication: Neon Auth
- AI: Deepgram (STT) + Gemini Flash (parsing)
- Payments: Stripe

---

## Design System & Brand

### Brand Identity

- **Nom du produit**: SayCal
- **Tagline**: Parle, c'est noté.
- **Logo**: Bulle de dialogue en forme de calendrier avec dégradé

### Color Palette

```css
/* Couleurs principales */
--color-primary: #B552D9;        /* Violet - couleur principale */
--color-secondary: #FA8485;      /* Pêche/Corail - couleur complémentaire */

/* Dégradé signature (violet → pêche) */
--gradient-brand: linear-gradient(135deg, #B552D9 0%, #FA8485 100%);

/* Thème clair */
--color-background: #FFFFFF;
--color-surface: #FAFAFA;
--color-text-primary: #1A1A2E;   /* Texte principal - proche du violet foncé du logo */
--color-text-secondary: #6B7280;
--color-border: #E5E7EB;

/* États */
--color-primary-hover: #A043C7;
--color-secondary-hover: #E97374;
```

### Tailwind CSS Configuration

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#B552D9',
          hover: '#A043C7',
          light: '#D4A5E8',
        },
        secondary: {
          DEFAULT: '#FA8485',
          hover: '#E97374',
          light: '#FDB5B5',
        },
        brand: {
          violet: '#B552D9',
          peach: '#FA8485',
          dark: '#1A1A2E', // Texte logo
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #B552D9 0%, #FA8485 100%)',
        'gradient-brand-hover': 'linear-gradient(135deg, #A043C7 0%, #E97374 100%)',
      },
    },
  },
};
```

### Design Guidelines

- **Thème**: Clair uniquement (MVP), fond blanc
- **Boutons principaux**: Utiliser `bg-gradient-brand` pour les CTAs importants
- **Boutons secondaires**: Outline avec `border-primary`
- **Accents**: Utiliser le pêche (#FA8485) pour les highlights et notifications
- **Ombres**: Subtiles, avec teinte violette légère (`shadow-primary/10`)

### Component Styling Examples

```tsx
// Bouton principal avec dégradé
<button className="bg-gradient-brand hover:bg-gradient-brand-hover text-white px-6 py-3 rounded-xl font-medium transition-all">
  Créer un événement
</button>

// Bouton micro (FAB)
<button className="bg-gradient-brand w-16 h-16 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center">
  <MicIcon className="text-white w-8 h-8" />
</button>

// Card événement
<div className="bg-white border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
  {/* ... */}
</div>
```

### Typography

- **Font principale**: Inter (ou system-ui pour performance)
- **Titres**: Font-weight 600-700, couleur `brand-dark`
- **Corps**: Font-weight 400-500, couleur `text-primary`

---

## Frontend Architecture

### Core Stack

- **Framework**: TanStack Start (TypeScript)
  - **Why**: Full-stack React avec SSR edge-native, routing type-safe, excellente DX
  - **Trade-off**: Framework beta, moins de ressources que Next.js, mais architecture moderne et performante

- **UI Components**: shadcn/ui + Tailwind CSS
  - **Why**: Composants accessibles, customisables, pas de vendor lock-in
  - **Trade-off**: Plus de setup initial que des libs "prêtes à l'emploi", mais contrôle total

- **Forms**: @tanstack/react-form
  - **Why**: Cohérent avec l'écosystème TanStack, validation type-safe
  - **Trade-off**: Moins populaire que React Hook Form, mais intégration native

### State Management

- **Global State**: React hooks + Context (pas de lib externe)
  - **Why**: App simple, pas besoin de Redux/Zustand pour un calendrier personnel

- **Server State**: @tanstack/react-query
  - **Why**: Cache, invalidation, optimistic updates out-of-the-box
  - **Trade-off**: Dépendance supplémentaire, mais standard de l'industrie

- **URL State**: Non nécessaire pour MVP
  - Le calendrier n'a pas de filtres/recherche complexes à persister

### Data Fetching Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    TanStack Start                        │
├─────────────────────────────────────────────────────────┤
│  Server Functions (loaders/actions)                      │
│  ├── Fetch initial data (SSR)                           │
│  └── Mutations (create/update/delete events)            │
├─────────────────────────────────────────────────────────┤
│  React Query (client)                                    │
│  ├── Cache server data                                  │
│  ├── Optimistic updates                                 │
│  └── Background refetch                                 │
└─────────────────────────────────────────────────────────┘
```

### Internationalization

- **i18n**: Module intégré au template TanStack Start
  - Français par défaut
  - Structure prête pour multi-langue post-MVP

### PWA Configuration

- **Type**: PWA légère (installable, online-only)
- **Manifest**: App installable sur mobile/desktop
- **Service Worker**: Minimal, pas de cache offline
- **Why**: Expérience "app native" sans complexité de sync offline

---

## Backend Architecture

### API Layer

- **Pattern**: TanStack Server Functions
  - Loaders pour les lectures (GET-like)
  - Actions pour les mutations (POST-like)
  - **Why**: Colocalisé avec les routes, type-safe end-to-end

- **Validation**: Zod
  - Schémas partagés client/serveur
  - Validation des inputs utilisateur ET des réponses API externes

- **Security**:
  - CORS: Géré par Cloudflare Workers
  - Rate limiting: Compteur DB pour quotas IA (voir section dédiée)
  - Input sanitization: Zod + escape HTML pour titres d'événements

### Authentication & Authorization

- **Provider**: Neon Auth
  - **Why**: Intégration native avec Neon DB, zero config, sessions gérées automatiquement
  - **Trade-off**: Produit récent, moins flexible que Better Auth pour OAuth complexe

- **Method**: Email/Password + Magic Link
  - Pas d'OAuth pour MVP (simplification)
  - Magic Link pour UX moderne sans friction

- **Authorization Model**: Simple (pas de RBAC)
  ```
  User → owns → Calendar → owns → Events
  ```
  - Un user = un calendrier = ses événements
  - Pas de partage, pas de rôles, pas de permissions complexes

### Database & Data Layer

- **Database**: Neon PostgreSQL (serverless)
  - **Why**: Serverless-native, branching pour dev/preview, connection pooling intégré
  - **Trade-off**: Vendor lock-in partiel, mais migration vers Postgres standard possible

- **ORM**: Drizzle ORM
  - **Why**: Type-safe, léger, excellent support edge runtime
  - **Trade-off**: Moins de features que Prisma, mais plus performant en serverless

- **Schema principal**:

```typescript
// users (géré par Neon Auth)
users {
  id: uuid (PK)
  email: string
  created_at: timestamp
  // Neon Auth gère le reste
}

// events
events {
  id: uuid (PK)
  user_id: uuid (FK → users)
  title: string (max 200 chars)
  start_at: timestamp with timezone
  end_at: timestamp with timezone
  color: string (hex, nullable)
  created_via: enum ('voice', 'manual')
  created_at: timestamp
  updated_at: timestamp
}

// user_subscriptions
user_subscriptions {
  id: uuid (PK)
  user_id: uuid (FK → users, unique)
  stripe_customer_id: string
  stripe_subscription_id: string (nullable)
  plan: enum ('free', 'premium')
  voice_usage_month: string (ex: '2026-01')
  voice_usage_count: integer (default 0)
  updated_at: timestamp
}
```

- **Indexes**:
  - `events(user_id, start_at)` - Query par période
  - `user_subscriptions(user_id)` - Lookup rapide

---

## AI Integration

### Speech-to-Text (STT)

- **Provider**: Deepgram (Batch API)
  - **Why**: Excellent rapport qualité/prix, batch moins cher que temps réel
  - **Cost**: ~$0.0043/min (Nova-2)
  - **Trade-off**: Latence légèrement supérieure au temps réel (~2-3s)

- **Flow**:
```
┌──────────┐     ┌─────────────┐     ┌──────────────┐
│  Client  │────▶│  CF Worker  │────▶│   Deepgram   │
│  (audio) │     │  (proxy)    │     │  (batch API) │
└──────────┘     └─────────────┘     └──────────────┘
                        │
                        ▼
                 ┌─────────────┐
                 │  Transcrit  │
                 └─────────────┘
```

- **Audio constraints**:
  - Format: WebM/Opus (natif browser)
  - Max duration: 30 secondes (anti-abus)
  - Direct upload: Pas de stockage intermédiaire

### LLM Parsing

- **Primary Provider**: Google Gemini 2.0 Flash
  - **Why**: Ultra rapide (~200ms), très économique (~$0.10/1M tokens)
  - **Use case**: Extraction structurée (date, heure, durée, titre)

- **Prompt Strategy**:
```
System: Tu es un assistant qui extrait les informations d'événements.
Retourne uniquement un JSON valide.

User: "Dentiste demain à 14h"

Output: {
  "title": "Dentiste",
  "date": "2026-01-15",
  "start_time": "14:00",
  "end_time": "15:00",
  "confidence": 0.95
}
```

- **Fallback**: Non prévu pour MVP (Gemini très stable)
  - Post-MVP: Groq (Llama) comme backup gratuit

### Anti-Abus System

- **Quota Management**: Compteur DB avec lazy reset
  ```typescript
  // Pseudo-code
  async function checkVoiceQuota(userId: string) {
    const sub = await db.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.userId, userId)
    });

    const currentMonth = format(new Date(), 'yyyy-MM');

    if (sub.voiceUsageMonth !== currentMonth) {
      // Nouveau mois → reset
      await db.update(userSubscriptions)
        .set({ voiceUsageMonth: currentMonth, voiceUsageCount: 0 })
        .where(eq(userSubscriptions.userId, userId));
      return { allowed: true, remaining: MONTHLY_LIMIT };
    }

    if (sub.voiceUsageCount >= MONTHLY_LIMIT) {
      return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: MONTHLY_LIMIT - sub.voiceUsageCount };
  }
  ```

- **Limits**:
  - Free: 0 requêtes vocales (ou 3 pour essai découverte)
  - Premium: ~100 requêtes/mois
  - Power User (BYO API): Illimité

---

## Payments Integration

### Stripe Setup

- **Products**:
  - `saycal_premium`: 5€/mois, recurring

- **Webhook Events**:
  ```
  checkout.session.completed → Create subscription, set plan='premium'
  customer.subscription.updated → Update plan status
  customer.subscription.deleted → Revert to plan='free'
  invoice.payment_failed → Notify user (via Resend)
  ```

- **Customer Portal**: Stripe hosted (gestion abonnement self-service)

### Power User Mode (BYO API Key)

- Stockage clé API: Chiffrée en DB (AES-256)
- Validation: Test call à Deepgram/Gemini avant save
- Pas de quota tracking quand BYO activé

---

## Infrastructure & Deployment

### Platform: Cloudflare Workers

- **Why**:
  - Edge-native, latence minimale worldwide
  - Pricing généreux (100k req/jour gratuit)
  - Intégration native avec TanStack Start

- **Trade-off**:
  - Limites CPU (50ms par défaut, 30s max)
  - Pas de filesystem (mais pas besoin ici)

### Region Strategy

- **Edge**: Code exécuté au plus proche de l'utilisateur
- **Database**: Neon région `eu-central-1` (Frankfurt)
  - Latence acceptable pour users EU
  - Single region pour simplifier

### Environment Configuration

- **T3Env**: Validation des variables d'environnement au build
  ```typescript
  // env.ts
  export const env = createEnv({
    server: {
      DATABASE_URL: z.string().url(),
      NEON_AUTH_SECRET: z.string(),
      DEEPGRAM_API_KEY: z.string(),
      GEMINI_API_KEY: z.string(),
      STRIPE_SECRET_KEY: z.string(),
      STRIPE_WEBHOOK_SECRET: z.string(),
      RESEND_API_KEY: z.string(),
    },
    client: {
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
    },
  });
  ```

### CI/CD

- **Platform**: GitHub Actions
- **Pipeline**:
  ```
  Push → Lint/Type-check → Build → Deploy to Cloudflare
  ```
- **Preview Deployments**: Cloudflare preview URLs par PR

---

## Observability & Monitoring

### Error Tracking

- **Sentry**
  - Client-side: Errors React, unhandled rejections
  - Server-side: Errors dans Workers
  - Source maps uploadés au deploy

### Analytics

- **Posthog**
  - **Events trackés**:
    - `event_created` (properties: `method: 'voice' | 'manual'`)
    - `subscription_started`
    - `subscription_cancelled`
    - `voice_quota_reached`
  - **Funnels**: Signup → First event → Voice usage → Upgrade

### Health Monitoring

- **Cloudflare Analytics**: Métriques Workers (requests, errors, latency)
- **Neon Dashboard**: Métriques DB (connections, query time)

---

## Additional Services

### Email: Resend

- **Use cases**:
  - Magic link authentication
  - Welcome email
  - Payment failed notification

- **Template approach**: React Email components

### File Storage

- **Not needed for MVP**
  - Audio: Direct upload to Deepgram (no storage)
  - Pas de pièces jointes aux événements

---

## Architecture Decision Records

### ADR-001: TanStack Start over Next.js

- **Context**: Besoin d'un framework React full-stack avec SSR
- **Decision**: TanStack Start
- **Alternatives**: Next.js 15, Remix
- **Rationale**:
  - Edge-native sans config
  - Type-safety supérieure (routing, loaders)
  - Écosystème TanStack cohérent (Query, Form, Router)
- **Consequences**:
  - Framework beta, breaking changes possibles
  - Moins de ressources communautaires
  - Migration plus complexe si abandon du projet

### ADR-002: Neon Auth over Better Auth

- **Context**: Besoin d'authentification simple (email/password, magic link)
- **Decision**: Neon Auth
- **Alternatives**: Better Auth, Clerk, Auth.js
- **Rationale**:
  - Intégration native avec Neon DB
  - Zero config, sessions automatiques
  - Test d'une nouvelle solution
- **Consequences**:
  - Produit récent, stabilité à prouver
  - OAuth limité si besoin post-MVP
  - Vendor lock-in avec Neon

### ADR-003: Deepgram Batch over Real-time

- **Context**: Transcription audio pour création d'événements
- **Decision**: Deepgram Batch API
- **Alternatives**: Deepgram Streaming, Whisper API, AssemblyAI
- **Rationale**:
  - Moins cher que temps réel (~40% moins)
  - Latence acceptable (2-3s pour 30s audio)
  - Use case non-interactif (pas de sous-titres live)
- **Consequences**:
  - Pas de feedback temps réel pendant dictée
  - UX légèrement moins "magique"

### ADR-004: Gemini Flash for LLM Parsing

- **Context**: Extraction structurée de date/heure/titre depuis texte
- **Decision**: Google Gemini 2.0 Flash
- **Alternatives**: GPT-4o-mini, Claude Haiku, Groq
- **Rationale**:
  - Ultra rapide (~200ms)
  - Très économique (~$0.10/1M tokens)
  - Excellent pour tâches structurées simples
- **Consequences**:
  - Dépendance Google
  - Qualité légèrement inférieure aux modèles plus gros (mais suffisant)

### ADR-005: Simple DB Counter over Redis for Quotas

- **Context**: Tracking des quotas mensuels de requêtes vocales
- **Decision**: Compteur en base Postgres avec lazy reset
- **Alternatives**: Upstash Redis, Cloudflare KV
- **Rationale**:
  - Pas de service supplémentaire
  - Persistance garantie
  - Complexité minimale
- **Consequences**:
  - Légèrement moins performant qu'un KV
  - Acceptable car non-critique (quota, pas rate-limit temps réel)

---

## Folder Structure

```
saycal/
├── app/
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx              # Landing page
│   │   ├── app/
│   │   │   ├── index.tsx          # Dashboard calendrier
│   │   │   ├── settings.tsx       # Paramètres utilisateur
│   │   │   └── billing.tsx        # Gestion abonnement
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── verify.tsx         # Magic link callback
│   │   └── api/
│   │       ├── stripe-webhook.ts
│   │       └── voice/
│   │           └── transcribe.ts  # Endpoint Deepgram
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── calendar/
│   │   │   ├── calendar-view.tsx
│   │   │   ├── event-card.tsx
│   │   │   └── event-form.tsx
│   │   ├── voice/
│   │   │   ├── voice-button.tsx
│   │   │   └── voice-preview.tsx
│   │   └── layout/
│   │       ├── header.tsx
│   │       └── sidebar.tsx
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts          # Drizzle schema
│   │   │   ├── migrations/
│   │   │   └── index.ts           # DB client
│   │   ├── ai/
│   │   │   ├── deepgram.ts        # STT client
│   │   │   └── gemini.ts          # LLM parser
│   │   ├── stripe/
│   │   │   ├── client.ts
│   │   │   └── webhooks.ts
│   │   ├── email/
│   │   │   └── resend.ts
│   │   └── utils/
│   │       ├── date.ts
│   │       └── quota.ts
│   ├── hooks/
│   │   ├── use-voice-recorder.ts
│   │   └── use-calendar.ts
│   └── styles/
│       └── globals.css
├── public/
│   ├── manifest.json              # PWA manifest
│   └── icons/
├── drizzle.config.ts
├── tailwind.config.ts
├── env.ts                         # T3Env
└── package.json
```

---

## Cost Estimation

### Monthly at Scale (1000 WAU)

| Service | Usage estimé | Coût |
|---------|--------------|------|
| Cloudflare Workers | ~500k req/mois | $0 (free tier) |
| Neon PostgreSQL | ~1GB, light queries | $0-19/mois |
| Deepgram | ~500 min/mois | ~$2.15 |
| Gemini Flash | ~50k tokens/mois | ~$0.01 |
| Resend | ~2000 emails/mois | $0 (free tier) |
| Sentry | Basic | $0 (free tier) |
| Posthog | ~100k events/mois | $0 (free tier) |
| Stripe | 2.9% + 0.30€/transaction | Variable |
| **Total fixe** | | **~$2-20/mois** |

### Revenue vs Cost (100 Premium users @ 5€)

- Revenue: 500€/mois
- Stripe fees: ~20€
- Infrastructure: ~20€
- **Marge**: ~460€/mois (92%)

### Free Tier Limits

| Service | Limite gratuite |
|---------|-----------------|
| Cloudflare Workers | 100k req/jour |
| Neon | 0.5GB storage, 1 compute |
| Deepgram | $200 crédit initial |
| Gemini | 1M tokens/mois |
| Resend | 3000 emails/mois |
| Posthog | 1M events/mois |
| Sentry | 5k errors/mois |

---

## Implementation Priority

### Phase 1: Foundation (Jour 1-2)

1. Setup projet TanStack Start + Cloudflare
2. Configuration Drizzle + Neon
3. Intégration Neon Auth (login/register/magic link)
4. Layout de base + shadcn/ui setup
5. Configuration T3Env

### Phase 2: Core Calendar (Jour 2-3)

1. Schema events + migrations
2. Vue calendrier (jour/semaine/mois)
3. CRUD événements manuel
4. Formulaire création/édition
5. Responsive design

### Phase 3: Voice Feature (Jour 3-4)

1. Composant enregistrement audio
2. Intégration Deepgram (transcription)
3. Intégration Gemini (parsing)
4. Preview + confirmation événement
5. Système de quota (compteur DB)

### Phase 4: Monetization (Jour 4-5)

1. Setup Stripe (produits, prix)
2. Checkout flow
3. Webhooks handling
4. Customer portal
5. Gating features (voice = premium)

### Phase 5: Polish (Jour 5)

1. Sentry integration
2. Posthog analytics
3. PWA manifest
4. Emails transactionnels (Resend)
5. Tests manuels + bug fixes

---

## Security Checklist

- [ ] Variables d'environnement validées (T3Env)
- [ ] Clés API non exposées côté client
- [ ] Validation Zod sur tous les inputs
- [ ] Escape HTML dans titres événements
- [ ] HTTPS only (Cloudflare default)
- [ ] Cookies secure + httpOnly (Neon Auth)
- [ ] Rate limiting sur endpoints sensibles
- [ ] Chiffrement clés API utilisateurs (BYO mode)
- [ ] Webhook signature verification (Stripe)
