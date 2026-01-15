# Task 10: Emails Transactionnels avec Resend

## Context

L'ARCHI spécifie Resend pour les emails transactionnels: Magic link (auth), Welcome email (onboarding), et Payment failed (rétention). Approche: React Email pour les templates.

## Scope

- Configuration client Resend
- Template Magic Link (priorité auth)
- Template Welcome email
- Template Payment Failed
- Intégration avec Neon Auth pour magic link
- Intégration avec Stripe webhooks pour payment failed

## Implementation Details

### Files to Create/Modify

- `src/lib/email/resend.ts` - Client Resend
- `src/lib/email/templates/magic-link.tsx` - Template magic link
- `src/lib/email/templates/welcome.tsx` - Template welcome
- `src/lib/email/templates/payment-failed.tsx` - Template payment failed
- `src/lib/email/send.ts` - Fonctions d'envoi
- `src/env.ts` - Ajouter RESEND_API_KEY

### Key Functionality

1. **Client Resend**
```typescript
// src/lib/email/resend.ts
import { Resend } from 'resend'

export const resend = new Resend(env.RESEND_API_KEY)

export const EMAIL_FROM = 'SayCal <noreply@saycal.app>'
```

2. **Template Magic Link**
```tsx
// src/lib/email/templates/magic-link.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface MagicLinkEmailProps {
  magicLink: string
}

export function MagicLinkEmail({ magicLink }: MagicLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre lien de connexion SayCal</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.title}>🗓️ SayCal</Text>
          <Text style={styles.text}>
            Cliquez sur le bouton ci-dessous pour vous connecter à SayCal.
          </Text>
          <Section style={styles.buttonContainer}>
            <Button style={styles.button} href={magicLink}>
              Se connecter
            </Button>
          </Section>
          <Text style={styles.footer}>
            Ce lien expire dans 15 minutes. Si vous n'avez pas demandé ce lien,
            ignorez cet email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    padding: '40px',
    borderRadius: '12px',
    maxWidth: '480px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    color: '#B552D9',
  },
  text: {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#1A1A2E',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },
  button: {
    backgroundColor: '#B552D9',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    padding: '12px 24px',
  },
  footer: {
    fontSize: '14px',
    color: '#6B7280',
    textAlign: 'center' as const,
  },
}
```

3. **Template Welcome**
```tsx
// src/lib/email/templates/welcome.tsx
export function WelcomeEmail({ userName }: { userName?: string }) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenue sur SayCal !</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.title}>🎉 Bienvenue sur SayCal !</Text>
          <Text style={styles.text}>
            {userName ? `Bonjour ${userName},` : 'Bonjour,'}
          </Text>
          <Text style={styles.text}>
            Vous pouvez maintenant créer vos événements en les dictant simplement.
            Plus besoin de taper, parlez et c'est noté !
          </Text>
          <Section style={styles.tips}>
            <Text style={styles.tipTitle}>💡 Pour commencer</Text>
            <Text style={styles.tip}>• Cliquez sur le bouton micro</Text>
            <Text style={styles.tip}>• Dites "Dentiste demain 14h"</Text>
            <Text style={styles.tip}>• L'événement est créé automatiquement</Text>
          </Section>
          <Section style={styles.buttonContainer}>
            <Button style={styles.button} href="https://saycal.app/app">
              Ouvrir SayCal
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
```

4. **Template Payment Failed**
```tsx
// src/lib/email/templates/payment-failed.tsx
export function PaymentFailedEmail() {
  return (
    <Html>
      <Head />
      <Preview>Action requise : paiement échoué</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.title}>⚠️ Paiement échoué</Text>
          <Text style={styles.text}>
            Nous n'avons pas pu renouveler votre abonnement SayCal Premium.
          </Text>
          <Text style={styles.text}>
            Pour continuer à profiter de la création vocale illimitée,
            veuillez mettre à jour vos informations de paiement.
          </Text>
          <Section style={styles.buttonContainer}>
            <Button style={styles.button} href="https://saycal.app/app/billing">
              Mettre à jour le paiement
            </Button>
          </Section>
          <Text style={styles.footer}>
            Sans action de votre part, votre abonnement sera suspendu dans 7 jours.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

5. **Fonctions d'envoi**
```typescript
// src/lib/email/send.ts
import { resend, EMAIL_FROM } from './resend'
import { MagicLinkEmail } from './templates/magic-link'
import { WelcomeEmail } from './templates/welcome'
import { PaymentFailedEmail } from './templates/payment-failed'

export async function sendMagicLink(to: string, magicLink: string) {
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: 'Votre lien de connexion SayCal',
    react: MagicLinkEmail({ magicLink }),
  })

  if (error) {
    console.error('Failed to send magic link:', error)
    throw new Error('Failed to send email')
  }
}

export async function sendWelcomeEmail(to: string, userName?: string) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: 'Bienvenue sur SayCal ! 🗓️',
    react: WelcomeEmail({ userName }),
  })
}

export async function sendPaymentFailedEmail(to: string) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: 'Action requise : problème de paiement SayCal',
    react: PaymentFailedEmail(),
  })
}
```

6. **Intégration avec Stripe webhook**
```typescript
// Dans src/lib/stripe/webhooks.ts
export async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const customer = await stripe.customers.retrieve(customerId)

  if (!customer.deleted && customer.email) {
    await sendPaymentFailedEmail(customer.email)
  }
}
```

### Technologies Used

- **Resend**: API d'envoi d'emails
- **React Email**: Templates React pour emails
- **Neon Auth**: Intégration magic link (si supporté)

### Architectural Patterns

```typescript
// Pattern: Retry avec exponential backoff
async function sendEmailWithRetry(
  sendFn: () => Promise<void>,
  retries = 3
) {
  for (let i = 0; i < retries; i++) {
    try {
      await sendFn()
      return
    } catch (error) {
      if (i === retries - 1) throw error
      await sleep(1000 * Math.pow(2, i))
    }
  }
}

// Pattern: Queue pour emails non-critiques
// Welcome emails peuvent être envoyés async sans bloquer
export async function queueWelcomeEmail(to: string, userName?: string) {
  // Dans le futur: utiliser une queue (Cloudflare Queues)
  // Pour MVP: envoi direct async
  sendWelcomeEmail(to, userName).catch(console.error)
}
```

## Success Criteria

- [ ] Magic link email envoyé et formaté correctement
- [ ] Lien cliquable et fonctionnel
- [ ] Welcome email envoyé après inscription
- [ ] Payment failed email envoyé via webhook Stripe
- [ ] Emails affichés correctement sur mobile
- [ ] Pas de spam score élevé (SPF/DKIM configurés)
- [ ] Variables d'environnement configurées

## Testing & Validation

### Manual Testing Steps

1. Configurer RESEND_API_KEY
2. Demander un magic link
3. Vérifier l'email reçu (inbox ou spam)
4. Cliquer le lien → connexion
5. Créer un compte → vérifier welcome email
6. Simuler payment_failed via Stripe CLI
7. Vérifier l'email de paiement échoué
8. Tester sur différents clients mail (Gmail, Apple Mail)

### Edge Cases

- Email invalide
- Rate limiting Resend
- Template avec caractères spéciaux
- Lien magic expiré

## Dependencies

**Must complete first**:
- Task 01: Neon Auth (magic link flow)
- Task 08: Stripe Setup (webhook payment_failed)

**Blocks**:
- Aucun

## Related Documentation

- **ARCHI**: Section "Additional Services - Email: Resend"
- **Resend Docs**: https://resend.com/docs
- **React Email**: https://react.email/docs

---
**Estimated Time**: 2 heures
**Phase**: Polish
