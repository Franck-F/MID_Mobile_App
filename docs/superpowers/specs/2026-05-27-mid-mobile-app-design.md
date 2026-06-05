# Design — Application mobile officielle du Marathon International de Douala (MID)

| | |
|---|---|
| **Date** | 2026-05-27 |
| **Statut** | Brouillon — en revue |
| **Auteur** | Franck (dev solo) |
| **Commanditaire** | TARA Sport and Events (organisateur officiel du MID) |
| **Partenaires techniques** | Fédération Camerounaise d'Athlétisme (FECA) |
| **Édition cible** | MID 2027 (lancement public) · Pilote interne sur MID 2026 |
| **Type** | Application mobile multiplateforme (iOS + Android) + admin web + API |

---

## 1. Contexte

Le **Marathon International de Douala (MID)** est l'événement de course à pied phare du Cameroun, organisé annuellement par **TARA Sport and Events** avec le soutien technique de la Fédération Camerounaise d'Athlétisme. L'édition 2023 a réuni **5 000 participants** sur place et touché **10 millions de téléspectateurs**. Le MID est certifié **World Athletics Silver Label** depuis 2023.

Aujourd'hui, le dispositif numérique est limité :
- Site vitrine `mid-cm.com` (français principal)
- Inscriptions via **Google Forms**
- Chronométrage électronique en place depuis 2018 (prestataire à identifier)
- Aucune application mobile

L'objectif est de doter le MID d'une application mobile officielle de qualité internationale, qui couvre l'ensemble du parcours utilisateur : inscription, paiement, jour de course, suivi temps réel, résultats.

## 2. Stakeholders

- **TARA Sport and Events** — organisateur, commanditaire, propriétaire des données et de la marque
- **FECA** — partenaire technique, validation des aspects sportifs
- **Coureurs** — utilisateurs primaires (~5 000 / édition)
- **Spectateurs / familles** — utilisateurs secondaires importants (positionnement "Le marathon c'est mieux en famille")
- **Staff TARA & bénévoles** — utilisateurs back-office
- **Sponsors** — visibilité in-app, opérations spéciales
- **Communauté athlétisme africaine** — image et rayonnement

## 3. Objectifs et non-objectifs

### Objectifs v1 (édition 2027)

- Remplacer Google Forms par un workflow d'inscription mobile complet
- Intégrer le paiement Mobile Money (Orange Money + MTN MoMo) en production
- Fournir une expérience race-day premium (parcours interactif, dossard QR, infos pratiques, alertes)
- Restituer les résultats officiels avec certificats PDF personnalisés
- Permettre aux spectateurs de suivre leurs coureurs en temps réel et de leur envoyer des messages d'encouragement
- Supporter bilingue FR (par défaut) / EN (international)
- Fonctionner en mode dégradé hors-ligne (réseau Douala instable)

### Non-objectifs v1

- Plateforme communautaire (clubs, groupes d'entraînement, stories) → **v1.1**
- Plans d'entraînement personnalisés et coaching → **v1.1**
- Galerie photos officielles taggées par dossard → **v1.1**
- Stories type Instagram → **v1.1**
- Expo virtuelle interactive des sponsors → **v1.1**
- Langues locales (Douala, Bassa) → différé à v2

### Critères de succès mesurables

| KPI | Cible v1 (édition 2027) |
|---|---|
| % d'inscriptions via l'app | > 60 % |
| Taux de réussite paiement MoMo | > 95 % |
| Disponibilité API & tracking le race-day | > 99,5 % |
| Latence p95 API en charge | < 300 ms |
| Note moyenne stores | > 4,2 / 5 |
| Coureurs ayant consulté l'app le jour J | > 70 % |
| Spectateurs suivant ≥ 1 coureur | > 30 % |

## 4. Contraintes

- **Développement solo** — un seul développeur (Franck) sur toute la stack
- **Qualité d'abord, deadline flexible** — pas de compromis sur les fonctionnalités, calendrier ajustable
- **Projet officiel** — obligations contractuelles, juridiques et de marque envers TARA
- **Stack côté dev** — JS/TS, React Native, Node, Python connus. NestJS choisi pour cohérence TS de bout en bout.
- **Conformité Loi Cameroun n° 2010/012** sur la protection des données + **RGPD** (athlètes étrangers EU)
- **Données sensibles** — certificats médicaux, données de paiement
- **Réseau Douala** instable, surtout race-day en zone dense
- **5 000 connexions simultanées** pendant 5 h le jour J + ~15 000 spectateurs estimés

## 5. Architecture globale

### 5.1 Vue système

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Mobile RN      │   │  Admin Next.js  │   │  Site existant  │
│  (Expo)         │   │  (App Router)   │   │  mid-cm.com     │
└────────┬────────┘   └────────┬────────┘   └─────────────────┘
         │ HTTPS/WSS           │ HTTPS
         ▼                     ▼
┌──────────────────────────────────────────┐  ┌──────────────────────┐
│  API NestJS (monolithe modulaire)        │  │  Tracking Service    │
│  10 modules : auth, users, races,        │  │  Node + Socket.io    │
│  registrations, payments, results,       │◄►│  WebSocket gateway   │
│  tracking, content, notifications, admin │  │  Interpolation       │
└──────────┬───────────────────────────────┘  └──────────┬───────────┘
           │                                              │
           ▼                                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Supabase Cloud (AWS Frankfurt eu-central-1)                     │
│  ├─ Postgres (données transactionnelles)                         │
│  ├─ Auth (JWT signé RS256, OTP téléphone +237, email)            │
│  └─ Storage S3-compatible (certificats médicaux, photos)         │
├──────────────────────────────────────────────────────────────────┤
│  OVH Public Cloud (France) — VPS NestJS + Tracking + Redis +     │
│  Object Storage (sauvegardes, PDF certificats, exports)          │
└──────────────────────────────────────────────────────────────────┘
                          ▲
                          │ Cloudflare WAF / CDN
                          │
                  Intégrations externes
                  ┌───────┴────────┐
                  │ Orange MoMo    │
                  │ MTN MoMo       │
                  │ Prestataire    │
                  │   chronométrage│
                  │ FCM (push)     │
                  │ Twilio (SMS)   │
                  │ SendGrid (mail)│
                  │ Mapbox         │
                  └────────────────┘
```

### 5.2 Architecture monolithe modulaire + service dédié

Décision : **un service NestJS unique** gère toute la logique métier CRUD ; un **service Node séparé** gère uniquement le temps réel (WebSocket, GPS, interpolation, cheer). Justifications :

- Le tracking peut planter sans casser les paiements ni les inscriptions (criticité)
- Le tracking scale indépendamment le jour J (charge éphémère)
- Le tracking peut être déployé/redémarré sans toucher au reste
- Garde la simplicité opérationnelle pour un dev solo (pas de microservices à outrance)

### 5.3 Pattern Supabase = infrastructure managée (V2)

Le mobile et l'admin parlent **uniquement à NestJS et au service tracking** — jamais à Supabase directement.
- **Auth** : mobile utilise Supabase JS SDK pour OTP/email/social ; reçoit un JWT
- **API NestJS** valide le JWT via JWKS Supabase (cache 1 h)
- **Postgres** : NestJS y accède via Prisma comme une base classique ; Row Level Security désactivée (l'auth est centralisée NestJS)
- **Storage** : NestJS génère des signed URLs Supabase pour upload/download direct depuis le mobile

Bénéfices : ~3-4 semaines économisées sur l'auth, ~1 semaine sur le storage, backups et scaling Postgres managés.

### 5.4 Organisation monorepo

```
mid-app/
├── apps/
│   ├── mobile/              # React Native + Expo SDK 52+
│   ├── admin/               # Next.js 15 (App Router)
│   ├── api/                 # NestJS 11 (monolithe modulaire)
│   └── tracking/            # Node + Socket.io
├── packages/
│   ├── shared-types/        # DTOs, schemas Zod, enums
│   ├── ui-mobile/           # composants RN réutilisables (NativeWind)
│   └── ui-admin/            # composants admin (shadcn/ui)
├── infrastructure/
│   ├── terraform/           # OVH Public Cloud provisioning
│   ├── docker/              # Dockerfiles + docker-compose.dev.yml
│   └── github-actions/      # Workflows CI/CD
└── docs/
    ├── superpowers/specs/   # Specs et plans
    └── runbooks/            # Procédures opérationnelles race-day
```

**Outillage monorepo** : **Turborepo** + **pnpm workspaces**. Builds incrémentaux, cache distant via Vercel/Turbo (gratuit jusqu'à 10 GB).

## 6. Application mobile (React Native + Expo)

### 6.1 Stack technique

| Domaine | Choix |
|---|---|
| Framework | Expo SDK 52+, managed workflow, EAS Build |
| Routing | Expo Router (file-based) |
| State serveur | TanStack Query (React Query) |
| State client | Zustand |
| Formulaires | React Hook Form + Zod |
| Style | NativeWind (Tailwind pour RN) |
| i18n | i18next + react-i18next + expo-localization |
| Cartes | react-native-maps + Mapbox (offline parcours) |
| Notifications | expo-notifications + Firebase Cloud Messaging |
| Caméra / QR | expo-camera + expo-barcode-scanner |
| GPS background | expo-location avec foreground service Android |
| Stockage local | expo-sqlite + drizzle-orm |
| Auth | Supabase JS SDK (mobile uniquement) |
| HTTP client | openapi-fetch, types générés depuis OpenAPI NestJS |
| Tests | Jest + React Native Testing Library + Maestro (E2E) |

### 6.2 Inventaire des écrans (v1, ~30 écrans)

| Tab | Écrans |
|---|---|
| **Onboarding** (1ère ouverture) | Splash + hero · Choix rôle · Signup compte (3 écrans) |
| **Accueil** | Dashboard countdown / dossard / news / quick actions |
| **Ma course** | Choix catégorie · Infos perso · Paiement · Confirmation · Parcours · Infos pratiques · Checklist (7 écrans) |
| **Tracker** | Mode coureur · Mode spectateur · Carte temps réel · Cheer reçus · Envoyer cheer (5 écrans) |
| **Résultats** | Classement · Recherche · Page finisher · Téléchargement certificat (4 écrans) |
| **Profil** | Vue profil · Éditer · Mes inscriptions · Réglages · Aide · Mentions légales (6 écrans) |

Modaux transverses : erreur réseau · mode offline · paiement en attente · scan QR · notification push reçue · permission GPS.

**Pilote MID 2026** : seulement les ~12 écrans des tabs "Accueil" + "Ma course" (sans paiement), distribué via TestFlight + Internal Sharing.

### 6.3 Stratégie offline-first

- **Contenu statique** (parcours, FAQ, infos pratiques) pré-téléchargé au login, accessible sans réseau
- **Mutations** (inscription, cheer envoyé, position GPS) : queue locale SQLite → envoi différé au retour réseau
- **GPS tracking** : bufferisation locale, flush en rafale au retour réseau
- **Résultats** : derniers consultés en cache, recherche live nécessite réseau
- **Paiement** : exception, réseau obligatoire (transaction synchrone)

### 6.4 Points sensibles plateformes

- **iOS background GPS** : permission `Always`, justification soignée dans la review Apple
- **Android background GPS** : foreground service avec notification persistante pendant la course
- **Batterie** : échantillonnage 10 s en course normale, 5 s aux derniers km (compromis précision/autonomie)

## 7. API NestJS (monolithe modulaire)

### 7.1 Stack technique

| Domaine | Choix |
|---|---|
| Framework | NestJS 11 |
| ORM | Prisma sur Postgres Supabase |
| Validation | class-validator + Zod (via nestjs-zod) |
| Queues | BullMQ sur Redis |
| OpenAPI | @nestjs/swagger auto-généré |
| PDF | PDFKit (factures, certificats finisher) |
| Logs | Pino (JSON structuré) |
| Erreurs | Sentry |
| Tests | Jest + Supertest + Testcontainers Postgres |

### 7.2 Modules métier (10)

| Module | Responsabilité |
|---|---|
| `auth` | Validation JWT Supabase via JWKS, refresh, guards, décorateurs (`@CurrentUser`, `@Roles`) |
| `users` | Profils, préférences, rôles, photo, contact urgence, allergies |
| `races` | Éditions, catégories (42/21/10/kids), parcours GeoJSON, checkpoints, horaires, capacités, tarifs XAF |
| `registrations` | Workflow inscription, certificat médical, attribution dossard, T-shirt, équipes, promo codes |
| `payments` | Orange MoMo + MTN MoMo, webhooks signés, idempotency, factures, remboursements |
| `results` | Ingestion chrono, splits, classements, recherche, génération certificats PDF, partage social |
| `tracking` | Ingestion événements checkpoints (RFID), persistence positions historiques pour replay |
| `content` | News, FAQ, sponsors, infos pratiques, mentions légales — multilingue FR/EN |
| `notifications` | Orchestration FCM (push) + SMS + email, templates MJML, préférences user, DLR tracking |
| `admin` | Endpoints back-office, statistiques, exports CSV, validation certificats, override résultats |

### 7.3 Auth flow détaillé

1. Mobile → Supabase Auth (signup/login email OTP ou téléphone +237 OTP)
2. Supabase → Mobile : JWT (accessToken + refreshToken)
3. Mobile → NestJS API : `Authorization: Bearer <JWT>`
4. NestJS valide le JWT via JWKS Supabase (cache 1 h), récupère `user_id`
5. NestJS charge le profil local (sync explicite via `POST /users/me` au signup) + rôles
6. Guards (`AuthGuard`, `RolesGuard`) appliqués sur les controllers
7. Refresh géré par le mobile via Supabase SDK

### 7.4 Background jobs (BullMQ)

- Sync prestataire chrono toutes les minutes le race-day
- Génération PDF certificats finisher (batch parallélisé, 10 workers)
- Envoi batch notifications (push/SMS/email)
- Polling de secours statut paiements MoMo (30 s pendant 10 min)
- Cleanup inscriptions expirées (non payées après 24 h)
- Réconciliation comptable mensuelle (export CSV)
- Archivage partitions `PositionGPS` > 90 jours vers S3

## 8. Service de tracking temps réel

### 8.1 Stack technique

| Domaine | Choix |
|---|---|
| Runtime | Node.js |
| Transport | Socket.io (pas raw WebSocket) — reconnect auto + fallback long-polling |
| Adapter scaling | Socket.io Redis adapter (broadcast cross-instance) |
| Persistence chaud | Redis (TTL 24 h sur positions) |
| Persistence froid | Postgres `position_history` (flush async toutes les 60 s) |
| Sticky sessions | Au niveau du load balancer (nginx) |

### 8.2 Flux des données

**Source A — Puces RFID checkpoints (100 % des coureurs, obligatoire) :**
1. Coureur traverse un checkpoint
2. Prestataire chrono envoie webhook signé → `POST /tracking/checkpoint`
3. Tracking service écrit en Redis + déclenche broadcast
4. Fallback polling toutes les 30 s

**Source B — GPS smartphone (opt-in, ~10-20 %) :**
1. Coureur active "Tracker live" dans l'app
2. App envoie position GPS toutes les 10 s via WebSocket
3. Tracking service stocke en Redis + broadcast
4. Perte réseau → bufferisation SQLite → flush au retour

**Interpolation** : entre deux checkpoints, position estimée sur la polyline du parcours pondérée par le temps écoulé (algorithme custom, pas de librairie routing nécessaire).

**Broadcast spectateurs** : 1 room Socket.io par coureur. Spectateurs s'abonnent (max 5 favoris), reçoivent positions toutes les 5 s.

**Cheer** : spectateur → NestJS (persiste + rate limit 10/coureur/spectateur) → tracking service → coureur via WS + fallback push.

### 8.3 Scalabilité race-day

- **Cible** : ~20 000 connexions WS simultanées sur 5 h (5 000 coureurs + ~15 000 spectateurs)
- **3 instances** tracking service derrière nginx, sticky sessions, Socket.io Redis adapter
- **Pré-scale** 48 h avant la course, downscale 24 h après
- **Capacité par instance** : ~10 000 connexions sur VPS OVH B2-15 (4 vCPU / 15 Go)
- **Load test** k6 à 25 000 connexions avant la course (marge de sécurité)

### 8.4 Résilience

- **Backpressure** : si CPU > 80 %, refus des nouvelles connexions GPS opt-in (checkpoints prioritaires)
- **Graceful degradation** : panne tracking service → API NestJS continue, paiements/inscriptions/résultats inchangés
- **Reconnexion** : client RN bufferise les positions, flush en rafale
- **Idempotency** : tous les événements ont un `event_id` unique, dédupliqués en Redis

## 9. Modèle de données

### 9.1 Entités principales (v1)

20 entités groupées par domaine :

- **Identité** : `User`
- **Catalogue course** : `Edition`, `Race`, `Course`, `Checkpoint`, `Registration`, `MedicalCertificate`, `Payment`, `PaymentAuditLog`
- **Chrono & résultats** : `TimingEvent`, `Result`, `Certificate`
- **Temps réel** : `PositionGPS`, `Cheer`, `Subscription`
- **Contenu & ops** : `Notification`, `NewsPost`, `Sponsor`, `PromoCode`, `Team`

Le schéma détaillé champ par champ est disponible dans le diagramme visuel du brainstorming. Les migrations Prisma définitives feront foi.

### 9.2 Décisions de design transversales

1. **Multi-tenancy par édition** : chaque entité métier porte `edition_id`. Middleware NestJS filtre systématiquement par édition active. Permet plusieurs éditions en parallèle et purge facile.
2. **`PaymentAuditLog` append-only** : trigger Postgres interdit `UPDATE`/`DELETE`. Indispensable pour audit comptable et litiges.
3. **`PositionGPS` partitionnée par jour** : partitions > 90 jours archivées en CSV gzip sur S3 OVH puis supprimées.
4. **Soft delete** sur `User`, `Registration`, `MedicalCertificate` : anonymisation conservant l'intégrité des résultats officiels.
5. **Migrations versionnées** + seed reproductibles + backup automatique avant chaque migration prod.

### 9.3 Volumétrie estimée (édition 2027)

| Entité | Volumétrie |
|---|---|
| Users | ~10 000 |
| Registrations | ~5 500 |
| TimingEvents | ~30 000 |
| PositionGPS | ~2 000 000 (jour J) |
| Notifications | ~50 000 |
| Cheers | ~10 000 |

Stockage total estimé pic année 1 : **5-10 GB** (largement dans Supabase Pro).

## 10. Intégrations externes

### 10.1 Mobile Money (criticité maximale)

**Pattern d'intégration Orange/MTN (identique)** :

1. Mobile : utilisateur saisit n° MoMo + montant
2. Mobile → NestJS : `POST /payments/initiate` avec idempotency-key
3. NestJS → MoMo API : init transaction (génère `provider_tx_id`)
4. MoMo → Mobile utilisateur : SMS/USSD demande PIN
5. Utilisateur saisit PIN
6. MoMo → NestJS : webhook signé (`SUCCEEDED` / `FAILED` / `TIMEOUT`)
7. Si pas de webhook en 30 s → polling par BullMQ
8. NestJS marque `Payment.status = SUCCEEDED`, déclenche attribution dossard
9. Mobile poll `GET /payments/{id}` ou WS pour confirmation

**Pièges identifiés et mitigations** :

- Webhooks dupliqués → idempotency key obligatoire
- Webhooks en désordre → traitement par timestamp, jamais par ordre d'arrivée
- Webhook perdu → polling 30 s pendant 10 min
- Timeout utilisateur → status `EXPIRED`, déblocage du dossard
- Réconciliation : exports CSV mensuels Orange/MTN vs `PaymentAuditLog` → job manuel mensuel
- Frais opérateur 1-2 % → intégrés dans le prix affiché
- Plafonds journaliers (~500k XAF) → message clair si dépassement

**Sandboxes Orange et MTN disponibles** : développement et intégration peuvent commencer sans attendre les comptes prod.

### 10.2 Prestataire de chronométrage

L'identité du prestataire est à confirmer avec TARA. Stratégie d'absorption d'incertitude :

```typescript
interface TimingProvider {
  ingestCheckpointEvent(payload: unknown): Promise<TimingEvent>
  fetchResultsByEdition(editionId: string): Promise<Result[]>
  validateRawEvent(payload: unknown): boolean
}
```

Implémentations prévues :
- `GenericCSVProvider` (import CSV manuel — fallback toujours disponible)
- `MyLapsProvider` (si TARA utilise MyLaps)
- `RaceResultProvider` (si RaceResult)
- Autre provider custom selon réalité

L'adapter CSV est développé en premier pour garantir un mode dégradé fonctionnel quel que soit le prestataire.

### 10.3 Autres intégrations

| Intégration | Solution | Notes |
|---|---|---|
| Push | Firebase Cloud Messaging via Expo | Compte Firebase au nom de TARA |
| SMS | Twilio (international) ou opérateur local | ~50-100 XAF/SMS, budget race-day ~250k XAF |
| Email | SendGrid (Twilio Email) | DKIM + SPF + DMARC sur mid-cm.com obligatoires |
| Cartographie | Mapbox (style custom + offline) + fallback react-native-maps | Gratuit jusqu'à 50k MAU |
| Auth | Supabase Auth | Coût SMS OTP ~50-100€/mois |

### 10.4 App stores

- **Apple Developer Program** : $99/an, D-U-N-S number requis pour compte entreprise TARA
- **Google Play Console** : $25 one-time, vérification KYB d'entreprise
- **Distribution pilote 2026** : TestFlight (iOS) + Internal App Sharing (Android), 50-100 testeurs sans review store

### 10.5 Stratégie générale d'intégration

- Toutes les intégrations passent par un module NestJS dédié (jamais d'appel HTTP direct depuis le code métier)
- **Circuit breaker** opossum sur chaque intégration externe
- **Stub mode** en dev/test : `MOMO_PROVIDER=stub`, tout marche sans appel réel
- **Webhooks toujours signés HMAC**, vérifiés systématiquement
- **Métriques Prometheus** sur chaque intégration critique (latence, taux d'erreur, retry)

## 11. Sécurité et conformité

### 11.1 Sécurité technique

- **Auth** : JWT Supabase RS256, validé via JWKS, refresh tokens
- **Transport** : HTTPS partout, TLS 1.2+, HSTS, WSS pour tracking
- **CORS** strict : domaines `mid-cm.com` + apps mobiles seulement
- **Rate limiting** par IP + user (Redis sliding window) sur endpoints sensibles + WebSocket
- **WAF / DDoS** : Cloudflare gratuit devant tout
- **Secrets** : OVH Vault ou Doppler, jamais en clair, rotation tous les 6 mois
- **Webhooks** : HMAC signés + replay protection (timestamp + nonce)
- **SQL injection** : Prisma uniquement (pas de raw SQL hors migrations)
- **XSS / CSRF** : React/Next escape par défaut, admin avec same-site cookies + CSRF tokens
- **Audit log admin** : toute action (modification résultat, refund, suppression user) loguée immutable
- **Pen-test léger** avant lancement public (OWASP top 10 via ZAP + revue manuelle)

### 11.2 Conformité

**Loi camerounaise n° 2010/012 sur la protection des données** :
- Déclaration ANTIC du traitement avant mise en service
- Consentement explicite au signup (FR + EN, opt-in séparé marketing)
- Droits utilisateurs (accès, rectification, suppression, portabilité) via app + admin
- DPO désigné par TARA

**RGPD** (athlètes étrangers EU) :
- Bannière cookies admin + site web
- Privacy policy FR + EN accessible avant signup
- DPA signés avec Supabase, OVH, Mapbox, SendGrid

**Données sensibles** :
- **Certificats médicaux** : chiffrés au repos (S3 OVH SSE + OVH KMS), accès logué, suppression auto à expiration (12 mois)
- **Données paiement** : jamais de n° MoMo en clair (hash + 4 derniers digits), tokens MoMo seulement
- **Rétention** : profils utilisateurs 5 ans, résultats officiels indéfiniment (anonymisés au-delà de 5 ans)

## 12. Stratégie de tests

| Niveau | Outil | Cible |
|---|---|---|
| Unit | Jest | Logique métier, helpers, transformations |
| Intégration API | Supertest + Testcontainers Postgres | Endpoints NestJS bout en bout |
| E2E mobile | Maestro (YAML) | Parcours critiques : inscription, paiement sandbox, suivi |
| E2E admin | Playwright | Workflows back-office |
| Load testing | k6 | Tracking 25 000 WS, API 500 req/s |
| Chaos | Manuel scripté | Kill tracking pod, panne MoMo, perte réseau coureur |
| Manuel | Checklists par pilier | Race-day rehearsal complet en pré-prod |

**Couverture cible** : >70 % backend, >60 % mobile (composants critiques).

**CI bloquante** : unit + intégration + lint + typecheck sur chaque PR. E2E nightly.

## 13. Infrastructure et déploiement

### 13.1 Stack infrastructure

| Élément | Solution | Coût mensuel estimé |
|---|---|---|
| CI/CD | GitHub Actions | Gratuit |
| Mobile builds | EAS Build (Expo) | $99/mois |
| API NestJS | OVH Public Cloud B2-7 (×1 normal, ×3 race-day) | ~25-75 € |
| Tracking service | OVH Public Cloud B2-15 (×1 normal, ×3 race-day) | ~50-150 € |
| Postgres | Supabase Pro | $25 + usage |
| Redis | Upstash ou OVH Redis | ~15 € |
| S3 | OVH Object Storage | ~5 € |
| CDN / WAF | Cloudflare Free | 0 € |
| Monitoring | Sentry Team + UptimeRobot + Grafana Cloud Free | ~30 € |
| DNS | OVH | inclus |
| Email | SendGrid Essentials | ~20 € |
| SMS | Twilio ou local | variable, ~380 € le mois de course |
| Supabase SMS OTP | inclus | ~50-100 € |
| Apple Developer | $99/an | ~8 € |
| Google Play | $25 one-time | négligeable |
| Mapbox | Free tier | 0 € |
| **TOTAL** | | **~280-350 €/mois** en croisière, **~700-800 €/mois** le mois de la course |

### 13.2 Pipeline de déploiement

- **Mobile** : EAS Build → upload TestFlight + Play Internal Track → promotion manuelle vers prod après QA
- **Backend** : GitHub Actions build Docker images → push registry OVH → deploy via SSH ou manifests Kubernetes
- **Migrations DB** : Prisma à chaque déploiement, revue manuelle obligatoire
- **Rollback** : tag git précédent + revert deploy + migration `down` si schema (rare)

### 13.3 Backups et sovereignty

- Supabase backups automatiques quotidiens (managed)
- `pg_dump` cron quotidien supplémentaire vers S3 OVH France (souveraineté)
- Rétention 30 jours rolling + 1 snapshot mensuel sur 12 mois
- Test de restauration trimestriel

## 14. Plan de livraison

### Phase 0 — Fondations (Juin → Août 2026, 3 mois)

Monorepo Turborepo. CI/CD GitHub Actions. NestJS + Prisma + Supabase setup. Mobile RN squelette navigation. Admin Next.js squelette. OVH infrastructure Terraform. **En parallèle** : TARA démarre les démarches comptes marchands MoMo + comptes Apple/Google.

### Phase 1 — Pilote MID 2026 (Septembre → Octobre 2026, 2 mois) 🎯

Pilier 2 uniquement : race-day info + dossard QR + parcours interactif. ~12 écrans. Auth Supabase basique. Pas de paiement, pas de live tracking. Distribué à 50-100 testeurs TARA + ambassadeurs via TestFlight + Internal Sharing. **Objectif** : retours terrain réels sur l'édition 2026 (réseau Douala, comportements coureurs, ergonomie race-day).

### Phase 2 — Inscription + paiement (Novembre 2026 → Février 2027, 4 mois)

Pilier 1 complet. Workflow inscription. Upload certificat médical. Paiement Orange Money + MTN MoMo (sandbox d'abord, prod dès comptes activés). Attribution dossard. Factures PDF. Admin TARA pour valider les inscriptions et les certificats.

### Phase 3 — Résultats + certificats (Mars → Mai 2027, 3 mois)

Pilier 3 complet. Adapter prestataire chrono identifié + adapter CSV fallback. Classements multi-filtres (catégorie, sexe, âge, club). Génération PDF certificats finisher. Partage social (image card).

### Phase 4 — Live tracking + cheer (Juin → Août 2027, 3 mois)

Pilier 4 complet. Service tracking dédié WebSocket. GPS opt-in coureurs. Suivi spectateurs (max 5 favoris). Cheer feed. **Load tests k6 à 25 000 connexions**. Chaos testing race-day. Finalisation soumissions stores (review Apple/Google).

### Phase 5 — Lancement public MID 2027 (Septembre → Octobre 2027, 2 mois) 🚀

Beta fermée 500 utilisateurs (semaines 1-3). Ouverture publique inscription (semaine 4). Monitoring intensif. Plan d'astreinte race-day. Post-mortem documenté.

### v1.1 et au-delà (Post-2027)

Community hub. Plans d'entraînement. Stats lifetime. Galerie photos officielles taggées par dossard. Expo virtuelle sponsors. Stories.

## 15. Risques et mitigations

| # | Risque | Impact | Mitigation |
|---|---|---|---|
| R1 | KYC Mobile Money plus long que prévu (> 8 sem) | Bloque pilier 1 | Ship en sandbox démo en mars, prod en avril |
| R2 | Prestataire chrono sans API ouverte | Bloque pilier 3 | Bascule sur CSV manuel pour v1, négociation API en parallèle pour v1.1 |
| R3 | Review Apple rejette background GPS | Bloque GPS opt-in iOS | Refaire justification ou désactiver GPS opt-in iOS en v1 |
| R4 | Load test révèle goulet < 15k connexions | Coûts opérationnels | Monter à 5 instances tracking au lieu de 3 (+250€ ponctuels race-day) |
| R5 | Bug critique découvert en beta fermée | Délai 2-3 sem | Absorbable, marge dans Phase 5 |
| R6 | Hospitalisation / indisponibilité dev solo | Projet stoppé | TARA prévoit clause de transmission code + documentation continue |
| R7 | Données Supabase chez AWS Frankfurt non acceptées par TARA | Re-design archi | Pivot vers Supabase self-hosted OVH (perte 4-6 sem) |

## 16. Questions à confirmer avec TARA

À couvrir lors d'une réunion de cadrage avant le démarrage de la Phase 0 :

1. **Édition cible confirmée** : MID 2027 pour le lancement public, MID 2026 pour le pilote ?
2. **Date exacte du MID 2026 et MID 2027** (le site web n'est plus à jour)
3. **Prestataire de chronométrage** : identité, API disponible, format d'export, contact technique
4. **Comptes marchands Mobile Money** : Orange Money + MTN MoMo existants ou à créer (KYC 4-6 semaines)
5. **Compte développeur Apple** au nom de TARA Sport and Events (D-U-N-S number)
6. **Compte Google Play Console** au nom de TARA (vérification KYB)
7. **Validation hébergement données chez AWS Frankfurt** via Supabase (alternative : Supabase self-hosted OVH)
8. **DPO désigné** par TARA pour conformité Loi 2010/012 + RGPD
9. **Accès à la marque** : logos officiels HD, charte graphique, polices, photos
10. **Base de données historique** des résultats des éditions passées (pour seed et tests réalistes)
11. **Budget infrastructure** annuel prévu (~3 500-4 500 €/an + pic race-day)
12. **Plan d'astreinte race-day** : qui contacte qui en cas d'incident le jour J
13. **Stratégie de communication du lancement** : annonce officielle, push presse, sponsors
14. **Clause de transmission** : que se passe-t-il si le dev solo devient indisponible

## 17. Annexes

### 17.1 Glossaire

- **MID** : Marathon International de Douala
- **TARA** : TARA Sport and Events, organisateur officiel
- **FECA** : Fédération Camerounaise d'Athlétisme
- **MoMo** : Mobile Money (Orange Money, MTN MoMo)
- **XAF / FCFA** : Franc CFA Cameroun, monnaie du paiement
- **ANTIC** : Agence Nationale des TIC du Cameroun
- **D-U-N-S** : identifiant entreprise requis par Apple
- **JWKS** : JSON Web Key Set (clés publiques Supabase)
- **DLR** : Delivery Receipt (accusé livraison SMS)

### 17.2 Références

- Site officiel MID : https://mid-cm.com/
- Loi camerounaise n° 2010/012 sur la protection des données
- World Athletics Silver Label : exigences de mesure et chronométrage
- Documentation Orange Money Cameroun : https://developer.orange.com/apis/
- Documentation MTN MoMo : https://momodeveloper.mtn.com/
- Documentation Supabase : https://supabase.com/docs
- Documentation Expo : https://docs.expo.dev/
- Documentation NestJS : https://docs.nestjs.com/
