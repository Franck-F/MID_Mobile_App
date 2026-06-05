# Graph Report - .  (2026-06-05)

## Corpus Check
- Corpus is ~20,680 words - fits in a single context window. You may not need a graph.

## Summary
- 413 nodes · 423 edges · 37 communities (26 shown, 11 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.82)
- Token cost: 163,267 input · 40,818 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Architecture, Plans & CI|Architecture, Plans & CI]]
- [[_COMMUNITY_Base TypeScript Compiler Options|Base TypeScript Compiler Options]]
- [[_COMMUNITY_Root Package Scripts|Root Package Scripts]]
- [[_COMMUNITY_API TypeScript Config|API TypeScript Config]]
- [[_COMMUNITY_NestJS API Modules|NestJS API Modules]]
- [[_COMMUNITY_API Runtime Dependencies|API Runtime Dependencies]]
- [[_COMMUNITY_Shared-Types Package Config|Shared-Types Package Config]]
- [[_COMMUNITY_API Package Scripts (Prisma)|API Package Scripts (Prisma)]]
- [[_COMMUNITY_Domain Model & Shared Types|Domain Model & Shared Types]]
- [[_COMMUNITY_Turborepo Task Pipeline|Turborepo Task Pipeline]]
- [[_COMMUNITY_API Dev Dependencies|API Dev Dependencies]]
- [[_COMMUNITY_ESLint Config Package|ESLint Config Package]]
- [[_COMMUNITY_Git Hooks & Build Tooling|Git Hooks & Build Tooling]]
- [[_COMMUNITY_NestJS Bootstrap & Wiring|NestJS Bootstrap & Wiring]]
- [[_COMMUNITY_API ESLint TSConfig|API ESLint TSConfig]]
- [[_COMMUNITY_API Technology Stack|API Technology Stack]]
- [[_COMMUNITY_Linting & Commit Hooks|Linting & Commit Hooks]]
- [[_COMMUNITY_Prettier Formatting Rules|Prettier Formatting Rules]]
- [[_COMMUNITY_Race Category & Enums|Race Category & Enums]]
- [[_COMMUNITY_NestJS CLI Config|NestJS CLI Config]]
- [[_COMMUNITY_Shared-Types TSConfig|Shared-Types TSConfig]]
- [[_COMMUNITY_Shared ESLint Config Chain|Shared ESLint Config Chain]]
- [[_COMMUNITY_ESLint Flat Config Files|ESLint Flat Config Files]]
- [[_COMMUNITY_Shared-Types ESLint TSConfig|Shared-Types ESLint TSConfig]]
- [[_COMMUNITY_Commitlint & Root Package|Commitlint & Root Package]]
- [[_COMMUNITY_MID Event & Organizer|MID Event & Organizer]]
- [[_COMMUNITY_Testing Strategy|Testing Strategy]]
- [[_COMMUNITY_Admin Back-Office (Next.js)|Admin Back-Office (Next.js)]]
- [[_COMMUNITY_Security & Compliance|Security & Compliance]]
- [[_COMMUNITY_Phase 1 Pilot (MID 2026)|Phase 1 Pilot (MID 2026)]]
- [[_COMMUNITY_Shared Reusable Configs|Shared Reusable Configs]]
- [[_COMMUNITY_Conventional Commits|Conventional Commits]]
- [[_COMMUNITY_Feature-Branch + PR Workflow|Feature-Branch + PR Workflow]]
- [[_COMMUNITY_TDD Practice|TDD Practice]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 28 edges
2. `compilerOptions` - 21 edges
3. `scripts` - 14 edges
4. `scripts` - 14 edges
5. `compilerOptions` - 10 edges
6. `Phase 0 Plan 1 — Monorepo Foundation` - 10 edges
7. `@mid/api package` - 9 edges
8. `scripts` - 7 edges
9. `tasks` - 7 edges
10. `Organisation monorepo (Turborepo + pnpm)` - 7 edges

## Surprising Connections (you probably didn't know these)
- `RaceCategorySchema (Zod enum)` --semantically_similar_to--> `Catégories de course (42/21/10/kids)`  [INFERRED] [semantically similar]
  packages/shared-types/src/schemas/race-category.ts → docs/superpowers/specs/2026-05-27-mid-mobile-app-design.md
- `PAYMENT_PROVIDERS (orange_momo/mtn_momo/card)` --semantically_similar_to--> `Intégration Mobile Money (Orange/MTN MoMo)`  [INFERRED] [semantically similar]
  packages/shared-types/src/enums.ts → docs/superpowers/specs/2026-05-27-mid-mobile-app-design.md
- `RaceCategorySchema (Zod enum)` --implements--> `Phase 0 Plan 1 — Monorepo Foundation`  [INFERRED]
  packages/shared-types/src/schemas/race-category.ts → docs/superpowers/plans/2026-05-27-phase0-plan1-monorepo-foundation.md
- `Prettier` --semantically_similar_to--> `ESLint`  [INFERRED] [semantically similar]
  .prettierrc.json → apps/api/eslint.config.mjs
- `turbo.json (Turborepo pipeline)` --implements--> `Phase 0 Plan 1 — Monorepo Foundation`  [INFERRED]
  turbo.json → docs/superpowers/plans/2026-05-27-phase0-plan1-monorepo-foundation.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Pre-commit Code Quality Gate** — pre_commit_hook, lint_staged_tool, prettier_tool, eslint_tool [INFERRED 0.75]
- **API Backend Runtime Stack** — package_nestjs_framework, package_prisma_orm, package_bullmq_queue, package_pino_logger, package_zod_validation [INFERRED 0.75]
- **API Integration Test Stack** — package_vitest_test_runner, package_testcontainers, package_mid_api [INFERRED 0.75]
- **AppModule composes ConfigModule, LoggerModule, HealthModule** — app_module_app_module, config_module_config_module, logger_module_logger_module, health_module_health_module [EXTRACTED 1.00]
- **NestJS bootstrap flow (main creates AppModule, uses Pino Logger, sets api prefix, listens)** — main_bootstrap, app_module_app_module, logger_module_logger_module [INFERRED 0.85]
- **Shared ESLint base extended by node, react, and consumer configs** — index_mjs_eslint_base_config, node_mjs_eslint_node_config, react_mjs_eslint_react_config, eslint_config_shared_types_eslint [EXTRACTED 1.00]
- **Monorepo foundation (Plan 1 deliverables)** — pnpm_workspace_config, turbo_config, tsconfig_base, ci_workflow, docker_compose_dev, dependabot_config, sharedtypes_pkg [INFERRED 0.85]
- **CI pipeline stages** — ci_workflow, ci_job_lint_typecheck, ci_job_test, turbo_config [EXTRACTED 0.75]
- **Phase 0 plans implementing the design spec** — plan1_doc, plan2_doc, design_spec_phase0, design_spec_monorepo_org, design_spec_api_nestjs [INFERRED 0.85]

## Communities (37 total, 11 thin omitted)

### Community 0 - "Architecture, Plans & CI"
Cohesion: 0.09
Nodes (28): CI job: Lint & TypeCheck, CI job: Tests (Postgres + Redis services), GitHub Actions CI workflow, Dependabot config (npm + github-actions), API NestJS (monolithe modulaire, 10 modules), Auth flow Supabase JWT via JWKS, Background jobs BullMQ, MID Mobile App Design Spec (+20 more)

### Community 1 - "Base TypeScript Compiler Options"
Cohesion: 0.07
Nodes (28): compilerOptions, allowSyntheticDefaultImports, alwaysStrict, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, incremental (+20 more)

### Community 2 - "Root Package Scripts"
Cohesion: 0.08
Nodes (25): description, engines, node, pnpm, lint-staged, *.{json,yml,yaml,md}, *.{ts,tsx,js,jsx}, name (+17 more)

### Community 3 - "API TypeScript Config"
Cohesion: 0.08
Nodes (24): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, declarationMap, emitDecoratorMetadata, esModuleInterop, experimentalDecorators (+16 more)

### Community 4 - "NestJS API Modules"
Cohesion: 0.13
Nodes (12): ConfigModule, Env, envSchema, validateEnv(), HealthController, Liveness, Readiness, ReadinessCheck (+4 more)

### Community 5 - "API Runtime Dependencies"
Cohesion: 0.08
Nodes (24): dependencies, bullmq, class-transformer, class-validator, ioredis, jose, @mid/shared-types, @nestjs/bullmq (+16 more)

### Community 6 - "Shared-Types Package Config"
Cohesion: 0.09
Nodes (21): dependencies, zod, devDependencies, eslint, @mid/eslint-config, rimraf, typescript, vitest (+13 more)

### Community 7 - "API Package Scripts (Prisma)"
Cohesion: 0.10
Nodes (19): main, name, private, scripts, build, clean, dev, lint (+11 more)

### Community 8 - "Domain Model & Shared Types"
Cohesion: 0.12
Nodes (18): Modèle de données (20 entités), Application mobile React Native + Expo, Intégration Mobile Money (Orange/MTN MoMo), Multi-tenancy par édition (edition_id), Stratégie offline-first, Catégories de course (42/21/10/kids), Soft delete (anonymisation), PAYMENT_PROVIDERS (orange_momo/mtn_momo/card) (+10 more)

### Community 9 - "Turborepo Task Pipeline"
Cohesion: 0.11
Nodes (19): dependsOn, inputs, outputs, cache, cache, persistent, dependsOn, outputs (+11 more)

### Community 10 - "API Dev Dependencies"
Cohesion: 0.11
Nodes (18): devDependencies, eslint, @mid/eslint-config, @nestjs/cli, @nestjs/schematics, @nestjs/testing, prisma, rimraf (+10 more)

### Community 11 - "ESLint Config Package"
Cohesion: 0.11
Nodes (17): dependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-import, eslint-plugin-react, eslint-plugin-react-hooks, globals (+9 more)

### Community 12 - "Git Hooks & Build Tooling"
Cohesion: 0.13
Nodes (13): husky.sh script, devDependencies, @commitlint/cli, @commitlint/config-conventional, husky, lint-staged, prettier, rimraf (+5 more)

### Community 13 - "NestJS Bootstrap & Wiring"
Cohesion: 0.22
Nodes (14): AppModule (root NestJS module), ConfigModule (env config wrapper), envSchema (Zod env schema), Env type (inferred from envSchema), validateEnv (env validation function), HealthController (liveness/readiness), HealthController.liveness (GET /healthz), HealthController.readiness (GET /readyz) (+6 more)

### Community 14 - "API ESLint TSConfig"
Cohesion: 0.15
Nodes (12): compilerOptions, allowJs, emitDecoratorMetadata, experimentalDecorators, noEmit, noUncheckedIndexedAccess, noUnusedLocals, noUnusedParameters (+4 more)

### Community 15 - "API Technology Stack"
Cohesion: 0.20
Nodes (12): Nest CLI Configuration, NestJS CLI, BullMQ Job Queue, @mid/api package, @mid/shared-types (workspace dep), NestJS Framework, Pino / nestjs-pino Logger, Prisma ORM (+4 more)

### Community 16 - "Linting & Commit Hooks"
Cohesion: 0.18
Nodes (12): commit-msg Git Hook, commitlint, API ESLint Flat Config, @mid/eslint-config (shared node config), ESLint, Husky Hook Dispatcher (h), Husky Git Hook System, lint-staged (+4 more)

### Community 17 - "Prettier Formatting Rules"
Cohesion: 0.18
Nodes (10): arrowParens, bracketSameLine, bracketSpacing, endOfLine, printWidth, semi, singleQuote, tabWidth (+2 more)

### Community 18 - "Race Category & Enums"
Cohesion: 0.22
Nodes (6): RaceCategory, RaceCategorySchema, PAYMENT_PROVIDERS, PaymentProvider, SUPPORTED_LOCALES, SupportedLocale

### Community 19 - "NestJS CLI Config"
Cohesion: 0.25
Nodes (7): collection, compilerOptions, assets, deleteOutDir, watchAssets, $schema, sourceRoot

### Community 20 - "Shared-Types TSConfig"
Cohesion: 0.25
Nodes (7): compilerOptions, composite, outDir, rootDir, exclude, extends, include

### Community 21 - "Shared ESLint Config Chain"
Cohesion: 0.43
Nodes (7): shared-types eslint.config.mjs, @mid/eslint-config base (index.mjs), @mid/eslint-config/node, @mid/eslint-config package.json, @mid/eslint-config/react, api tsconfig.eslint.json, api tsconfig.json

### Community 23 - "Shared-Types ESLint TSConfig"
Cohesion: 0.29
Nodes (6): compilerOptions, allowJs, noEmit, rootDir, extends, include

## Knowledge Gaps
- **250 isolated node(s):** `husky.sh script`, `semi`, `singleQuote`, `trailingComma`, `printWidth` (+245 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Phase 0 Plan 1 — Monorepo Foundation` connect `Architecture, Plans & CI` to `Domain Model & Shared Types`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `compilerOptions` connect `Base TypeScript Compiler Options` to `Domain Model & Shared Types`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `dependencies` connect `API Runtime Dependencies` to `API Package Scripts (Prisma)`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `husky.sh script`, `semi`, `singleQuote` to the rest of the system?**
  _272 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Architecture, Plans & CI` be split into smaller, more focused modules?**
  _Cohesion score 0.09113300492610837 - nodes in this community are weakly interconnected._
- **Should `Base TypeScript Compiler Options` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `Root Package Scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._