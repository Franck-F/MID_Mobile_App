# Marathon International de Douala — Application officielle

Monorepo de l'application mobile officielle du **Marathon International de Douala (MID)**,
organisé par TARA Sport and Events.

## Structure

```
mid-app/
├── apps/                # Applications déployables
│   ├── api/             # API NestJS (à venir Plan 2)
│   ├── tracking/        # Service temps réel Socket.io (à venir Plan 2)
│   ├── admin/           # Back-office Next.js (à venir Plan 3)
│   └── mobile/          # App React Native + Expo (à venir Plan 3)
├── packages/            # Librairies internes
│   ├── shared-types/    # Schemas Zod, enums, DTOs partagés
│   └── eslint-config/   # Configuration ESLint commune
├── infrastructure/      # IaC et déploiement
│   └── docker/          # docker-compose pour dev local
└── docs/                # Documentation
    └── superpowers/
        ├── specs/       # Specifications produit et techniques
        └── plans/       # Plans d'implémentation
```

## Prérequis

- **Node.js 22 LTS** (utiliser `nvm use` si nvm installé)
- **pnpm 9** (`npm install -g pnpm@9`)
- **Docker Desktop** (pour Postgres + Redis locaux)
- **Git**

## Démarrage rapide

```bash
# 1. Installer les dépendances
pnpm install

# 2. Démarrer Postgres + Redis en local
pnpm db:up

# 3. Copier les variables d'environnement
cp .env.example .env
# puis éditer .env avec vos clés Supabase

# 4. Lancer les vérifications
pnpm lint
pnpm typecheck
pnpm test
```

## Scripts racine

| Commande | Description |
|---|---|
| `pnpm lint` | Lint tous les packages |
| `pnpm typecheck` | Type-check TypeScript |
| `pnpm test` | Tests unitaires de tous les packages |
| `pnpm build` | Build de production |
| `pnpm dev` | Mode dev (à venir une fois les apps ajoutées) |
| `pnpm format` | Format avec Prettier |
| `pnpm format:check` | Vérifie le formatage |
| `pnpm db:up` | Démarre Postgres + Redis Docker |
| `pnpm db:down` | Arrête les services |
| `pnpm db:reset` | Reset complet (efface les données) |

## Convention de commits

Conventional Commits via `commitlint` :

```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
refactor: refactoring sans changement fonctionnel
test: ajout/modif de tests
chore: tâches diverses
ci: configuration CI
build: système de build
perf: optimisation perf
```

## Documentation produit et technique

- **Specification générale** : `docs/superpowers/specs/2026-05-27-mid-mobile-app-design.md`
- **Plans d'implémentation** : `docs/superpowers/plans/`

## Licence

Propriétaire — TARA Sport and Events. Voir `LICENSE`.
