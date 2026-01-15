# Task 08: Setup Stripe Complet

## Context

L'ARCHI définit un modèle freemium avec abonnement Premium à 5€/mois. Stripe gère le checkout, les webhooks, et le customer portal. La fonctionnalité vocale est réservée aux utilisateurs Premium (ou 3 essais pour free).

## Scope

- Configuration produits/prix Stripe
- Page checkout avec redirection Stripe
- Webhooks pour sync statut abonnement
- Customer portal pour gestion self-service
- Page billing dans l'app
- Gating de la fonctionnalité vocale

## Implementation Details

### Files to Create/Modify

- `src/lib/stripe/client.ts` - Client Stripe
- `src/lib/stripe/webhooks.ts` - Handlers webhooks
- `src/routes/api/stripe/create-checkout.ts` - Création session checkout
- `src/routes/api/stripe/create-portal.ts` - Création session portal
- `src/routes/api/stripe/webhook.ts` - Endpoint webhook
- `src/routes/app/billing.tsx` - Page gestion abonnement
- `src/features/billing/pricing-card.tsx` - Card upgrade
- `src/features/billing/upgrade-modal.tsx` - Modal upgrade (quota atteint)
- `src/env.ts` - Variables Stripe

### Key Functionality

1. **Configuration Stripe**
```typescript
// src/lib/stripe/client.ts
import Stripe from 'stripe'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

// Prix configurés dans Stripe Dashboard
export const PRICES = {
  premium: 'price_xxxxx', // 5€/mois
}
```

2. **Création checkout session**
```typescript
// src/routes/api/stripe/create-checkout.ts
export const createCheckoutAction = createServerFn('POST', async () => {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  // Récupérer ou créer customer
  let customerId = await getStripeCustomerId(session.user.id)
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: { userId: session.user.id },
    })
    customerId = customer.id
    await saveStripeCustomerId(session.user.id, customerId)
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: PRICES.premium, quantity: 1 }],
    success_url: `${env.APP_URL}/app/billing?success=true`,
    cancel_url: `${env.APP_URL}/app/billing?canceled=true`,
    subscription_data: {
      metadata: { userId: session.user.id },
    },
  })

  return { url: checkoutSession.url }
})
```

3. **Webhooks handlers**
```typescript
// src/routes/api/stripe/webhook.ts
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/stripe/webhook')({
  POST: async ({ request }) => {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')!

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      return new Response('Webhook signature invalid', { status: 400 })
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
    }

    return new Response('OK', { status: 200 })
  }
})
```

4. **Handlers spécifiques**
```typescript
// src/lib/stripe/webhooks.ts
export async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.subscription_data?.metadata?.userId
  if (!userId) return

  await db.update(userSubscriptions)
    .set({
      stripeSubscriptionId: session.subscription as string,
      plan: 'premium',
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.userId, userId))
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId
  if (!userId) return

  await db.update(userSubscriptions)
    .set({
      stripeSubscriptionId: null,
      plan: 'free',
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.userId, userId))
}
```

5. **Page Billing**
```tsx
// src/routes/app/billing.tsx
export function BillingPage() {
  const { subscription } = useLoaderData()

  const handleUpgrade = async () => {
    const { url } = await createCheckoutAction()
    window.location.href = url
  }

  const handleManage = async () => {
    const { url } = await createPortalAction()
    window.location.href = url
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1>Abonnement</h1>

      {subscription.plan === 'premium' ? (
        <Card>
          <CardHeader>
            <CardTitle>Premium</CardTitle>
            <Badge>Actif</Badge>
          </CardHeader>
          <CardContent>
            <p>100 créations vocales / mois</p>
            <p>Utilisées: {subscription.voiceUsageCount}/100</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleManage}>Gérer l'abonnement</Button>
          </CardFooter>
        </Card>
      ) : (
        <PricingCard onUpgrade={handleUpgrade} />
      )}
    </div>
  )
}
```

6. **Modal Upgrade (quota atteint)**
```tsx
// src/features/billing/upgrade-modal.tsx
export function UpgradeModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Passez à Premium</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Vous avez atteint la limite de créations vocales gratuites.</p>
          <ul className="space-y-2">
            <li>✓ 100 créations vocales / mois</li>
            <li>✓ Accès prioritaire aux nouvelles features</li>
          </ul>
          <p className="text-2xl font-bold">5€ / mois</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Plus tard</Button>
          <Button onClick={handleUpgrade} className="bg-gradient-brand">
            Passer à Premium
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Technologies Used

- **Stripe SDK**: Checkout, Webhooks, Customer Portal
- **Stripe Checkout**: UI de paiement hosted
- **Crypto (Node)**: Vérification signature webhook

### Architectural Patterns

```typescript
// Pattern: Vérification plan avant feature
export async function requirePremium(userId: string) {
  const sub = await db.query.userSubscriptions.findFirst({
    where: eq(userSubscriptions.userId, userId)
  })

  if (sub?.plan !== 'premium') {
    throw new PremiumRequiredError()
  }
}

// Pattern: Feature gating côté client
function VoiceButton() {
  const { subscription } = useUser()

  if (subscription.plan === 'free' && subscription.voiceUsageCount >= 3) {
    return <UpgradeButton />
  }

  return <RecordButton />
}
```

## Success Criteria

- [ ] Produit/prix configuré dans Stripe Dashboard
- [ ] Bouton upgrade redirige vers Stripe Checkout
- [ ] Paiement réussi → plan = 'premium' en DB
- [ ] Customer portal accessible pour gérer l'abo
- [ ] Annulation → plan = 'free' en DB
- [ ] Page billing affiche le statut correct
- [ ] Modal upgrade s'affiche quand quota atteint
- [ ] Webhook signature vérifiée

## Testing & Validation

### Manual Testing Steps

1. Configurer les variables Stripe (test mode)
2. Aller sur /app/billing
3. Cliquer "Passer à Premium"
4. Utiliser la carte test 4242...
5. Vérifier le retour vers l'app
6. Vérifier plan = 'premium' en DB
7. Accéder au customer portal
8. Annuler l'abonnement
9. Vérifier plan = 'free' en DB

### Edge Cases

- Paiement échoué
- Webhook arrivé avant redirect
- Double soumission checkout
- Subscription update partiel

## Dependencies

**Must complete first**:
- Task 02: Database Schema (user_subscriptions)
- Task 06: Voice Transcription (quota check)

**Blocks**:
- Aucun

## Related Documentation

- **PRD**: Modèle freemium implicite
- **ARCHI**: Section "Payments Integration"
- **Stripe Docs**: https://stripe.com/docs

---
**Estimated Time**: 3 heures
**Phase**: Monetization
