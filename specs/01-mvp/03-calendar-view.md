# Task 03: Dashboard avec Calendrier Full-Featured

## Context

Le PRD spécifie une "Interface Calendrier Minimale & Premium" avec vue jour/semaine/mois. Le dashboard est le cœur de l'application SayCal.

**Composants choisis:**
- **Calendrier**: [yassir-jeraidi/full-calendar](https://github.com/yassir-jeraidi/full-calendar) - Installable via CLI ShadCN
- **Sidebar**: [ShadCN Sidebar](https://ui.shadcn.com/docs/components/sidebar) - Navigation native ShadCN
- **UI**: Composants ShadCN partout

## Scope

- Installer le composant full-calendar via CLI ShadCN
- Installer et configurer la Sidebar ShadCN
- Créer le layout du dashboard (sidebar + calendrier)
- Adapter le calendrier pour utiliser nos données (events DB)
- Intégrer avec l'authentification (Task 01)
- Configurer les couleurs SayCal (violet/pêche)

## Implementation Details

### Files to Create/Modify

- `src/components/ui/sidebar.tsx` - Composant ShadCN Sidebar
- `src/features/calendar/*` - Composants calendrier (via CLI)
- `src/features/dashboard/app-sidebar.tsx` - Sidebar personnalisée
- `src/features/dashboard/dashboard-layout.tsx` - Layout principal
- `src/routes/app/index.tsx` - Page dashboard avec layout
- `src/routes/app/settings.tsx` - Page paramètres
- `src/routes/app/billing.tsx` - Page abonnement

### Étape 1: Installer la Sidebar ShadCN

```bash
npx shadcn@latest add sidebar
```

Cela installe les composants nécessaires dans `src/components/ui/`.

### Étape 2: Installer le calendrier Full-Calendar

```bash
npx shadcn@latest add "https://calendar.jeraidi.tech/r/full-calendar.json"
```

**Structure installée:**
```
src/modules/components/calendar/
├── calendar.tsx              # Point d'entrée
├── calendar-body.tsx         # Vue active
├── contexts/
│   ├── calendar-context.tsx  # État centralisé
│   └── dnd-context.tsx       # Drag & drop
├── header/
│   └── calendar-header.tsx   # Navigation
├── views/                    # Day, Week, Month, Year, Agenda
├── helpers.ts                # Utilitaires
├── hooks.ts                  # Hooks custom
└── types.ts                  # Types TypeScript
```

### Étape 3: Créer le layout Dashboard

```tsx
// src/features/dashboard/dashboard-layout.tsx
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { Separator } from '@/components/ui/separator'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="font-semibold">SayCal</h1>
        </header>
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

### Étape 4: Créer la Sidebar personnalisée

```tsx
// src/features/dashboard/app-sidebar.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { UserButton } from '@neondatabase/neon-js/auth/react/ui'
import { Calendar, Settings, CreditCard, Mic } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'

const menuItems = [
  { title: 'Calendrier', url: '/app', icon: Calendar },
  { title: 'Paramètres', url: '/app/settings', icon: Settings },
  { title: 'Abonnement', url: '/app/billing', icon: CreditCard },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">SayCal</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <UserButton />
      </SidebarFooter>
    </Sidebar>
  )
}
```

### Étape 5: Adapter le calendrier pour nos données

Le calendrier full-calendar utilise un Context interne. On doit l'adapter pour:
1. Charger les events depuis notre DB
2. Sauvegarder les modifications via nos Server Functions

```tsx
// src/features/calendar/calendar-adapter.tsx
import { Calendar } from '@/modules/components/calendar/calendar'
import { CalendarProvider } from '@/modules/components/calendar/contexts/calendar-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/lib/actions/events'
import { authClient } from '@/lib/auth'

export function CalendarAdapter() {
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()

  // Charger les événements
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', session?.user?.id],
    queryFn: () => getEvents({ userId: session!.user.id }),
    enabled: !!session?.user?.id,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })

  const updateMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })

  if (isLoading) {
    return <CalendarSkeleton />
  }

  // Adapter les events au format du calendrier
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.startAt,
    end: event.endAt,
    color: event.color || '#B552D9', // Couleur par défaut SayCal
    // ... autres champs selon types.ts
  }))

  return (
    <CalendarProvider
      events={calendarEvents}
      onEventCreate={(event) => createMutation.mutate(event)}
      onEventUpdate={(event) => updateMutation.mutate(event)}
      onEventDelete={(id) => deleteMutation.mutate({ id })}
    >
      <Calendar />
    </CalendarProvider>
  )
}
```

### Étape 6: Page Dashboard principale

```tsx
// src/routes/app/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { SignedIn, SignedOut, RedirectToSignIn } from '@neondatabase/neon-js/auth/react/ui'
import { DashboardLayout } from '@/features/dashboard/dashboard-layout'
import { CalendarAdapter } from '@/features/calendar/calendar-adapter'
import { VoiceButton } from '@/features/voice/voice-button'

export const Route = createFileRoute('/app/')({
  component: AppPage,
})

function AppPage() {
  return (
    <>
      <SignedIn>
        <DashboardLayout>
          <div className="relative h-full">
            <CalendarAdapter />
            {/* Bouton micro flottant - Task 05 */}
            <VoiceButton />
          </div>
        </DashboardLayout>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
```

### Étape 7: Personnaliser les couleurs SayCal

Modifier les fichiers du calendrier pour utiliser nos couleurs:

```tsx
// Dans les fichiers calendar, remplacer les couleurs par défaut

// Couleurs d'événements suggérées (palette SayCal)
const EVENT_COLORS = [
  '#B552D9', // Violet (primary)
  '#FA8485', // Pêche (secondary)
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
]

// Header avec gradient SayCal
<div className="bg-gradient-brand text-white ...">
```

### Étape 8: Routes supplémentaires

```tsx
// src/routes/app/settings.tsx
import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '@/features/dashboard/dashboard-layout'
import { AccountView } from '@neondatabase/neon-js/auth/react/ui'

export const Route = createFileRoute('/app/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
        <AccountView pathname="settings" />
      </div>
    </DashboardLayout>
  )
}
```

```tsx
// src/routes/app/billing.tsx
import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '@/features/dashboard/dashboard-layout'
// Billing UI - Task 08

export const Route = createFileRoute('/app/billing')({
  component: BillingPage,
})

function BillingPage() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Abonnement</h1>
        {/* Contenu billing - Task 08 */}
      </div>
    </DashboardLayout>
  )
}
```

### Features du calendrier installé

| Feature | Description |
|---------|-------------|
| **5 vues** | Jour, Semaine, Mois, Année, Agenda |
| **Drag & Drop** | Déplacer événements entre créneaux |
| **Redimensionnement** | Ajuster durée des événements |
| **Filtrage** | Par utilisateur (multi-user ready) |
| **Format horaire** | Bascule 12h / 24h |
| **Dark mode** | Support complet |
| **Responsive** | Adapté mobile/desktop |
| **localStorage** | Persiste préférences (vue, format) |

### Technologies Used

- **yassir-jeraidi/full-calendar**: Calendrier complet ShadCN-native
- **ShadCN Sidebar**: Navigation latérale
- **TanStack Query**: Sync avec la DB
- **Lucide React**: Icônes

## Success Criteria

- [ ] Sidebar ShadCN installée et fonctionnelle
- [ ] Calendrier full-calendar installé via CLI
- [ ] Layout dashboard: sidebar à gauche, calendrier au centre
- [ ] Navigation entre Calendrier / Paramètres / Abonnement
- [ ] Événements chargés depuis la DB
- [ ] Création d'événement via clic sur créneau
- [ ] Drag & drop fonctionne
- [ ] Changement de vue (jour/semaine/mois) fonctionne
- [ ] Couleurs SayCal appliquées
- [ ] UserButton dans la sidebar pour déconnexion
- [ ] Responsive (sidebar collapsible sur mobile)

## Testing & Validation

### Manual Testing Steps

1. Se connecter à `/app/`
2. Vérifier que la sidebar s'affiche à gauche
3. Vérifier que le calendrier prend tout l'espace restant
4. Naviguer entre les vues (jour, semaine, mois)
5. Cliquer sur un créneau → formulaire de création
6. Créer un événement → vérifier qu'il apparaît
7. Drag & drop un événement → vérifier la mise à jour
8. Cliquer sur Paramètres dans la sidebar
9. Cliquer sur Abonnement dans la sidebar
10. Tester sur mobile (sidebar doit se collapse)

### Edge Cases

- Événements qui chevauchent plusieurs jours
- Beaucoup d'événements le même jour
- Changement de timezone
- Perte de connexion pendant drag & drop

## Dependencies

**Must complete first**:
- Task 01: Neon Auth (authentification, UserButton)
- Task 02: Database Schema (events table)

**Blocks**:
- Task 04: Event CRUD (utilise le calendrier)
- Task 05: Voice Recording (bouton flottant dans le dashboard)

## Related Documentation

- **Full Calendar**: https://github.com/yassir-jeraidi/full-calendar
- **Demo**: https://calendar.jeraidi.tech
- **ShadCN Sidebar**: https://ui.shadcn.com/docs/components/sidebar
- **TanStack Query**: https://tanstack.com/query/latest

---
**Estimated Time**: 2-3 heures
**Phase**: Core Calendar
