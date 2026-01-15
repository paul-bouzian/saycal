# Task 02: Database Schema Events & Subscriptions

## Context

Le PRD nécessite un calendrier avec des événements. L'ARCHI définit un schema avec `events` et `user_subscriptions` pour gérer les quotas de création vocale et les abonnements Stripe.

**Important**: Les utilisateurs sont gérés par Neon Auth dans le schema `neon_auth.user`. Nos tables (`events`, `user_subscriptions`) référencent `neon_auth.user.id` via foreign key.

## Scope

- Créer le schema Drizzle complet (events, user_subscriptions)
- Référencer correctement `neon_auth.user` pour les foreign keys
- Configurer les indexes pour les requêtes performantes
- Générer et appliquer les migrations
- Créer les types TypeScript exportés

## Implementation Details

### Files to Create/Modify

- `src/db/schema.ts` - Schema complet Drizzle
- `src/db/index.ts` - Client DB avec types
- `db/migrations/` - Migrations générées

### Key Functionality

1. **Référence à la table Neon Auth**

La table `neon_auth.user` est créée automatiquement par Neon Auth. Pour créer des foreign keys, on doit la référencer:

```typescript
// src/db/schema.ts
import { pgTable, pgSchema, uuid, varchar, timestamp, integer, index, text } from 'drizzle-orm/pg-core'

// Référence au schema neon_auth (géré par Neon Auth)
const neonAuthSchema = pgSchema('neon_auth')

// Table user gérée par Neon Auth - on la déclare pour les relations
export const neonAuthUser = neonAuthSchema.table('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  emailVerified: timestamp('emailVerified'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt'),
})
```

2. **Schema Events**
```typescript
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => neonAuthUser.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  color: varchar('color', { length: 7 }), // hex color, ex: #B552D9
  createdVia: varchar('created_via', { length: 10 }).notNull().default('manual'), // 'voice' | 'manual'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userStartIdx: index('events_user_start_idx').on(table.userId, table.startAt),
}))
```

3. **Schema User Subscriptions**
```typescript
export const userSubscriptions = pgTable('user_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => neonAuthUser.id, { onDelete: 'cascade' }).unique(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  plan: varchar('plan', { length: 20 }).notNull().default('free'), // 'free' | 'premium'
  voiceUsageMonth: varchar('voice_usage_month', { length: 7 }), // '2026-01'
  voiceUsageCount: integer('voice_usage_count').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('user_subscriptions_user_idx').on(table.userId),
}))
```

4. **Relations Drizzle**
```typescript
import { relations } from 'drizzle-orm'

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(neonAuthUser, {
    fields: [events.userId],
    references: [neonAuthUser.id],
  }),
}))

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(neonAuthUser, {
    fields: [userSubscriptions.userId],
    references: [neonAuthUser.id],
  }),
}))
```

5. **Types exportés**
```typescript
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type UserSubscription = typeof userSubscriptions.$inferSelect
```

6. **Créer la subscription au premier login**

Quand un utilisateur se connecte pour la première fois, créer sa subscription:

```typescript
// src/lib/subscription.ts
export async function ensureUserSubscription(userId: string) {
  const existing = await db.query.userSubscriptions.findFirst({
    where: eq(userSubscriptions.userId, userId)
  })

  if (!existing) {
    await db.insert(userSubscriptions).values({
      userId,
      plan: 'free',
      voiceUsageCount: 0,
    })
  }

  return existing ?? await db.query.userSubscriptions.findFirst({
    where: eq(userSubscriptions.userId, userId)
  })
}
```

### Technologies Used

- **Drizzle ORM**: Schema type-safe, migrations
- **Neon PostgreSQL**: Base de données serverless
- **Zod**: Schémas de validation partagés

### Architectural Patterns

```typescript
// Pattern: Schémas Zod alignés avec Drizzle
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const insertEventSchema = createInsertSchema(events, {
  title: z.string().min(1).max(200),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

export const selectEventSchema = createSelectSchema(events)
```

## Success Criteria

- [ ] Schema events créé avec tous les champs
- [ ] Schema user_subscriptions créé avec quota tracking
- [ ] Indexes créés pour les requêtes performantes
- [ ] Migration générée et appliquée à Neon
- [ ] Types TypeScript exportés et utilisables
- [ ] Schémas Zod créés pour validation
- [ ] Drizzle Studio fonctionne (`bun run db:studio`)

## Testing & Validation

### Manual Testing Steps

1. Exécuter `bun run db:generate` - doit générer une migration
2. Exécuter `bun run db:push` - doit appliquer le schema
3. Ouvrir Drizzle Studio (`bun run db:studio`)
4. Vérifier que les tables `events` et `user_subscriptions` existent
5. Insérer un event de test manuellement
6. Vérifier les indexes avec une requête SQL

### Edge Cases

- Migration sur base existante avec données
- Suppression d'un user (cascade sur events)
- Timestamps avec timezone

## Dependencies

**Must complete first**:
- Task 01: Neon Auth (pour la table users gérée par Neon Auth)

**Blocks**:
- Task 03: Calendar View (besoin du schema events)
- Task 04: Event CRUD (besoin du schema events)
- Task 08: Stripe Setup (besoin du schema user_subscriptions)

## Related Documentation

- **PRD**: Section "Core Features"
- **ARCHI**: Section "Database & Data Layer"
- **Drizzle Docs**: https://orm.drizzle.team/docs/overview

---
**Estimated Time**: 1-2 heures
**Phase**: Foundation
