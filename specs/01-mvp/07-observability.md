# Task 09: Sentry + Posthog Analytics

## Context

L'ARCHI définit Sentry pour l'error tracking et Posthog pour l'analytics produit. Ces outils permettent de monitorer la santé de l'app et comprendre le comportement utilisateur (funnel signup → first event → voice usage → upgrade).

## Scope

- Intégration Sentry (client + server)
- Upload des source maps au deploy
- Intégration Posthog avec events clés
- Définition des events à tracker
- Privacy-first: pas de données sensibles

## Implementation Details

### Files to Create/Modify

- `src/lib/monitoring/sentry.ts` - Config Sentry
- `src/lib/analytics/posthog.ts` - Client Posthog
- `src/lib/analytics/events.ts` - Définition des events
- `src/routes/__root.tsx` - Initialisation providers
- `vite.config.ts` - Sentry plugin pour source maps
- `src/env.ts` - Variables Sentry + Posthog

### Key Functionality

1. **Configuration Sentry**
```typescript
// src/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/react'

export function initSentry() {
  if (typeof window === 'undefined') return

  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    environment: env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1, // 10% des transactions
    replaysSessionSampleRate: 0.05, // 5% des sessions
    replaysOnErrorSampleRate: 1.0, // 100% si erreur

    beforeSend(event) {
      // Nettoyer les données sensibles
      if (event.request?.headers) {
        delete event.request.headers['Authorization']
      }
      return event
    },
  })
}
```

2. **Configuration Posthog**
```typescript
// src/lib/analytics/posthog.ts
import posthog from 'posthog-js'

export function initPosthog() {
  if (typeof window === 'undefined') return

  posthog.init(env.VITE_POSTHOG_KEY, {
    api_host: 'https://eu.posthog.com',
    autocapture: false, // On définit nos propres events
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage',

    // Privacy
    disable_session_recording: false,
    mask_all_text: true,
    mask_all_element_attributes: true,
  })
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  posthog.identify(userId, traits)
}

export function resetUser() {
  posthog.reset()
}
```

3. **Events à tracker**
```typescript
// src/lib/analytics/events.ts
import posthog from 'posthog-js'

export const analytics = {
  // Auth
  signUp: () => posthog.capture('user_signed_up'),
  signIn: () => posthog.capture('user_signed_in'),
  signOut: () => posthog.capture('user_signed_out'),

  // Events calendrier
  eventCreated: (method: 'voice' | 'manual') =>
    posthog.capture('event_created', { method }),
  eventUpdated: () => posthog.capture('event_updated'),
  eventDeleted: () => posthog.capture('event_deleted'),

  // Voice
  voiceRecordingStarted: () => posthog.capture('voice_recording_started'),
  voiceRecordingCompleted: (duration: number) =>
    posthog.capture('voice_recording_completed', { duration }),
  voiceQuotaReached: () => posthog.capture('voice_quota_reached'),

  // Subscription
  subscriptionStarted: () => posthog.capture('subscription_started'),
  subscriptionCancelled: () => posthog.capture('subscription_cancelled'),
  upgradeModalViewed: () => posthog.capture('upgrade_modal_viewed'),
  upgradeModalClicked: () => posthog.capture('upgrade_modal_clicked'),

  // Calendar
  viewChanged: (view: 'day' | 'week' | 'month') =>
    posthog.capture('calendar_view_changed', { view }),
}
```

4. **Intégration dans l'app**
```tsx
// src/routes/__root.tsx
import { initSentry } from '@/lib/monitoring/sentry'
import { initPosthog } from '@/lib/analytics/posthog'

// Initialisation au chargement
if (typeof window !== 'undefined') {
  initSentry()
  initPosthog()
}

// Error boundary avec Sentry
function RootLayout() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <Outlet />
    </Sentry.ErrorBoundary>
  )
}
```

5. **Source maps upload**
```typescript
// vite.config.ts
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig({
  build: {
    sourcemap: true, // Générer les source maps
  },
  plugins: [
    sentryVitePlugin({
      org: env.SENTRY_ORG,
      project: env.SENTRY_PROJECT,
      authToken: env.SENTRY_AUTH_TOKEN,
    }),
  ],
})
```

6. **Tracking côté serveur (Sentry)**
```typescript
// src/server.ts ou dans les server functions
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: env.SENTRY_DSN,
  tracesSampleRate: 0.1,
})

// Dans les actions
export const createEvent = createServerFn('POST', async (data) => {
  return Sentry.startSpan({ name: 'createEvent' }, async () => {
    try {
      // ... logic
    } catch (error) {
      Sentry.captureException(error)
      throw error
    }
  })
})
```

### Technologies Used

- **Sentry**: Error tracking + Session replay
- **Posthog**: Product analytics + Feature flags
- **Sentry Vite Plugin**: Upload source maps

### Architectural Patterns

```typescript
// Pattern: Hook pour tracking automatique
function useTrackPageView(pageName: string) {
  useEffect(() => {
    posthog.capture('$pageview', { page: pageName })
  }, [pageName])
}

// Pattern: Error boundary avec tracking
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } })
  }
}
```

## Success Criteria

- [ ] Sentry capture les erreurs client (test avec throw)
- [ ] Sentry capture les erreurs serveur
- [ ] Source maps uploadés → stack traces lisibles
- [ ] Posthog identifie les utilisateurs connectés
- [ ] Events clés trackés (event_created, subscription_started)
- [ ] Session replay activé (avec masquage)
- [ ] Pas de données sensibles envoyées
- [ ] Dashboard Posthog montre le funnel

## Testing & Validation

### Manual Testing Steps

1. Configurer les variables (Sentry DSN, Posthog key)
2. Déclencher une erreur volontairement
3. Vérifier dans Sentry Dashboard
4. Créer un événement
5. Vérifier event "event_created" dans Posthog
6. Créer via voix
7. Vérifier le funnel voice_recording → event_created
8. Déployer et vérifier source maps

### Edge Cases

- Utilisateur avec AdBlock (doit pas casser l'app)
- Erreur pendant init Sentry/Posthog
- Rate limiting Sentry

## Dependencies

**Must complete first**:
- Task 01: Neon Auth (pour identifier users)
- Task 04: Event CRUD (events à tracker)
- Task 05: Voice Recording (events voice)

**Blocks**:
- Aucun

## Related Documentation

- **ARCHI**: Section "Observability & Monitoring"
- **Sentry Docs**: https://docs.sentry.io/
- **Posthog Docs**: https://posthog.com/docs

---
**Estimated Time**: 2 heures
**Phase**: Polish
