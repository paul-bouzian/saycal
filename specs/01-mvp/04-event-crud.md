# Task 04: CRUD Événements Manuel

## Context

Le PRD spécifie une "Gestion Manuelle des Événements" comme alternative à la voix. Création via clic sur créneau vide, formulaire minimal (titre, heure fin, couleur optionnelle). Objectif: création < 15 secondes.

## Scope

- Formulaire de création d'événement (modal ou drawer)
- Formulaire d'édition d'événement
- Suppression avec confirmation
- Clic sur créneau vide pour pré-remplir date/heure
- Clic sur événement pour ouvrir l'édition
- Validation des champs avec Zod
- Optimistic updates avec React Query

## Implementation Details

### Files to Create/Modify

- `src/features/calendar/event-form.tsx` - Formulaire création/édition
- `src/features/calendar/event-dialog.tsx` - Dialog/Drawer container
- `src/features/calendar/event-details.tsx` - Vue détails + actions
- `src/lib/actions/events.ts` - Server actions CRUD
- `src/lib/schemas/event.ts` - Schémas Zod
- `src/components/ui/dialog.tsx` - Ajouter composant shadcn
- `src/components/ui/color-picker.tsx` - Sélecteur de couleur simple

### Key Functionality

1. **Server Actions CRUD**
```typescript
// src/lib/actions/events.ts
import { createServerFn } from '@tanstack/react-start'

export const createEvent = createServerFn('POST', async (data: CreateEventInput) => {
  const validated = createEventSchema.parse(data)
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const [event] = await db.insert(events).values({
    ...validated,
    userId: session.user.id,
    createdVia: 'manual'
  }).returning()

  return event
})

export const updateEvent = createServerFn('POST', async (data: UpdateEventInput) => {
  // Validation + update + return
})

export const deleteEvent = createServerFn('POST', async (data: { id: string }) => {
  // Vérifier ownership + delete
})
```

2. **Formulaire avec TanStack Form**
```tsx
// src/features/calendar/event-form.tsx
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'

export function EventForm({ event, onSuccess }: EventFormProps) {
  const form = useForm({
    defaultValues: {
      title: event?.title ?? '',
      startAt: event?.startAt ?? new Date(),
      endAt: event?.endAt ?? addHours(new Date(), 1),
      color: event?.color ?? null,
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      if (event) {
        await updateEvent({ id: event.id, ...value })
      } else {
        await createEvent(value)
      }
      onSuccess()
    }
  })

  return (
    <form onSubmit={form.handleSubmit}>
      {/* Champs avec form.Field */}
    </form>
  )
}
```

3. **Optimistic Updates**
```typescript
// Hook avec mutation
const createMutation = useMutation({
  mutationFn: createEvent,
  onMutate: async (newEvent) => {
    await queryClient.cancelQueries({ queryKey: ['events'] })
    const previous = queryClient.getQueryData(['events'])
    queryClient.setQueryData(['events'], (old) => [...old, { ...newEvent, id: 'temp' }])
    return { previous }
  },
  onError: (err, _, context) => {
    queryClient.setQueryData(['events'], context.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['events'] })
  }
})
```

4. **Interaction calendrier**
```tsx
// Dans CalendarView
const handleSlotClick = (date: Date, hour: number) => {
  setDialogState({
    open: true,
    mode: 'create',
    defaultValues: {
      startAt: setHours(date, hour),
      endAt: setHours(date, hour + 1),
    }
  })
}

const handleEventClick = (event: Event) => {
  setDialogState({
    open: true,
    mode: 'edit',
    event,
  })
}
```

### Technologies Used

- **TanStack Form**: Formulaires type-safe avec validation
- **TanStack Query**: Mutations avec optimistic updates
- **Zod**: Validation client et serveur
- **shadcn/ui**: Dialog, Input, Button, Label

### Architectural Patterns

```typescript
// Pattern: Schémas partagés client/serveur
// src/lib/schemas/event.ts
export const createEventSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(200),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable(),
}).refine(data => data.endAt > data.startAt, {
  message: "L'heure de fin doit être après l'heure de début",
  path: ['endAt'],
})
```

## Success Criteria

- [ ] Clic sur créneau vide ouvre le formulaire de création
- [ ] Formulaire pré-rempli avec date/heure du créneau
- [ ] Titre est le seul champ obligatoire
- [ ] Sélection d'une couleur parmi 5-6 options
- [ ] Création < 15 secondes (3 clics max)
- [ ] Clic sur événement ouvre l'édition
- [ ] Bouton supprimer avec confirmation
- [ ] Optimistic update visible immédiatement
- [ ] Validation des erreurs affichée inline

## Testing & Validation

### Manual Testing Steps

1. Cliquer sur un créneau vide → formulaire s'ouvre
2. Entrer un titre et valider → événement apparaît
3. Cliquer sur l'événement → formulaire d'édition
4. Modifier le titre et valider → mise à jour visible
5. Supprimer l'événement → confirmation puis suppression
6. Tester la création sans titre → erreur affichée
7. Tester avec heure fin avant heure début → erreur affichée

### Edge Cases

- Création d'événement sur un créneau déjà occupé
- Édition pendant une autre requête en cours
- Erreur réseau pendant la création
- Suppression d'un événement qui n'existe plus

## Dependencies

**Must complete first**:
- Task 02: Database Schema (tables events)
- Task 03: Calendar View (UI pour afficher le formulaire)

**Blocks**:
- Task 07: Voice Parsing (même logique de création)

## Related Documentation

- **PRD**: Section "Gestion Manuelle des Événements"
- **ARCHI**: Section "Forms: @tanstack/react-form"

---
**Estimated Time**: 2-3 heures
**Phase**: Core Calendar
