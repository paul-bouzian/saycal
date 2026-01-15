# Task 01: Intégration Neon Auth (Passwordless OTP)

## Context

Le PRD spécifie une "Authentification Simple" avec inscription/connexion. L'ARCHI précise l'utilisation de Neon Auth.

**Important**: Neon Auth est basé sur **Better Auth 1.4.6** et utilise le package `@neondatabase/neon-js`. Toutes les données d'authentification sont stockées dans le schema `neon_auth` de la base de données Neon.

**Choix d'implémentation**: Mode **OTP par email** (passwordless) pour compatibilité PWA. Les magic links ne fonctionnent pas bien sur PWA iOS car ils ouvrent Safari au lieu de rester dans l'app.

## Scope

- Installer et configurer `@neondatabase/neon-js`
- Créer le client d'authentification
- Configurer le `NeonAuthUIProvider` avec **emailOTP** activé
- Créer les routes d'authentification (`/auth/$pathname`)
- Créer la route de gestion de compte (`/account/$pathname`)
- Protéger les routes `/app/*` avec `SignedIn` et `RedirectToSignIn`
- Configurer la variable d'environnement `VITE_NEON_AUTH_URL`

## Implementation Details

### Files to Create/Modify

- `src/lib/auth.ts` - Client Neon Auth
- `src/routes/__root.tsx` - Ajouter `NeonAuthUIProvider` avec emailOTP
- `src/routes/auth.$pathname.tsx` - Page auth (sign-in, sign-up)
- `src/routes/account.$pathname.tsx` - Page gestion compte
- `src/routes/app/index.tsx` - Dashboard protégé
- `src/styles.css` - Import des styles Neon Auth
- `.env.local` - Ajouter `VITE_NEON_AUTH_URL`

### Étape 1: Installation

```bash
bun add @neondatabase/neon-js
```

### Étape 2: Activer Neon Auth dans la console

1. Aller sur [console.neon.tech](https://console.neon.tech)
2. Sélectionner le projet SayCal
3. Aller dans **Settings** → **Auth**
4. Activer Neon Auth
5. Configurer:
   - ✅ **Sign-up with Email**: Activé
   - ✅ **Verify at Sign-up**: Activé avec **verification codes** (pas liens)
   - Ajouter les domaines de production dans **Trusted Domains**
6. Copier l'**Auth URL** depuis l'onglet Configuration

### Étape 3: Variable d'environnement

```bash
# .env.local
VITE_NEON_AUTH_URL=https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/auth
```

### Étape 4: Styles CSS

```css
/* src/styles.css - après les imports Tailwind */
@import '@neondatabase/neon-js/ui/tailwind';
```

### Étape 5: Client d'authentification

```typescript
// src/lib/auth.ts
import { createAuthClient } from '@neondatabase/neon-js/auth'
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react'

export const authClient = createAuthClient(
  import.meta.env.VITE_NEON_AUTH_URL,
  { adapter: BetterAuthReactAdapter() }
)
```

### Étape 6: Provider avec emailOTP dans __root.tsx

```tsx
// src/routes/__root.tsx
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react'
import { authClient } from '@/lib/auth'

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootLayout,
  // ... existing config
})

function RootLayout() {
  return (
    <NeonAuthUIProvider
      authClient={authClient}
      emailOTP                              // ← Active le mode OTP passwordless
      credentials={{ forgotPassword: true }} // ← Permet reset via OTP
      redirectTo="/app"                      // ← Redirection après auth
    >
      <Outlet />
    </NeonAuthUIProvider>
  )
}
```

**Props importantes:**
- `emailOTP`: Active l'authentification par code OTP (6 chiffres) au lieu du mot de passe
- `redirectTo`: Page de destination après connexion réussie
- `credentials.forgotPassword`: Active le reset de password via OTP (si besoin)

### Étape 7: Route d'authentification

```tsx
// src/routes/auth.$pathname.tsx
import { createFileRoute } from '@tanstack/react-router'
import { AuthView } from '@neondatabase/neon-js/auth/react/ui'

export const Route = createFileRoute('/auth/$pathname')({
  component: AuthPage,
})

function AuthPage() {
  const { pathname } = Route.useParams()

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">
            SayCal
          </h1>
          <p className="text-muted-foreground mt-2">
            Parle, c'est noté.
          </p>
        </div>
        <AuthView pathname={pathname} />
      </div>
    </div>
  )
}
```

**Routes disponibles avec emailOTP:**
- `/auth/sign-in` - Entrer email → recevoir code → entrer code → connecté
- `/auth/sign-up` - Créer compte avec email → recevoir code → vérifier → connecté

### Étape 8: Route de gestion de compte

```tsx
// src/routes/account.$pathname.tsx
import { createFileRoute } from '@tanstack/react-router'
import { AccountView } from '@neondatabase/neon-js/auth/react/ui'

export const Route = createFileRoute('/account/$pathname')({
  component: AccountPage,
})

function AccountPage() {
  const { pathname } = Route.useParams()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <AccountView pathname={pathname} />
    </div>
  )
}
```

### Étape 9: Protection des routes /app/*

```tsx
// src/routes/app/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@neondatabase/neon-js/auth/react/ui'
import { authClient } from '@/lib/auth'

export const Route = createFileRoute('/app/')({
  component: AppDashboard,
})

function AppDashboard() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <>
      <SignedIn>
        <div className="min-h-screen">
          <header className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold">SayCal</h1>
            <UserButton />
          </header>
          <main className="p-4">
            <p>Bienvenue {session?.user?.name || session?.user?.email}</p>
            {/* Calendrier ici - Task 03 */}
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
```

### Flow d'authentification OTP (Passwordless)

```
┌─────────────────────────────────────────────────────────────┐
│                    SIGN IN / SIGN UP                        │
├─────────────────────────────────────────────────────────────┤
│  1. User entre son email                                    │
│     └──▶ auth.emailOtp.sendVerificationOtp({                │
│              email, type: "sign-in"                         │
│          })                                                 │
│                                                             │
│  2. Email reçu avec code 6 chiffres                         │
│     └──▶ Code valide 15 minutes                             │
│                                                             │
│  3. User entre le code dans l'app (PWA reste ouverte!)      │
│     └──▶ auth.signIn.emailOtp({ email, otp })               │
│                                                             │
│  4. Session créée, user redirigé vers /app                  │
│     └──▶ Si nouveau user → auto-inscription                 │
└─────────────────────────────────────────────────────────────┘
```

**Avantages pour PWA:**
- L'app reste ouverte pendant que l'user lit son email
- Pas de lien externe qui ouvrirait Safari
- Expérience native et fluide

### Technologies Used

- **@neondatabase/neon-js**: SDK unifié Neon (auth, data, db)
- **Better Auth 1.4.6**: Fondation de Neon Auth avec plugin emailOTP
- **Schema neon_auth**: Tables `user`, `session`, `account`, `verification` auto-gérées

### Composants UI disponibles

| Composant | Description |
|-----------|-------------|
| `NeonAuthUIProvider` | Provider avec config `emailOTP` |
| `AuthView` | Formulaire auth (adapte l'UI pour OTP quand activé) |
| `AccountView` | Gestion du compte utilisateur |
| `SignedIn` | Affiche le contenu si authentifié |
| `SignedOut` | Affiche le contenu si non authentifié |
| `RedirectToSignIn` | Redirige vers /auth/sign-in |
| `UserButton` | Bouton profil avec menu dropdown |

### Hook pour accéder à la session

```typescript
import { authClient } from '@/lib/auth'

function MyComponent() {
  const { data, isPending, error } = authClient.useSession()

  if (isPending) return <Spinner />
  if (!data) return <RedirectToSignIn />

  // data.user contient: id, email, name, emailVerified, createdAt
  // data.session contient: id, userId, expiresAt
  return <p>Hello {data.user.email}</p>
}
```

### Méthodes SDK pour OTP (si besoin de custom UI)

```typescript
// Envoyer un OTP
await authClient.emailOtp.sendVerificationOtp({
  email: 'user@example.com',
  type: 'sign-in' // ou 'email-verification' ou 'forget-password'
})

// Se connecter avec l'OTP
const { data, error } = await authClient.signIn.emailOtp({
  email: 'user@example.com',
  otp: '123456'
})

// Vérifier email avec OTP (inscription)
await authClient.emailOtp.verifyEmail({
  email: 'user@example.com',
  otp: '123456'
})
```

### Accès aux données côté serveur (SQL)

```sql
-- Voir tous les utilisateurs
SELECT id, email, name, "emailVerified", "createdAt"
FROM neon_auth.user;

-- Voir les sessions actives
SELECT * FROM neon_auth.session WHERE "expiresAt" > NOW();

-- Voir les codes OTP en attente (debug)
SELECT * FROM neon_auth.verification WHERE "expiresAt" > NOW();
```

## Success Criteria

- [ ] Package `@neondatabase/neon-js` installé
- [ ] Neon Auth activé dans la console avec **verification codes**
- [ ] Variable `VITE_NEON_AUTH_URL` configurée
- [ ] Styles Neon Auth importés
- [ ] `NeonAuthUIProvider` configuré avec `emailOTP`
- [ ] Route `/auth/sign-in` → formulaire demande email
- [ ] Après submit → email reçu avec code 6 chiffres
- [ ] Après saisie code → connexion réussie
- [ ] Si nouvel email → auto-inscription + connexion
- [ ] `UserButton` affiche le menu avec déconnexion
- [ ] `/app/` redirige vers `/auth/sign-in` si non connecté
- [ ] Session persiste après refresh (même dans PWA)
- [ ] Fonctionne sur PWA iOS (ajout à l'écran d'accueil)

## Testing & Validation

### Manual Testing Steps

1. Démarrer le serveur dev (`bun run dev`)
2. Aller sur `/app/` → doit rediriger vers `/auth/sign-in`
3. Entrer un email → cliquer "Continue"
4. Vérifier la réception du code par email
5. Entrer le code 6 chiffres
6. Vérifier la redirection vers `/app/`
7. Vérifier que `UserButton` affiche l'email
8. Cliquer déconnexion → retour à `/auth/sign-in`
9. Rafraîchir la page → session maintenue
10. **Tester sur PWA iOS**:
    - Ouvrir Safari sur iPhone
    - Aller sur le site
    - Ajouter à l'écran d'accueil
    - Ouvrir la PWA
    - Faire le flow de connexion OTP
    - Vérifier que tout fonctionne sans ouvrir Safari

### Edge Cases

- Code OTP expiré (15 min)
- Code OTP incorrect (max 3 tentatives)
- Email déjà utilisé (doit fonctionner = connexion)
- Session expirée
- Perte de connexion pendant la saisie du code

## Dependencies

**Must complete first**:
- Aucune (première tâche)
- Neon Auth doit être activé dans le dashboard Neon

**Blocks**:
- Task 02: Database Schema (jointure avec `neon_auth.user`)
- Task 03: Calendar View (routes protégées)

## Related Documentation

- **Neon Auth Overview**: https://neon.com/docs/auth/overview
- **TanStack Router Quick Start**: https://neon.com/docs/auth/quick-start/tanstack-router
- **Email Verification (OTP)**: https://neon.com/docs/auth/guides/email-verification
- **UI Components Reference**: https://neon.com/docs/auth/reference/ui-components
- **JavaScript SDK**: https://neon.com/docs/reference/javascript-sdk
- **Better Auth Email OTP Plugin**: https://www.better-auth.com/docs/plugins/email-otp
- **Production Checklist**: https://neon.com/docs/auth/production-checklist

---
**Estimated Time**: 1-2 heures
**Phase**: Foundation
