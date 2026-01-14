# Stratégie de Pricing : VoiceCal

## Résumé Exécutif

VoiceCal adopte un modèle **freemium simple** avec une proposition de valeur claire : le calendrier est gratuit, la création vocale par IA est premium. Ce positionnement "niche minimaliste + voix" permet de se différencier des calendriers complexes (Google, Fantastical) et des outils de scheduling (Calendly, Cal.com).

À **5€/mois**, VoiceCal se positionne comme une alternative abordable aux calendriers premium (Fantastical 4.75-6.99€) tout en offrant une fonctionnalité IA unique. Le coût d'infrastructure quasi-nul (Deepgram + Gemini Flash < 0.01€/requête) garantit une marge supérieure à 90%.

L'objectif n'est pas de maximiser les revenus mais de monétiser un projet open-source personnel de façon durable et éthique.

---

## Value Metric

**Métrique sélectionnée** : Accès à la fonctionnalité vocale (feature-gating)

### Justification (7 Critères de Todd Gardner)

| Critère | Score | Explication |
|---------|-------|-------------|
| 1. Facile à comprendre | **10/10** | "Free = manuel, Premium = voix" - Aucune ambiguïté |
| 2. Perception d'équité | **9/10** | L'IA coûte de l'argent, payer pour y accéder semble juste |
| 3. Alignement concurrentiel | **8/10** | Fantastical, Reclaim, Motion utilisent tous feature-gating |
| 4. Mesurable | **10/10** | Compteur de requêtes vocales automatique |
| 5. Corrélation avec la valeur | **9/10** | Plus on utilise la voix, plus on gagne du temps |
| 6. Scalable | **8/10** | Quota mensuel évite abus, BYO API pour power users |
| 7. Revenus prévisibles | **9/10** | Abonnement mensuel fixe, pas de variabilité |

**Score total : 63/70 (90%)** — Métrique validée.

### Alternatives considérées

| Métrique | Rejetée car |
|----------|-------------|
| Par requête vocale | Imprévisible, friction à chaque utilisation |
| Par événement créé | Punit l'usage actif, incohérent avec la valeur |
| Per-seat | App individuelle, pas de multi-utilisateurs |
| Storage-based | Aucun stockage significatif (texte seulement) |

---

## Tiers de Pricing

### 🟢 Free — 0€/mois

**Cible** : Tout le monde, acquisition maximale

**Inclus** :
- Calendrier complet (création, modification, suppression)
- Vues jour/semaine/mois
- Interface moderne et responsive (PWA)
- Authentification sécurisée
- Événements illimités
- Code couleur des événements
- Open-source (auto-hébergement possible)

**Limites** :
- Pas de création vocale (ou 3 essais découverte)

**Pourquoi ce tier** :
- Base d'adoption sans friction
- Démontre la qualité du produit
- Convertit naturellement vers Premium après découverte de la voix

---

### 🔵 Premium — 5€/mois ⭐ RECOMMANDÉ

**Cible** : Utilisateurs actifs qui veulent gagner du temps

**Inclus** :
- Tout le tier Free
- **Création vocale illimitée** (~100 requêtes/mois, invisibles pour l'utilisateur)
- Priorité sur les nouvelles fonctionnalités
- Support par email

**Trigger d'upgrade** :
- Essai des 3 requêtes vocales gratuites → "J'en veux plus"
- Frustration avec la création manuelle
- Besoin d'ajouter des événements en mobilité

**Pourquoi 5€** :
- **Règle 10x** : 5€ pour économiser 10+ minutes/semaine = ROI évident
- **Psychologie** : Prix "café" perçu comme négligeable
- **Compétitif** : Moins cher que Fantastical (4.75-6.99€), Reclaim ($8+)
- **Marge** : Coût réel < 0.50€/mois/utilisateur actif → 90%+ de marge

---

### 🟡 Power User (Optionnel) — 0€ + propre clé API

**Cible** : Développeurs, utilisateurs techniques

**Inclus** :
- Tout le tier Free
- Création vocale **illimitée** avec sa propre clé API (Deepgram + Gemini)
- Aucun quota
- Aucun coût pour VoiceCal

**Comment ça marche** :
1. L'utilisateur configure ses clés API dans les paramètres
2. Les requêtes vocales utilisent directement ses clés
3. Facturation directe par Deepgram/Google

**Pourquoi ce tier** :
- Attire les contributeurs open-source
- Évite la frustration des power users
- Zéro coût pour VoiceCal

---

## Positionnement Concurrentiel

**Stratégie** : Value Pricing (prix aligné sur la valeur perçue, pas sur les coûts)

**Positionnement** : Alternative minimaliste abordable avec IA vocale unique

### Comparaison Marché

| Concurrent | Modèle | Métrique | Free | Pro | Enterprise |
|------------|--------|----------|------|-----|------------|
| Google Agenda | Freemium | - | Gratuit | - | Workspace 6€/user |
| Fantastical | Premium | Features | - | 4.75-6.99€ | - |
| Calendly | Freemium | Event types | Gratuit (1) | $10/mois | $15+ |
| Cal.com | Freemium | Teams | Gratuit | $15/user | $37/user |
| Reclaim AI | Freemium | Features | Gratuit | $8-15/mois | - |
| Motion AI | Premium | - | - | $29-34/mois | - |
| Notion Calendar | Free | - | Gratuit | - | (via Notion) |
| **VoiceCal** | **Freemium** | **Voix IA** | **Gratuit** | **5€/mois** | **BYO API** |

### Avantages Concurrentiels

| vs Concurrent | Notre avantage |
|---------------|----------------|
| Google Agenda | Interface minimaliste, création vocale native |
| Fantastical | Prix plus bas, open-source, moins de bloat |
| Calendly/Cal.com | Pas orienté scheduling, juste calendrier perso |
| Reclaim/Motion | Beaucoup moins cher, focalisé sur un seul job |
| Notion Calendar | Indépendant, pas d'écosystème requis |

---

## Justification des Prix

### Calcul de Valeur (Règle 10x de Lincoln Murphy)

**Persona : L'Oublieux Actif**

| Élément | Calcul |
|---------|--------|
| Événements créés/semaine | ~5-10 |
| Temps économisé par création vocale | ~1 minute vs 15-20s manuel = 40s économisées |
| Temps total économisé/mois | 5 événements × 4 semaines × 40s = **13 minutes/mois** |
| Valeur horaire moyenne | 15-50€/heure |
| Valeur créée/mois | 13 min × (30€/60) = **~6.50€/mois** |
| Notre prix | **5€/mois** |
| % de la valeur captée | **77%** (acceptable pour B2C self-serve) |
| ROI client | **1.3x minimum** |

*Note : La vraie valeur inclut aussi la réduction de friction mentale et l'évitement d'oublis, difficilement quantifiables mais significatifs.*

### Structure des Coûts

| Coût par utilisateur Premium actif | Montant |
|------------------------------------|---------|
| Deepgram (~30 requêtes × 10s × $0.0043/min) | ~$0.02 |
| Gemini Flash (~30 requêtes × 100 tokens) | ~$0.0003 |
| Infrastructure (Cloudflare, Neon) | ~$0.02 amortis |
| Stripe (2.9% + 0.30€) | ~$0.45 |
| **Total** | **~$0.50** |
| **Marge brute** | **90%** |

---

## Implémentation

### Phase 1 : Lancement (Mois 1-3)

- [ ] Tiers lancés : Free + Premium
- [ ] Essai gratuit : 3 requêtes vocales découverte
- [ ] Paiement : Stripe Checkout (mensuel uniquement)
- [ ] Pas de trial Premium (le free tier EST le trial)

### Phase 2 : Validation (Mois 4-6)

- [ ] Tracker : Conversion free → premium
- [ ] Tracker : Usage vocal moyen
- [ ] A/B test : 3 vs 5 requêtes découverte
- [ ] Feedback : Enquête NPS à J30

### Phase 3 : Optimisation (Mois 7-12)

- [ ] Ajouter option annuelle (2 mois gratuits = 50€/an)
- [ ] Power User tier si demandé
- [ ] Ajuster limites selon usage réel

---

## Métriques de Succès

| Métrique | Cible | Pourquoi |
|----------|-------|----------|
| Conversion page pricing → inscription | > 40% | Friction minimale |
| Conversion free → premium | 3-5% | Standard B2C freemium |
| ARPU (tous utilisateurs) | ~0.15-0.25€ | 3-5% × 5€ |
| Churn mensuel premium | < 5% | Valeur perçue suffisante |
| Usage vocal moyen | 20-50 req/mois | Bien sous les 100 req quota |

---

## FAQ Pricing

**Q: Pourquoi pas de trial Premium ?**
A: Le tier Free EST le trial. Les 3 requêtes vocales découverte suffisent à démontrer la valeur.

**Q: Pourquoi pas d'abonnement annuel au lancement ?**
A: Simplifier au maximum. Ajouter quand la rétention est prouvée.

**Q: Pourquoi pas de tier entreprise ?**
A: VoiceCal est un calendrier personnel. Pas de logique équipe/organisation.

**Q: Le quota de 100 requêtes est-il visible ?**
A: Non. C'est une limite anti-abus invisible. 99% des utilisateurs ne l'atteindront jamais.

**Q: Que se passe-t-il si quelqu'un atteint la limite ?**
A: Message soft : "Tu as beaucoup utilisé la voix ce mois ! La limite se réinitialise le [date]."

---

## Annexe : Sources Recherche Concurrentielle

- Fantastical : 4.75-6.99€/mois (flexibits.com)
- Cal.com : Gratuit individuel, $15/user teams (cal.com/pricing)
- Calendly : Gratuit (1 event), $10/mois standard (calendly.com/pricing)
- Reclaim AI : Gratuit, $8-15/mois (reclaim.ai)
- Motion AI : $29-34/mois (usemotion.com)
- Notion Calendar : Gratuit (notion.com)
- Clockwise : $6.75/user/mois (clockwise.com)

*Recherche effectuée le 14 janvier 2026*
