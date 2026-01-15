# Product Requirements Document: SayCal

## Product Vision

**Problem Statement**
Les calendriers existants sont soit trop complexes (trop de réglages, trop "enterprise"), soit trop simplistes et peu pratiques. Ajouter ou modifier un rendez-vous devient plus pénible que nécessaire, surtout sur mobile. Les utilisateurs qui oublient facilement ont besoin d'un outil rapide et agréable, pas d'une usine à gaz.

**Solution**
Un calendrier minimal mais premium, centré sur l'action. La création d'événements se fait en un clic via commande vocale : tu parles, l'app comprend, l'événement est créé automatiquement. Interface moderne, propre, sans surcharge d'options. Open-source pour la transparence, SaaS pour la simplicité.

**Success Criteria**
- Nombre d'événements créés par semaine (indicateur d'adoption)
- Nombre d'utilisateurs actifs hebdomadaires (WAU)
- Taux de rétention à 7 jours > 40%

## Target Users

### Primary Persona: L'Oublieux Actif
- **Role**: Toute personne (étudiant, actif, freelance, parent) qui gère sa vie perso/pro et oublie facilement ses rendez-vous
- **Pain Points**:
  - Oublie régulièrement ses rendez-vous et tâches
  - Trouve Google Agenda et autres apps pénibles à utiliser
  - Frustré par les interfaces complexes avec trop d'options
  - Perd du temps à naviguer dans des menus pour ajouter un simple événement
- **Motivations**: Avoir un outil qui ne demande aucun effort mental, juste parler et c'est fait
- **Goals**: Ne plus oublier ses rendez-vous, ajouter un événement en moins de 5 secondes

### Secondary Persona: L'Indépendant Minimaliste
- **Role**: Freelance ou petite structure qui veut un calendrier perso efficace sans logique d'équipe
- **Pain Points**: Outils pro trop lourds, veut rester simple
- **Motivations**: Productivité sans friction, esthétique professionnelle

## Core Features (MVP)

### Must-Have Features

#### 1. Création Vocale Ultra-Rapide
**Description**: En un clic sur un bouton micro, l'utilisateur dicte son événement en langage naturel ("Dentiste demain à 14h", "Réunion lundi prochain 10h-11h30"). L'app analyse la phrase, extrait date/heure/durée/titre, et crée l'événement automatiquement.
**User Value**: Ajouter un rendez-vous en moins de 5 secondes, sans taper ni naviguer dans des menus
**Success Metric**: > 50% des événements créés via la voix après 1 semaine d'usage

#### 2. Interface Calendrier Minimale & Premium
**Description**: Vue calendrier claire avec navigation jour/semaine/mois. Design épuré, moderne, sans encombrement visuel. Les événements sont visibles d'un coup d'œil avec code couleur simple.
**User Value**: Voir son planning instantanément, interface agréable qui donne envie d'être utilisée
**Success Metric**: Temps moyen pour trouver un événement < 3 secondes

#### 3. Gestion Manuelle des Événements
**Description**: Création, modification et suppression d'événements via formulaire simple. Champs essentiels uniquement : titre, date, heure début/fin, couleur optionnelle. Pas de champs superflus.
**User Value**: Alternative à la voix quand nécessaire, sans friction
**Success Metric**: Création manuelle < 15 secondes

#### 4. Expérience Multi-Plateforme
**Description**: Application web responsive, parfaitement utilisable sur mobile et desktop. Même expérience fluide sur tous les appareils.
**User Value**: Accéder à son calendrier partout, sur n'importe quel appareil
**Success Metric**: Taux de rebond mobile < 30%

#### 5. Authentification Simple
**Description**: Inscription/connexion via Neon Auth. Un compte = un calendrier personnel. Pas de gestion d'équipe ou d'organisation.
**User Value**: Démarrer en 30 secondes, données sécurisées
**Success Metric**: Taux de conversion inscription > 60%

### Should-Have Features (Post-MVP)
- **Notifications push**: Rappels avant les événements (Web Push API)
- **Récurrence**: Événements répétitifs (quotidien, hebdomadaire, mensuel)
- **Synchronisation Google Agenda**: Import/export bidirectionnel
- **Partage de calendrier**: Partager un lien de vue lecture seule
- **Thèmes**: Mode sombre / clair, personnalisation couleurs

## User Flows

### Primary User Journey: Création Vocale
1. L'utilisateur ouvre l'app et voit son calendrier
2. Il clique sur le bouton micro (toujours visible)
3. Il dicte : "Cours de sport jeudi 18h"
4. L'app affiche la prévisualisation : "Jeudi 16 Jan, 18:00 - 19:00, Cours de sport"
5. L'utilisateur confirme d'un tap ou l'app auto-confirme après 2s
6. L'événement apparaît sur le calendrier

### Secondary User Journey: Création Manuelle
1. L'utilisateur clique sur un créneau vide du calendrier
2. Un formulaire minimal s'ouvre (titre, heure fin, couleur)
3. Il remplit et valide
4. L'événement est créé

## Out of Scope (v1)

Explicitement NON inclus dans le MVP :
- **Synchronisation Google Agenda / Apple Calendar**: Pas d'import/export externe
- **Partage de calendrier**: Pas de collaboration ou lien de partage
- **Récurrence d'événements**: Pas d'événements répétitifs
- **Notifications push**: Pas de rappels automatiques
- **Gestion d'équipe / multi-utilisateurs**: Un compte = un calendrier, pas de logique organisation
- **Intégrations tierces**: Pas de connexion Slack, Notion, etc.
- **Calendriers multiples**: Un seul calendrier par compte
- **Pièces jointes / notes longues**: Titre simple uniquement

## Open Questions
- Quel modèle d'IA utiliser pour le parsing vocal ? (Whisper + LLM pour extraction ?)
- Faut-il une confirmation explicite après création vocale ou auto-save ?
- Quelle granularité de couleurs pour les événements ? (3-5 couleurs fixes ou palette libre ?)

## Success Metrics

**Primary Metrics**:
- **Événements créés / semaine / utilisateur**: Cible > 5 événements
- **Utilisateurs actifs hebdomadaires (WAU)**: Croissance semaine après semaine
- **Taux d'usage création vocale**: > 50% des créations via voix

**Secondary Metrics**:
- **Rétention J7**: > 40% des inscrits reviennent après 7 jours
- **Temps de création d'événement**: < 10 secondes (voix), < 20 secondes (manuel)
- **NPS (Net Promoter Score)**: > 40

## Technical Context

**Stack décidée**:
- Frontend: TanStack Start
- Database: Neon (PostgreSQL) + Drizzle ORM
- Auth: Neon Auth
- UI: shadcn/ui
- Modèle: Open-source + SaaS hébergé

## Timeline & Milestones
- **MVP Completion**: ~3-5 jours
- **First User Testing**: Immédiatement après MVP
- **Public Launch**: Après validation des premiers retours
