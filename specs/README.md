# Implementation Tasks Overview

## Project Summary

**From PRD**: SayCal est un calendrier minimaliste avec assistant vocal. L'utilisateur interagit vocalement avec son calendrier: créer, modifier, supprimer des événements, ou poser des questions.

**Tech Stack** (From ARCHI):
- Framework: TanStack Start (TypeScript, edge runtime)
- Deployment: Cloudflare Workers
- Database: Neon PostgreSQL + Drizzle ORM
- Authentication: Neon Auth (Better Auth, OTP passwordless)
- AI: Deepgram (STT) + Gemini Flash (function calling)
- Payments: Stripe
- UI: shadcn/ui + Tailwind CSS + full-calendar component

**Current State**:
- ✅ Setup projet TanStack Start + Cloudflare
- ✅ Landing page complète (hero, features, pricing, faq, cta, footer)
- ✅ Composants shadcn/ui de base
- ✅ i18n avec Paraglide (fr, en, de)
- ✅ TanStack Query setup
- ✅ PWA manifest + meta tags + favicons
- 🚧 Drizzle + Neon (schema basique à mettre à jour)
- ❌ Authentification (Neon Auth OTP)
- ❌ Schema events + subscriptions
- ❌ Dashboard (sidebar + calendrier)
- ❌ Assistant vocal (Deepgram + Gemini)
- ❌ Stripe (paiements)
- ❌ Observabilité (Sentry, Posthog)

## Task Execution Guidelines

1. **Lire la tâche complète** avant de commencer
2. **Vérifier les dépendances** sont terminées
3. **Suivre les patterns ARCHI** (Server Functions, Zod validation, etc.)
4. **Valider les critères de succès** à la fin

## MVP Tasks (specs/01-mvp/)

### Phase 1: Foundation

| # | Fichier | Description | Temps |
|---|---------|-------------|-------|
| 01 | `01-neon-auth.md` | Auth OTP passwordless (Neon Auth + Better Auth) | 1-2h |
| 02 | `02-database-schema.md` | Schema events + user_subscriptions (Drizzle) | 1-2h |

### Phase 2: Core App

| # | Fichier | Description | Temps |
|---|---------|-------------|-------|
| 03 | `03-calendar-view.md` | Dashboard: Sidebar ShadCN + full-calendar | 2-3h |
| 04 | `04-event-crud.md` | CRUD événements manuel (formulaires) | 2-3h |

### Phase 3: Voice Assistant

| # | Fichier | Description | Temps |
|---|---------|-------------|-------|
| 05 | `05-voice-assistant.md` | Assistant vocal complet: enregistrement, Deepgram, Gemini function calling, UI conversationnelle | 4-5h |

### Phase 4: Monetization & Polish

| # | Fichier | Description | Temps |
|---|---------|-------------|-------|
| 06 | `06-stripe-setup.md` | Stripe checkout, webhooks, portal | 3h |
| 07 | `07-observability.md` | Sentry + Posthog analytics | 2h |
| 08 | `08-email-resend.md` | Emails transactionnels (Resend) | 2h |

## Dependency Map

```
┌─────────────────────────────────────────────────────────────┐
│                     PHASE 1: FOUNDATION                      │
├─────────────────────────────────────────────────────────────┤
│  01-neon-auth ───────────────────────────────────────────── │
│         │                                                    │
│         ▼                                                    │
│  02-database-schema ─────────────────────────────────────── │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                     PHASE 2: CORE APP                        │
├─────────────────────────────────────────────────────────────┤
│  03-calendar-view (sidebar + full-calendar) ───────────────  │
│         │                                                    │
│         ▼                                                    │
│  04-event-crud (formulaires CRUD) ─────────────────────────  │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   PHASE 3: VOICE ASSISTANT                   │
├─────────────────────────────────────────────────────────────┤
│  05-voice-assistant ───────────────────────────────────────  │
│     ├── Enregistrement audio (MediaRecorder)                 │
│     ├── Transcription (Deepgram Batch)                       │
│     ├── LLM + Function Calling (Gemini Flash)                │
│     └── UI conversationnelle (panel, messages)               │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                PHASE 4: MONETIZATION & POLISH                │
├─────────────────────────────────────────────────────────────┤
│  06-stripe-setup ──────────────────────────────────────────  │
│  07-observability ─────────────────────────────────────────  │
│  08-email-resend ──────────────────────────────────────────  │
└─────────────────────────────────────────────────────────────┘
```

## Architecture Voice Assistant

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │     │  CF Worker   │     │   Deepgram   │     │   Gemini     │
│  (Record)    │────▶│   (Proxy)    │────▶│    (STT)     │────▶│  (Actions)   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────────┐
                                                               │   Database   │
                                                               │  (Events)    │
                                                               └──────────────┘
```

**Actions vocales possibles:**
- 📅 **Créer**: "Dentiste demain 14h"
- ✏️ **Modifier**: "Décale mon dentiste à 15h"
- 🗑️ **Supprimer**: "Annule mon dentiste"
- 📋 **Lister**: "Qu'est-ce que j'ai cette semaine?"

## PRD Coverage

| Feature PRD | Tâche |
|-------------|-------|
| Authentification Simple | Task 01 (OTP passwordless) |
| Interface Calendrier Minimale & Premium | Task 03 (full-calendar) |
| Gestion Manuelle des Événements | Task 04 |
| Création Vocale Ultra-Rapide | Task 05 (assistant complet) |
| Expérience Multi-Plateforme | Déjà fait + Task 03 |

## Composants Clés

| Composant | Source | Usage |
|-----------|--------|-------|
| Sidebar | shadcn/ui | Navigation app |
| Calendar | yassir-jeraidi/full-calendar | Vue calendrier |
| Auth UI | Neon Auth (@neondatabase/neon-js) | Login OTP |
| Voice Panel | Custom | Assistant vocal |

## ARCHI Patterns à Respecter

- **Server Functions**: Loaders pour lectures, Actions pour mutations
- **Validation**: Zod pour tous les inputs
- **State**: React Query pour server state
- **Styling**: Tailwind + shadcn/ui + cn() helper
- **i18n**: Paraglide avec `m.message_key()`

## Total Estimated Time: 18-22 heures
