# Phase 0 — Plan 2/5 : API NestJS skeleton

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mettre en place le squelette de l'API NestJS dans `apps/api/` — boot fonctionnel, configuration validée, logger structuré, gestion d'erreurs, health checks, authentification Supabase JWT, Prisma + Postgres, BullMQ + Redis, OpenAPI auto-généré, Dockerfile multi-stage prod. Pas de modules métier — uniquement les fondations techniques sur lesquelles tous les modules futurs (users, races, registrations, payments, results) viendront se brancher.

**Architecture:** Application NestJS 11 monolithe modulaire (un seul service), arbres de modules par responsabilité (config, logging, common, auth, prisma, health, queues). Prisma comme ORM contre une Postgres locale (docker-compose Plan 1) avec migrations versionnées. Authentification déléguée à Supabase : NestJS valide les JWT signés RS256 via JWKS publié par Supabase, sans avoir à stocker de mots de passe.

**Tech Stack:** NestJS 11 · Prisma 5 · Vitest 2 · @nestjs/swagger · BullMQ + ioredis · Pino · Sentry · jose (JWT validation) · @testcontainers/postgresql · Zod · class-validator

**Deliverable de ce plan :**
- L'API boot via `pnpm --filter @mid/api dev` et expose `/healthz` (200 OK) + `/readyz` (200 OK + checks Postgres/Redis)
- `/docs` expose la doc OpenAPI Swagger UI
- Un guard `SupabaseAuthGuard` validable via fixtures JWT
- Un sample job BullMQ qui s'enqueue et se traite
- `pnpm --filter @mid/api test` lance unit + intégration (Testcontainers) — tout passe
- `pnpm --filter @mid/api build` produit un dossier `dist/` exécutable via `node dist/main.js`
- `docker build` produit une image OCI minimale (~150-200 MB) qui boot
- CI verte sur `main`

**Pré-requis avant de démarrer :**
- Plan 1 complété (tag `phase0-plan1-monorepo` présent)
- `pnpm db:up` doit fonctionner (Postgres + Redis locaux)
- Docker Desktop lancé (pour Testcontainers et build d'image)
- Un projet Supabase créé (gratuit) : https://supabase.com/dashboard — note `Project URL`, `anon key`, `service_role key`, `JWT Secret`. Si tu veux différer la création Supabase, c'est OK — les tests utilisent un JWKS local, seul le déploiement réel a besoin du vrai Supabase.

---

## Structure de fichiers cible (à la fin du plan)

```
apps/api/
├── package.json
├── tsconfig.json
├── tsconfig.eslint.json
├── eslint.config.mjs
├── vitest.config.ts
├── nest-cli.json
├── Dockerfile
├── .dockerignore
├── .env.example
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       └── <timestamp>_init/
│           └── migration.sql
└── src/
    ├── main.ts
    ├── app.module.ts
    ├── config/
    │   ├── config.module.ts
    │   ├── env.schema.ts
    │   └── env.validation.ts
    ├── logging/
    │   ├── logger.module.ts
    │   └── pino.config.ts
    ├── common/
    │   ├── filters/
    │   │   ├── all-exceptions.filter.ts
    │   │   └── all-exceptions.filter.spec.ts
    │   ├── interceptors/
    │   │   └── request-logging.interceptor.ts
    │   └── pipes/
    │       └── zod-validation.pipe.ts
    ├── auth/
    │   ├── auth.module.ts
    │   ├── jwt-validator.service.ts
    │   ├── jwt-validator.service.spec.ts
    │   ├── guards/
    │   │   └── supabase-auth.guard.ts
    │   └── decorators/
    │       └── current-user.decorator.ts
    ├── prisma/
    │   ├── prisma.module.ts
    │   └── prisma.service.ts
    ├── health/
    │   ├── health.module.ts
    │   ├── health.controller.ts
    │   └── health.controller.spec.ts
    ├── queues/
    │   ├── queues.module.ts
    │   ├── jobs/
    │   │   ├── sample.processor.ts
    │   │   └── sample.processor.spec.ts
    │   └── queues.constants.ts
    └── sentry/
        └── sentry.bootstrap.ts

test/
├── setup.ts                    # Vitest global setup (Testcontainers)
├── fixtures/
│   ├── jwt-test-keys.ts        # paire RS256 pour tests
│   └── mock-jwks-server.ts     # serveur JWKS local pour tests
└── integration/
    ├── health.e2e.spec.ts
    └── auth.e2e.spec.ts
```

---

## Branching strategy

Plan 1 a poussé sur `main` directement (bootstrap d'un repo neuf). À partir de Plan 2, on bascule sur un workflow **feature branch + PR vers main**, même en solo. Pourquoi :
- L'historique reste lisible (squash merge)
- La CI doit être verte sur la PR avant merge
- Habitude saine pour le moment où TARA ajoutera des contributeurs

**Convention de nommage des branches** : `phase0/plan2-api-nestjs/<task-slug>` (ou simplement `phase0/plan2-api-nestjs` pour tout le plan, mergée en un PR à la fin si le plan est cohérent).

**Pour ce plan**, je recommande **une seule branche** `phase0/plan2-api-nestjs` couvrant les 15 tasks, mergée en un PR squash à la fin (gros PR mais cohérent).

À créer **avant de démarrer Task 1** :
```bash
git checkout main
git pull
git checkout -b phase0/plan2-api-nestjs
```

---

## Task 1: Initialiser le package `apps/api`

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/tsconfig.eslint.json`
- Create: `apps/api/eslint.config.mjs`
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/.env.example`
- Create: `apps/api/.dockerignore`

- [ ] **Step 1: Créer la structure de base**

```bash
mkdir -p apps/api/src apps/api/test
```

- [ ] **Step 2: Créer `apps/api/package.json`**

```json
{
  "name": "@mid/api",
  "version": "0.0.0",
  "private": true,
  "type": "commonjs",
  "main": "dist/main.js",
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "node dist/main.js",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:int": "vitest run --config vitest.integration.config.ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate:dev": "prisma migrate dev",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "clean": "rimraf dist .turbo"
  },
  "dependencies": {
    "@mid/shared-types": "workspace:*",
    "@nestjs/bullmq": "^11.0.0",
    "@nestjs/common": "^11.0.0",
    "@nestjs/config": "^4.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/swagger": "^11.0.0",
    "@nestjs/terminus": "^11.0.0",
    "@prisma/client": "^6.0.0",
    "@sentry/nestjs": "^8.45.0",
    "@sentry/node": "^8.45.0",
    "bullmq": "^5.34.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "ioredis": "^5.4.1",
    "jose": "^5.9.6",
    "nestjs-pino": "^4.2.0",
    "pino": "^9.5.0",
    "pino-http": "^10.3.0",
    "pino-pretty": "^13.0.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@mid/eslint-config": "workspace:*",
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@testcontainers/postgresql": "^10.13.2",
    "@testcontainers/redis": "^10.13.2",
    "@types/express": "^5.0.0",
    "@types/node": "^22.10.0",
    "@types/supertest": "^6.0.2",
    "eslint": "^9.15.0",
    "prisma": "^6.0.0",
    "rimraf": "^6.0.1",
    "supertest": "^7.0.0",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.6.3",
    "vitest": "^2.1.5"
  }
}
```

- [ ] **Step 3: Créer `apps/api/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "rootDir": "./src",
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictPropertyInitialization": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2022",
    "lib": ["ES2022"],
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noUncheckedIndexedAccess": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "test"]
}
```

Note : on désactive `strictPropertyInitialization`, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess` pour NestJS — sinon les controllers/services qui injectent des deps via decorators ne compilent pas. C'est l'usage standard NestJS.

- [ ] **Step 4: Créer `apps/api/tsconfig.eslint.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "noEmit": true,
    "allowJs": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noUncheckedIndexedAccess": false
  },
  "include": ["src/**/*", "test/**/*", "vitest.config.ts", "vitest.integration.config.ts", "eslint.config.mjs", "nest-cli.json"]
}
```

- [ ] **Step 5: Créer `apps/api/eslint.config.mjs`**

```javascript
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import config from '@mid/eslint-config/node';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  ...config,
  {
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // NestJS uses decorators heavily — relax these
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
];
```

- [ ] **Step 6: Créer `apps/api/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['**/*.spec.ts', '**/*.module.ts', 'src/main.ts'],
    },
  },
});
```

- [ ] **Step 7: Créer `apps/api/nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": [],
    "watchAssets": false
  }
}
```

- [ ] **Step 8: Créer `apps/api/.env.example`**

```bash
# === API NestJS environment ===

# Node
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Postgres (utilisé par Prisma) - local dev via pnpm db:up
DATABASE_URL=postgresql://mid:mid_dev_password@localhost:5432/mid_dev

# Redis (utilisé par BullMQ) - local dev via pnpm db:up
REDIS_URL=redis://localhost:6379

# Supabase Auth
# Va sur https://supabase.com/dashboard, crée un projet, puis :
# Settings → API → copie les valeurs ci-dessous
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_AUDIENCE=authenticated
# Pour les tests, ces valeurs sont overridées par des fixtures JWKS

# Sentry (optionnel en dev)
SENTRY_DSN=
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1
```

- [ ] **Step 9: Créer `apps/api/.dockerignore`**

```
node_modules
dist
.git
.gitignore
.env
.env.local
*.log
coverage
test
**/*.spec.ts
**/*.test.ts
.turbo
.vscode
.idea
README.md
Dockerfile
.dockerignore
```

- [ ] **Step 10: Installer les dépendances**

```bash
pnpm install
```

Expected: pnpm résoud le workspace, installe ~600 paquets dans `apps/api/node_modules/`. Prend 1-3 minutes. Si erreur de peer deps, vérifier que NestJS 11 et @nestjs/* sont alignés en version 11.x.

- [ ] **Step 11: Vérifier la découverte workspace**

```bash
pnpm list -F @mid/api --depth 0
```

Expected: liste les ~25 deps + devDeps de `@mid/api`.

- [ ] **Step 12: Commit**

```bash
git add apps/api pnpm-lock.yaml
git commit -m "chore(api): scaffold NestJS package with deps and configs"
```

---

## Task 2: Boot minimal de l'app NestJS

**Files:**
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`

- [ ] **Step 1: Créer `apps/api/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

- [ ] **Step 2: Créer `apps/api/src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}/api`);
}

void bootstrap();
```

- [ ] **Step 3: Build pour vérifier**

```bash
pnpm --filter @mid/api build
```

Expected: `dist/main.js` créé sans erreur TS. Le warning sur "no controllers" est normal — on n'a pas encore de controllers.

- [ ] **Step 4: Boot pour vérifier**

```bash
pnpm --filter @mid/api start &
sleep 5
curl -i http://localhost:3000/api
```

Expected: `curl` retourne 404 (pas de route définie, c'est OK). Le log console montre "API listening on http://localhost:3000/api".

Tuer le process : sur Windows Git Bash, `taskkill //F //IM node.exe` (attention, ça tue TOUS les node.exe — alternative : note le PID au boot et `kill -9 $PID`).

- [ ] **Step 5: Lint + typecheck**

```bash
pnpm --filter @mid/api lint
pnpm --filter @mid/api typecheck
```

Expected: pas d'erreur.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src
git commit -m "feat(api): bootstrap minimal NestJS application"
```

---

## Task 3: Module Config avec validation Zod

**Files:**
- Create: `apps/api/src/config/env.schema.ts`
- Create: `apps/api/src/config/env.validation.ts`
- Create: `apps/api/src/config/config.module.ts`
- Modify: `apps/api/src/app.module.ts` (ajout import ConfigModule)

- [ ] **Step 1: Créer `apps/api/src/config/env.schema.ts`**

```typescript
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_JWT_AUDIENCE: z.string().default('authenticated'),

  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().default('development'),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
});

export type Env = z.infer<typeof envSchema>;
```

- [ ] **Step 2: Créer `apps/api/src/config/env.validation.ts`**

```typescript
import { Env, envSchema } from './env.schema';

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const formatted = result.error.format();
    // eslint-disable-next-line no-console
    console.error('❌ Invalid environment variables:', JSON.stringify(formatted, null, 2));
    throw new Error('Invalid environment variables — see logs above');
  }
  return result.data;
}
```

- [ ] **Step 3: Créer `apps/api/src/config/config.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { validateEnv } from './env.validation';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
  ],
})
export class ConfigModule {}
```

- [ ] **Step 4: Modifier `apps/api/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';

import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

- [ ] **Step 5: Tester la validation en local**

Créer un `.env` temporaire à `apps/api/.env` (sera gitignored — `.env` est dans `.gitignore` racine) :

```bash
cp apps/api/.env.example apps/api/.env
```

Puis :
```bash
pnpm --filter @mid/api start &
sleep 5
curl -s http://localhost:3000/api > /dev/null && echo "Boot OK" || echo "Boot KO"
# Kill node
```

Expected: `Boot OK` (l'app boot proprement avec la config validée).

- [ ] **Step 6: Tester la validation négative**

Casser une env var et vérifier que ça plante au boot :
```bash
PORT=invalid pnpm --filter @mid/api start
```

Expected: l'app refuse de démarrer avec un message d'erreur clair listant `PORT` comme invalide.

- [ ] **Step 7: Lint + typecheck**

```bash
pnpm --filter @mid/api lint
pnpm --filter @mid/api typecheck
```

- [ ] **Step 8: Commit**

```bash
git add apps/api/src
git commit -m "feat(api): add Zod-validated config module"
```

---

## Task 4: Logger Pino structuré

**Files:**
- Create: `apps/api/src/logging/pino.config.ts`
- Create: `apps/api/src/logging/logger.module.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/main.ts`

- [ ] **Step 1: Créer `apps/api/src/logging/pino.config.ts`**

```typescript
import { ConfigService } from '@nestjs/config';
import { Params } from 'nestjs-pino';

import { Env } from '../config/env.schema';

export function buildPinoConfig(config: ConfigService<Env, true>): Params {
  const isProduction = config.get('NODE_ENV', { infer: true }) === 'production';
  const level = config.get('LOG_LEVEL', { infer: true });

  return {
    pinoHttp: {
      level,
      transport: isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: { singleLine: true, colorize: true, translateTime: 'HH:MM:ss.l' },
          },
      autoLogging: { ignore: (req) => req.url === '/api/healthz' || req.url === '/api/readyz' },
      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
        censor: '[REDACTED]',
      },
      serializers: {
        req: (req: { method: string; url: string; id?: string }) => ({
          method: req.method,
          url: req.url,
          id: req.id,
        }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
      },
    },
  };
}
```

- [ ] **Step 2: Créer `apps/api/src/logging/logger.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as NestPinoLoggerModule } from 'nestjs-pino';

import { Env } from '../config/env.schema';

import { buildPinoConfig } from './pino.config';

@Module({
  imports: [
    NestPinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => buildPinoConfig(config),
    }),
  ],
})
export class LoggerModule {}
```

- [ ] **Step 3: Modifier `apps/api/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';

import { ConfigModule } from './config/config.module';
import { LoggerModule } from './logging/logger.module';

@Module({
  imports: [ConfigModule, LoggerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

- [ ] **Step 4: Modifier `apps/api/src/main.ts`** pour utiliser Pino comme logger Nest

```typescript
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api');
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  app.get(Logger).log(`API listening on http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
```

- [ ] **Step 5: Tester**

```bash
pnpm --filter @mid/api start &
sleep 5
curl -s http://localhost:3000/api
```

Expected: logs JSON colorés en dev (via pino-pretty), avec timestamp, level, message. Le boot log apparaît avec `Bootstrap` comme context.

Tuer le process.

- [ ] **Step 6: Lint + typecheck**

```bash
pnpm --filter @mid/api lint
pnpm --filter @mid/api typecheck
```

- [ ] **Step 7: Commit**

```bash
git add apps/api/src
git commit -m "feat(api): integrate Pino structured logger"
```

---

## Task 5: Health controller avec TDD

**Files:**
- Create: `apps/api/src/health/health.controller.ts`
- Create: `apps/api/src/health/health.controller.spec.ts`
- Create: `apps/api/src/health/health.module.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Écrire le test (TDD — il doit échouer)**

Contenu de `apps/api/src/health/health.controller.spec.ts` :

```typescript
import { Test } from '@nestjs/testing';
import { describe, expect, it, beforeAll } from 'vitest';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it('liveness returns ok with version and uptime', () => {
    const result = controller.liveness();
    expect(result.status).toBe('ok');
    expect(typeof result.uptime).toBe('number');
    expect(result.uptime).toBeGreaterThan(0);
    expect(typeof result.version).toBe('string');
  });

  it('readiness returns ok shape (deps health checked elsewhere)', async () => {
    const result = await controller.readiness();
    expect(['ok', 'degraded']).toContain(result.status);
    expect(result.checks).toBeDefined();
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
pnpm --filter @mid/api test
```

Expected: FAIL — "Cannot find module './health.controller'".

- [ ] **Step 3: Implémenter le controller**

Contenu de `apps/api/src/health/health.controller.ts` :

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

type Liveness = {
  status: 'ok';
  uptime: number;
  version: string;
  timestamp: string;
};

type ReadinessCheck = {
  postgres: 'up' | 'down' | 'unknown';
  redis: 'up' | 'down' | 'unknown';
};

type Readiness = {
  status: 'ok' | 'degraded';
  checks: ReadinessCheck;
  timestamp: string;
};

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('healthz')
  liveness(): Liveness {
    return {
      status: 'ok',
      uptime: process.uptime(),
      version: process.env.npm_package_version ?? '0.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readyz')
  readiness(): Promise<Readiness> {
    // Les checks réels Postgres/Redis seront branchés à la Task 8 (Prisma) et 11 (BullMQ).
    // Pour l'instant, on retourne 'unknown' — c'est explicite, pas un mensonge.
    return Promise.resolve({
      status: 'ok',
      checks: { postgres: 'unknown', redis: 'unknown' },
      timestamp: new Date().toISOString(),
    });
  }
}
```

- [ ] **Step 4: Créer `apps/api/src/health/health.module.ts`**

```typescript
import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
```

- [ ] **Step 5: Modifier `apps/api/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';

import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './logging/logger.module';

@Module({
  imports: [ConfigModule, LoggerModule, HealthModule],
})
export class AppModule {}
```

- [ ] **Step 6: Relancer le test — il doit passer**

```bash
pnpm --filter @mid/api test
```

Expected: PASS — 2 tests.

- [ ] **Step 7: Vérifier via HTTP**

```bash
pnpm --filter @mid/api start &
sleep 5
curl -s http://localhost:3000/api/healthz | jq .
curl -s http://localhost:3000/api/readyz | jq .
```

Expected: les deux retournent du JSON avec `status: "ok"`.

Tuer le process.

- [ ] **Step 8: Lint + typecheck**

```bash
pnpm --filter @mid/api lint
pnpm --filter @mid/api typecheck
```

- [ ] **Step 9: Commit**

```bash
git add apps/api/src
git commit -m "feat(api): add health controller with liveness and readiness endpoints"
```

---

## Task 6: Filtres d'exception globaux

**Files:**
- Create: `apps/api/src/common/filters/all-exceptions.filter.ts`
- Create: `apps/api/src/common/filters/all-exceptions.filter.spec.ts`
- Create: `apps/api/src/common/pipes/zod-validation.pipe.ts`
- Modify: `apps/api/src/main.ts`

- [ ] **Step 1: Écrire le test du filter (TDD)**

Contenu de `apps/api/src/common/filters/all-exceptions.filter.spec.ts` :

```typescript
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { AllExceptionsFilter } from './all-exceptions.filter';

function mockHost(): { host: ArgumentsHost; json: ReturnType<typeof vi.fn>; status: ReturnType<typeof vi.fn> } {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const response = { status };
  const request = { url: '/api/test', method: 'GET', id: 'req-123' };
  const httpContext = {
    getResponse: () => response,
    getRequest: () => request,
  };
  const host = { switchToHttp: () => httpContext } as unknown as ArgumentsHost;
  return { host, json, status };
}

describe('AllExceptionsFilter', () => {
  it('formats HttpException correctly', () => {
    const filter = new AllExceptionsFilter();
    const { host, json, status } = mockHost();
    const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not found',
        path: '/api/test',
        requestId: 'req-123',
      }),
    );
  });

  it('formats unknown errors as 500', () => {
    const filter = new AllExceptionsFilter();
    const { host, json, status } = mockHost();
    const exception = new Error('Boom');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  });
});
```

- [ ] **Step 2: Lancer pour voir le test échouer**

```bash
pnpm --filter @mid/api test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implémenter le filter**

Contenu de `apps/api/src/common/filters/all-exceptions.filter.ts` :

```typescript
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

type ErrorPayload = {
  statusCode: number;
  message: string;
  error?: string;
  path: string;
  requestId?: string;
  timestamp: string;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string }>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorName: string | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const obj = body as { message?: string | string[]; error?: string };
        message = Array.isArray(obj.message) ? obj.message.join(', ') : (obj.message ?? message);
        errorName = obj.error;
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    } else {
      this.logger.error(`Unknown exception thrown: ${String(exception)}`);
    }

    const payload: ErrorPayload = {
      statusCode,
      message,
      ...(errorName ? { error: errorName } : {}),
      path: request.url,
      requestId: request.id,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(payload);
  }
}
```

- [ ] **Step 4: Implémenter `ZodValidationPipe`**

Contenu de `apps/api/src/common/pipes/zod-validation.pipe.ts` :

```typescript
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown, _metadata: ArgumentMetadata): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.format(),
      });
    }
    return result.data;
  }
}
```

- [ ] **Step 5: Modifier `apps/api/src/main.ts`** pour brancher le filter globalement

```typescript
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter());
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  app.get(Logger).log(`API listening on http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
```

- [ ] **Step 6: Relancer les tests — tous doivent passer**

```bash
pnpm --filter @mid/api test
```

Expected: PASS — 4 tests au total (2 health + 2 filter).

- [ ] **Step 7: Vérifier l'effet en HTTP**

```bash
pnpm --filter @mid/api start &
sleep 5
curl -s -i http://localhost:3000/api/does-not-exist | head -20
```

Expected: réponse 404 JSON formatée par le filter : `{"statusCode":404,"message":"Cannot GET /api/does-not-exist","path":"/api/does-not-exist","timestamp":"..."}`.

Tuer le process.

- [ ] **Step 8: Lint + typecheck**

```bash
pnpm --filter @mid/api lint
pnpm --filter @mid/api typecheck
```

- [ ] **Step 9: Commit**

```bash
git add apps/api/src
git commit -m "feat(api): add global exception filter and Zod validation pipe"
```

---

## Task 7: Intégration Sentry

**Files:**
- Create: `apps/api/src/sentry/sentry.bootstrap.ts`
- Modify: `apps/api/src/main.ts`

- [ ] **Step 1: Créer `apps/api/src/sentry/sentry.bootstrap.ts`**

```typescript
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    // eslint-disable-next-line no-console
    console.log('[sentry] SENTRY_DSN not set — error reporting disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    integrations: [nodeProfilingIntegration()],
    profilesSampleRate: 1.0,
  });

  // eslint-disable-next-line no-console
  console.log('[sentry] initialized');
}
```

- [ ] **Step 2: Ajouter `@sentry/profiling-node` aux dépendances**

Edit `apps/api/package.json`, dans `dependencies`, ajouter :
```json
"@sentry/profiling-node": "^8.45.0"
```

Puis `pnpm install`.

- [ ] **Step 3: Modifier `apps/api/src/main.ts`** pour initialiser Sentry AVANT NestFactory

```typescript
import { initSentry } from './sentry/sentry.bootstrap';
initSentry();

import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter());
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  app.get(Logger).log(`API listening on http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
```

**IMPORTANT** : `initSentry()` doit être appelé AVANT tout `import` Nest (sinon le tracing manque les premières requêtes). L'ordre des imports compte ici.

- [ ] **Step 4: Tester sans DSN (mode désactivé)**

```bash
SENTRY_DSN= pnpm --filter @mid/api start &
sleep 5
curl -s http://localhost:3000/api/healthz
```

Expected: log `[sentry] SENTRY_DSN not set — error reporting disabled`. App boote normalement.

Tuer le process.

- [ ] **Step 5: Lint + typecheck**

```bash
pnpm --filter @mid/api lint
pnpm --filter @mid/api typecheck
```

- [ ] **Step 6: Commit**

```bash
git add apps/api/src apps/api/package.json pnpm-lock.yaml
git commit -m "feat(api): integrate Sentry error reporting"
```

---

## Task 8: Prisma — schema initial + migration

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Génère : `apps/api/prisma/migrations/<timestamp>_init/migration.sql` (par `prisma migrate dev`)

- [ ] **Step 1: Créer `apps/api/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @db.Uuid
  email       String   @unique
  phone       String?
  displayName String   @map("display_name")
  locale      String   @default("fr") @db.VarChar(2)
  role        UserRole @default(RUNNER)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  @@index([email])
  @@index([phone])
  @@map("users")
}

enum UserRole {
  RUNNER
  SPECTATOR
  STAFF
  ADMIN

  @@map("user_role")
}
```

Notes :
- `id` est un UUID — il viendra de Supabase Auth (le user_id Supabase = le `id` ici)
- `deletedAt` pour soft delete (cf. spec section 9.2)
- `@@map` traduit les noms TS (camelCase) vers Postgres (snake_case)

- [ ] **Step 2: S'assurer que Postgres tourne**

```bash
pnpm db:up
# attendre 10s que healthcheck passe
```

- [ ] **Step 3: Créer un `.env` minimal pour Prisma** (si pas déjà fait au Task 3)

```bash
cp apps/api/.env.example apps/api/.env
# édite apps/api/.env si nécessaire (DATABASE_URL doit pointer vers le Postgres local)
```

- [ ] **Step 4: Générer la première migration**

```bash
cd apps/api
pnpm prisma:migrate:dev --name init
cd ../..
```

Expected: Prisma applique la migration en local, génère le SQL dans `apps/api/prisma/migrations/<timestamp>_init/migration.sql`, génère le client TypeScript dans `node_modules/.prisma/client/`.

Si l'erreur "Environment variable not found: DATABASE_URL" → vérifier que `apps/api/.env` existe et contient `DATABASE_URL`.

- [ ] **Step 5: Vérifier la table créée**

```bash
docker exec mid-postgres-dev psql -U mid -d mid_dev -c "\d users"
```

Expected: liste les colonnes `id`, `email`, `phone`, `display_name`, etc.

- [ ] **Step 6: Vérifier le client Prisma généré**

```bash
ls -la apps/api/node_modules/.prisma/client/ 2>/dev/null | head -10
```

Expected: dossier existe avec `index.js`, `index.d.ts`.

- [ ] **Step 7: Lint + typecheck**

```bash
pnpm --filter @mid/api lint
pnpm --filter @mid/api typecheck
```

- [ ] **Step 8: Commit**

```bash
git add apps/api/prisma
git commit -m "feat(api): add Prisma schema with User model and initial migration"
```

---

## Task 9: PrismaService + module + readiness check

**Files:**
- Create: `apps/api/src/prisma/prisma.service.ts`
- Create: `apps/api/src/prisma/prisma.module.ts`
- Modify: `apps/api/src/health/health.controller.ts` (brancher check Postgres)
- Modify: `apps/api/src/health/health.module.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/health/health.controller.spec.ts` (mock PrismaService)

- [ ] **Step 1: Créer `apps/api/src/prisma/prisma.service.ts`**

```typescript
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Prisma connected to database');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database');
  }

  async ping(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.warn(`Postgres ping failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
}
```

- [ ] **Step 2: Créer `apps/api/src/prisma/prisma.module.ts`**

```typescript
import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 3: Mettre à jour le health controller**

Contenu de `apps/api/src/health/health.controller.ts` :

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PrismaService } from '../prisma/prisma.service';

type Liveness = {
  status: 'ok';
  uptime: number;
  version: string;
  timestamp: string;
};

type ReadinessCheck = {
  postgres: 'up' | 'down' | 'unknown';
  redis: 'up' | 'down' | 'unknown';
};

type Readiness = {
  status: 'ok' | 'degraded';
  checks: ReadinessCheck;
  timestamp: string;
};

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('healthz')
  liveness(): Liveness {
    return {
      status: 'ok',
      uptime: process.uptime(),
      version: process.env.npm_package_version ?? '0.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readyz')
  async readiness(): Promise<Readiness> {
    const postgresUp = await this.prisma.ping();
    return {
      status: postgresUp ? 'ok' : 'degraded',
      checks: { postgres: postgresUp ? 'up' : 'down', redis: 'unknown' },
      timestamp: new Date().toISOString(),
    };
  }
}
```

- [ ] **Step 4: Mettre à jour le test (mock PrismaService)**

Contenu de `apps/api/src/health/health.controller.spec.ts` :

```typescript
import { Test } from '@nestjs/testing';
import { describe, expect, it, beforeAll, vi } from 'vitest';

import { PrismaService } from '../prisma/prisma.service';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  const pingMock = vi.fn();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: { ping: pingMock } }],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it('liveness returns ok with version and uptime', () => {
    const result = controller.liveness();
    expect(result.status).toBe('ok');
    expect(typeof result.uptime).toBe('number');
    expect(result.uptime).toBeGreaterThan(0);
    expect(typeof result.version).toBe('string');
  });

  it('readiness returns ok when postgres ping succeeds', async () => {
    pingMock.mockResolvedValueOnce(true);
    const result = await controller.readiness();
    expect(result.status).toBe('ok');
    expect(result.checks.postgres).toBe('up');
  });

  it('readiness returns degraded when postgres ping fails', async () => {
    pingMock.mockResolvedValueOnce(false);
    const result = await controller.readiness();
    expect(result.status).toBe('degraded');
    expect(result.checks.postgres).toBe('down');
  });
});
```

- [ ] **Step 5: Mettre à jour `health.module.ts` et `app.module.ts`**

Contenu de `apps/api/src/health/health.module.ts` :

```typescript
import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
```

(Pas besoin d'importer PrismaModule ici car il est `@Global()` dans Task 8 ; il sera injecté automatiquement.)

Contenu de `apps/api/src/app.module.ts` :

```typescript
import { Module } from '@nestjs/common';

import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './logging/logger.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigModule, LoggerModule, PrismaModule, HealthModule],
})
export class AppModule {}
```

- [ ] **Step 6: Lancer les tests — tous doivent passer**

```bash
pnpm --filter @mid/api test
```

Expected: 5 tests (3 health + 2 filter) passent.

- [ ] **Step 7: Vérifier en HTTP**

```bash
pnpm db:up
pnpm --filter @mid/api start &
sleep 5
curl -s http://localhost:3000/api/readyz | jq .
```

Expected: `{"status":"ok","checks":{"postgres":"up","redis":"unknown"}, ...}`.

- [ ] **Step 8: Vérifier le cas dégradé**

```bash
pnpm db:down
sleep 5
curl -s http://localhost:3000/api/readyz | jq .
```

Expected: `{"status":"degraded","checks":{"postgres":"down",...}}`.

Restart la DB : `pnpm db:up`. Tuer le node.

- [ ] **Step 9: Lint + typecheck**

```bash
pnpm --filter @mid/api lint
pnpm --filter @mid/api typecheck
```

- [ ] **Step 10: Commit**

```bash
git add apps/api/src
git commit -m "feat(api): add Prisma service module and wire postgres healthcheck"
```

---

## Task 10: Auth — JWT validator + fixtures de test

**Files:**
- Create: `test/fixtures/jwt-test-keys.ts`
- Create: `test/fixtures/mock-jwks-server.ts`
- Create: `apps/api/src/auth/jwt-validator.service.ts`
- Create: `apps/api/src/auth/jwt-validator.service.spec.ts`
- Create: `apps/api/src/auth/auth.module.ts`

- [ ] **Step 1: Créer le dossier de fixtures**

```bash
mkdir -p apps/api/test/fixtures apps/api/test/integration
```

- [ ] **Step 2: Créer `apps/api/test/fixtures/jwt-test-keys.ts`**

```typescript
import { generateKeyPair, exportJWK, KeyLike, JWK, SignJWT } from 'jose';

export type TestKeyPair = {
  publicKey: KeyLike;
  privateKey: KeyLike;
  publicJwk: JWK;
  kid: string;
};

export async function generateTestKeyPair(): Promise<TestKeyPair> {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const publicJwk = await exportJWK(publicKey);
  const kid = 'test-key-1';
  publicJwk.kid = kid;
  publicJwk.alg = 'RS256';
  publicJwk.use = 'sig';
  return { publicKey, privateKey, publicJwk, kid };
}

export async function signTestJwt(
  privateKey: KeyLike,
  kid: string,
  payload: Record<string, unknown>,
  options: { issuer: string; audience: string; expiresIn?: string } = {
    issuer: 'https://test.supabase.local/auth/v1',
    audience: 'authenticated',
  },
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', kid, typ: 'JWT' })
    .setIssuedAt()
    .setIssuer(options.issuer)
    .setAudience(options.audience)
    .setExpirationTime(options.expiresIn ?? '1h')
    .sign(privateKey);
}
```

- [ ] **Step 3: Créer `apps/api/test/fixtures/mock-jwks-server.ts`**

```typescript
import { createServer, Server } from 'http';

import { JWK } from 'jose';

export type MockJwksServer = {
  url: string;
  close: () => Promise<void>;
};

export async function startMockJwksServer(publicJwk: JWK): Promise<MockJwksServer> {
  return await new Promise((resolve) => {
    const server: Server = createServer((req, res) => {
      if (req.url === '/.well-known/jwks.json' || req.url === '/auth/v1/.well-known/jwks.json') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ keys: [publicJwk] }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        throw new Error('Mock JWKS server failed to bind');
      }
      const url = `http://127.0.0.1:${address.port}`;
      resolve({
        url,
        close: () =>
          new Promise<void>((res) => {
            server.close(() => res());
          }),
      });
    });
  });
}
```

- [ ] **Step 4: Écrire le test du JwtValidatorService (TDD)**

Contenu de `apps/api/src/auth/jwt-validator.service.spec.ts` :

```typescript
import { describe, expect, it, beforeAll, afterAll } from 'vitest';

import { signTestJwt, generateTestKeyPair, TestKeyPair } from '../../test/fixtures/jwt-test-keys';
import { startMockJwksServer, MockJwksServer } from '../../test/fixtures/mock-jwks-server';

import { JwtValidatorService } from './jwt-validator.service';

describe('JwtValidatorService', () => {
  let keys: TestKeyPair;
  let jwks: MockJwksServer;
  let validator: JwtValidatorService;

  beforeAll(async () => {
    keys = await generateTestKeyPair();
    jwks = await startMockJwksServer(keys.publicJwk);
    validator = new JwtValidatorService({
      jwksUri: `${jwks.url}/.well-known/jwks.json`,
      issuer: 'https://test.supabase.local/auth/v1',
      audience: 'authenticated',
    });
  });

  afterAll(async () => {
    await jwks.close();
  });

  it('accepts a valid JWT and returns its claims', async () => {
    const token = await signTestJwt(keys.privateKey, keys.kid, {
      sub: 'user-uuid-123',
      email: 'runner@example.com',
      role: 'authenticated',
    });
    const claims = await validator.verify(token);
    expect(claims.sub).toBe('user-uuid-123');
    expect(claims.email).toBe('runner@example.com');
  });

  it('rejects a token with wrong issuer', async () => {
    const token = await signTestJwt(
      keys.privateKey,
      keys.kid,
      { sub: 'user-x' },
      { issuer: 'https://wrong.issuer.com', audience: 'authenticated' },
    );
    await expect(validator.verify(token)).rejects.toThrow();
  });

  it('rejects a token with wrong audience', async () => {
    const token = await signTestJwt(
      keys.privateKey,
      keys.kid,
      { sub: 'user-x' },
      { issuer: 'https://test.supabase.local/auth/v1', audience: 'wrong-audience' },
    );
    await expect(validator.verify(token)).rejects.toThrow();
  });

  it('rejects an expired token', async () => {
    const token = await signTestJwt(
      keys.privateKey,
      keys.kid,
      { sub: 'user-x' },
      { issuer: 'https://test.supabase.local/auth/v1', audience: 'authenticated', expiresIn: '-1s' },
    );
    await expect(validator.verify(token)).rejects.toThrow();
  });

  it('rejects a tampered token', async () => {
    const token = await signTestJwt(keys.privateKey, keys.kid, { sub: 'user-x' });
    const tampered = `${token.slice(0, -10)}AAAAAAAAAA`;
    await expect(validator.verify(tampered)).rejects.toThrow();
  });
});
```

- [ ] **Step 5: Lancer pour voir le test échouer**

```bash
pnpm --filter @mid/api test
```

Expected: FAIL — `Cannot find module './jwt-validator.service'`.

- [ ] **Step 6: Implémenter le JwtValidatorService**

Contenu de `apps/api/src/auth/jwt-validator.service.ts` :

```typescript
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

export type SupabaseClaims = JWTPayload & {
  sub: string;
  email?: string;
  phone?: string;
  role?: string;
  aud: string;
};

export type JwtValidatorConfig = {
  jwksUri: string;
  issuer: string;
  audience: string;
};

@Injectable()
export class JwtValidatorService {
  private readonly logger = new Logger(JwtValidatorService.name);
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(private readonly config: JwtValidatorConfig) {
    this.jwks = createRemoteJWKSet(new URL(config.jwksUri), {
      cacheMaxAge: 3_600_000, // 1h
      cooldownDuration: 30_000, // 30s
    });
  }

  async verify(token: string): Promise<SupabaseClaims> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.config.issuer,
        audience: this.config.audience,
      });
      if (typeof payload.sub !== 'string') {
        throw new UnauthorizedException('JWT missing subject claim');
      }
      return payload as SupabaseClaims;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'JWT verification failed';
      this.logger.debug(`JWT verification failed: ${message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
```

- [ ] **Step 7: Créer `apps/api/src/auth/auth.module.ts`**

```typescript
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Env } from '../config/env.schema';

import { JwtValidatorService } from './jwt-validator.service';

@Global()
@Module({
  providers: [
    {
      provide: JwtValidatorService,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): JwtValidatorService => {
        const supabaseUrl = config.get('SUPABASE_URL', { infer: true });
        return new JwtValidatorService({
          jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
          issuer: `${supabaseUrl}/auth/v1`,
          audience: config.get('SUPABASE_JWT_AUDIENCE', { infer: true }),
        });
      },
    },
  ],
  exports: [JwtValidatorService],
})
export class AuthModule {}
```

- [ ] **Step 8: Relancer les tests — tous doivent passer**

```bash
pnpm --filter @mid/api test
```

Expected: PASS — 10 tests au total (3 health + 2 filter + 5 jwt-validator).

- [ ] **Step 9: Lint + typecheck**

```bash
pnpm --filter @mid/api lint
pnpm --filter @mid/api typecheck
```

- [ ] **Step 10: Commit**

```bash
git add apps/api/src apps/api/test
git commit -m "feat(api): add Supabase JWT validator with JWKS verification and tests"
```

---

## Task 11: Guard d'auth + decorator `@CurrentUser` + route protégée de test

**Files:**
- Create: `apps/api/src/auth/guards/supabase-auth.guard.ts`
- Create: `apps/api/src/auth/decorators/current-user.decorator.ts`
- Create: `apps/api/src/auth/decorators/public.decorator.ts`
- Modify: `apps/api/src/auth/auth.module.ts` (exporter le guard)
- Modify: `apps/api/src/app.module.ts` (importer AuthModule + APP_GUARD)
- Create: `apps/api/src/auth/auth-test.controller.ts` (route `/api/auth/me` protégée, temporaire pour valider)
- Create: `apps/api/src/auth/auth-test.controller.spec.ts`

- [ ] **Step 1: Créer le decorator `@Public()`**

Contenu de `apps/api/src/auth/decorators/public.decorator.ts` :

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
```

- [ ] **Step 2: Créer le decorator `@CurrentUser()`**

Contenu de `apps/api/src/auth/decorators/current-user.decorator.ts` :

```typescript
import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { SupabaseClaims } from '../jwt-validator.service';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SupabaseClaims | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: SupabaseClaims }>();
    return request.user;
  },
);
```

- [ ] **Step 3: Créer le guard**

Contenu de `apps/api/src/auth/guards/supabase-auth.guard.ts` :

```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtValidatorService, SupabaseClaims } from '../jwt-validator.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly validator: JwtValidatorService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: SupabaseClaims }>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }
    const token = header.slice('Bearer '.length);
    request.user = await this.validator.verify(token);
    return true;
  }
}
```

- [ ] **Step 4: Mettre à jour `auth.module.ts`** pour exporter le guard

```typescript
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Env } from '../config/env.schema';

import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { JwtValidatorService } from './jwt-validator.service';

@Global()
@Module({
  providers: [
    {
      provide: JwtValidatorService,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): JwtValidatorService => {
        const supabaseUrl = config.get('SUPABASE_URL', { infer: true });
        return new JwtValidatorService({
          jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
          issuer: `${supabaseUrl}/auth/v1`,
          audience: config.get('SUPABASE_JWT_AUDIENCE', { infer: true }),
        });
      },
    },
    SupabaseAuthGuard,
  ],
  exports: [JwtValidatorService, SupabaseAuthGuard],
})
export class AuthModule {}
```

- [ ] **Step 5: Modifier `app.module.ts`** pour brancher le guard globalement

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { AuthTestController } from './auth/auth-test.controller';
import { SupabaseAuthGuard } from './auth/guards/supabase-auth.guard';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './logging/logger.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigModule, LoggerModule, PrismaModule, AuthModule, HealthModule],
  controllers: [AuthTestController],
  providers: [{ provide: APP_GUARD, useClass: SupabaseAuthGuard }],
})
export class AppModule {}
```

- [ ] **Step 6: Modifier le HealthController pour le rendre public**

Dans `apps/api/src/health/health.controller.ts`, ajouter `@Public()` sur la classe :

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

// ... types unchanged ...

@ApiTags('health')
@Public()
@Controller()
export class HealthController {
  // ... rest unchanged ...
}
```

- [ ] **Step 7: Créer la route de test `auth-test.controller.ts`**

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from './decorators/current-user.decorator';
import { SupabaseClaims } from './jwt-validator.service';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthTestController {
  @Get('me')
  me(@CurrentUser() user: SupabaseClaims | undefined): { sub: string; email?: string } | { error: string } {
    if (!user) return { error: 'No user in request — guard should have rejected this' };
    return { sub: user.sub, email: user.email };
  }
}
```

- [ ] **Step 8: Écrire le test E2E (TDD)**

Contenu de `apps/api/src/auth/auth-test.controller.spec.ts` :

```typescript
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';

import { signTestJwt, generateTestKeyPair, TestKeyPair } from '../../test/fixtures/jwt-test-keys';
import { startMockJwksServer, MockJwksServer } from '../../test/fixtures/mock-jwks-server';

import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { JwtValidatorService } from './jwt-validator.service';

import { AuthTestController } from './auth-test.controller';

describe('AuthTestController (E2E)', () => {
  let app: INestApplication;
  let keys: TestKeyPair;
  let jwks: MockJwksServer;

  beforeAll(async () => {
    keys = await generateTestKeyPair();
    jwks = await startMockJwksServer(keys.publicJwk);

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthTestController],
      providers: [
        Reflector,
        {
          provide: JwtValidatorService,
          useValue: new JwtValidatorService({
            jwksUri: `${jwks.url}/.well-known/jwks.json`,
            issuer: 'https://test.supabase.local/auth/v1',
            audience: 'authenticated',
          }),
        },
        { provide: APP_GUARD, useClass: SupabaseAuthGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await jwks.close();
  });

  it('returns 401 without Authorization header', async () => {
    const res = await request(app.getHttpServer()).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed Authorization header', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', 'Basic abc123');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.jwt.token');
    expect(res.status).toBe(401);
  });

  it('returns user claims with valid JWT', async () => {
    const token = await signTestJwt(keys.privateKey, keys.kid, {
      sub: 'user-uuid-xyz',
      email: 'runner@mid.cm',
    });
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ sub: 'user-uuid-xyz', email: 'runner@mid.cm' });
  });
});
```

- [ ] **Step 9: Lancer les tests — tous doivent passer**

```bash
pnpm --filter @mid/api test
```

Expected: 14 tests (3 health + 2 filter + 5 jwt-validator + 4 auth-test E2E).

- [ ] **Step 10: Vérifier en HTTP**

```bash
pnpm --filter @mid/api start &
sleep 5
curl -s -i http://localhost:3000/api/auth/me  # 401 attendu
curl -s -i http://localhost:3000/api/healthz  # 200 attendu (public)
```

Tuer le process.

- [ ] **Step 11: Lint + typecheck**

```bash
pnpm --filter @mid/api lint
pnpm --filter @mid/api typecheck
```

- [ ] **Step 12: Commit**

```bash
git add apps/api/src
git commit -m "feat(api): add global auth guard, @CurrentUser decorator and protected route"
```

---

## Task 12: BullMQ — queue + sample job + readiness Redis

**Files:**
- Create: `apps/api/src/queues/queues.constants.ts`
- Create: `apps/api/src/queues/jobs/sample.processor.ts`
- Create: `apps/api/src/queues/jobs/sample.processor.spec.ts`
- Create: `apps/api/src/queues/queues.module.ts`
- Create: `apps/api/src/queues/redis-health.service.ts`
- Modify: `apps/api/src/health/health.controller.ts` (brancher check Redis)
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/health/health.controller.spec.ts`

- [ ] **Step 1: Créer `apps/api/src/queues/queues.constants.ts`**

```typescript
export const QUEUE_NAMES = {
  SAMPLE: 'sample',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
```

- [ ] **Step 2: Créer `apps/api/src/queues/jobs/sample.processor.ts`**

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

import { QUEUE_NAMES } from '../queues.constants';

export type SampleJobData = { message: string };
export type SampleJobResult = { processed: true; echo: string; receivedAt: string };

@Processor(QUEUE_NAMES.SAMPLE)
export class SampleProcessor extends WorkerHost {
  private readonly logger = new Logger(SampleProcessor.name);

  async process(job: Job<SampleJobData, SampleJobResult>): Promise<SampleJobResult> {
    this.logger.log(`Processing job ${job.id}: ${job.data.message}`);
    return Promise.resolve({
      processed: true,
      echo: job.data.message,
      receivedAt: new Date().toISOString(),
    });
  }
}
```

- [ ] **Step 3: Écrire le test du processor (unit)**

Contenu de `apps/api/src/queues/jobs/sample.processor.spec.ts` :

```typescript
import type { Job } from 'bullmq';
import { describe, expect, it } from 'vitest';

import { SampleProcessor, SampleJobData, SampleJobResult } from './sample.processor';

describe('SampleProcessor', () => {
  it('echoes the message and marks processed', async () => {
    const processor = new SampleProcessor();
    const job = { id: 'job-1', data: { message: 'hello' } } as Job<SampleJobData, SampleJobResult>;
    const result = await processor.process(job);
    expect(result.processed).toBe(true);
    expect(result.echo).toBe('hello');
    expect(typeof result.receivedAt).toBe('string');
  });
});
```

- [ ] **Step 4: Créer `apps/api/src/queues/redis-health.service.ts`**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { Env } from '../config/env.schema';

@Injectable()
export class RedisHealthService {
  private readonly logger = new Logger(RedisHealthService.name);
  private readonly client: Redis;

  constructor(config: ConfigService<Env, true>) {
    this.client = new Redis(config.get('REDIS_URL', { infer: true }), {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
  }

  async ping(): Promise<boolean> {
    try {
      if (this.client.status === 'wait' || this.client.status === 'end') {
        await this.client.connect();
      }
      const pong = await this.client.ping();
      return pong === 'PONG';
    } catch (error) {
      this.logger.warn(`Redis ping failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
}
```

- [ ] **Step 5: Créer `apps/api/src/queues/queues.module.ts`**

```typescript
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Env } from '../config/env.schema';

import { SampleProcessor } from './jobs/sample.processor';
import { QUEUE_NAMES } from './queues.constants';
import { RedisHealthService } from './redis-health.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const url = new URL(config.get('REDIS_URL', { infer: true }));
        return {
          connection: {
            host: url.hostname,
            port: Number(url.port || '6379'),
            password: url.password || undefined,
            db: url.pathname && url.pathname.length > 1 ? Number(url.pathname.slice(1)) : 0,
          },
        };
      },
    }),
    BullModule.registerQueue({ name: QUEUE_NAMES.SAMPLE }),
  ],
  providers: [SampleProcessor, RedisHealthService],
  exports: [BullModule, RedisHealthService],
})
export class QueuesModule {}
```

- [ ] **Step 6: Mettre à jour le health controller**

Contenu de `apps/api/src/health/health.controller.ts` :

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { RedisHealthService } from '../queues/redis-health.service';

type Liveness = {
  status: 'ok';
  uptime: number;
  version: string;
  timestamp: string;
};

type ReadinessCheck = {
  postgres: 'up' | 'down';
  redis: 'up' | 'down';
};

type Readiness = {
  status: 'ok' | 'degraded';
  checks: ReadinessCheck;
  timestamp: string;
};

@ApiTags('health')
@Public()
@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisHealthService,
  ) {}

  @Get('healthz')
  liveness(): Liveness {
    return {
      status: 'ok',
      uptime: process.uptime(),
      version: process.env.npm_package_version ?? '0.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readyz')
  async readiness(): Promise<Readiness> {
    const [postgresUp, redisUp] = await Promise.all([this.prisma.ping(), this.redis.ping()]);
    return {
      status: postgresUp && redisUp ? 'ok' : 'degraded',
      checks: { postgres: postgresUp ? 'up' : 'down', redis: redisUp ? 'up' : 'down' },
      timestamp: new Date().toISOString(),
    };
  }
}
```

- [ ] **Step 7: Mettre à jour le test health**

Contenu de `apps/api/src/health/health.controller.spec.ts` :

```typescript
import { Test } from '@nestjs/testing';
import { describe, expect, it, beforeAll, vi } from 'vitest';

import { PrismaService } from '../prisma/prisma.service';
import { RedisHealthService } from '../queues/redis-health.service';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  const prismaPing = vi.fn();
  const redisPing = vi.fn();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: { ping: prismaPing } },
        { provide: RedisHealthService, useValue: { ping: redisPing } },
      ],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it('liveness returns ok with version and uptime', () => {
    const result = controller.liveness();
    expect(result.status).toBe('ok');
    expect(typeof result.uptime).toBe('number');
    expect(result.uptime).toBeGreaterThan(0);
  });

  it('readiness ok when both deps up', async () => {
    prismaPing.mockResolvedValueOnce(true);
    redisPing.mockResolvedValueOnce(true);
    const result = await controller.readiness();
    expect(result.status).toBe('ok');
    expect(result.checks).toEqual({ postgres: 'up', redis: 'up' });
  });

  it('readiness degraded when postgres down', async () => {
    prismaPing.mockResolvedValueOnce(false);
    redisPing.mockResolvedValueOnce(true);
    const result = await controller.readiness();
    expect(result.status).toBe('degraded');
    expect(result.checks.postgres).toBe('down');
  });

  it('readiness degraded when redis down', async () => {
    prismaPing.mockResolvedValueOnce(true);
    redisPing.mockResolvedValueOnce(false);
    const result = await controller.readiness();
    expect(result.status).toBe('degraded');
    expect(result.checks.redis).toBe('down');
  });
});
```

- [ ] **Step 8: Mettre à jour `app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { AuthTestController } from './auth/auth-test.controller';
import { SupabaseAuthGuard } from './auth/guards/supabase-auth.guard';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './logging/logger.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueuesModule } from './queues/queues.module';

@Module({
  imports: [ConfigModule, LoggerModule, PrismaModule, QueuesModule, AuthModule, HealthModule],
  controllers: [AuthTestController],
  providers: [{ provide: APP_GUARD, useClass: SupabaseAuthGuard }],
})
export class AppModule {}
```

- [ ] **Step 9: Lancer les tests**

```bash
pnpm --filter @mid/api test
```

Expected: 16 tests (4 health + 2 filter + 5 jwt + 4 auth-test E2E + 1 sample processor).

- [ ] **Step 10: Vérifier la queue en HTTP** (smoke test rapide)

Démarrer la stack :
```bash
pnpm db:up
pnpm --filter @mid/api start &
sleep 5
curl -s http://localhost:3000/api/readyz | jq .
```

Expected: `{"status":"ok","checks":{"postgres":"up","redis":"up"}}`.

Tuer le process.

- [ ] **Step 11: Lint + typecheck**

```bash
pnpm --filter @mid/api lint
pnpm --filter @mid/api typecheck
```

- [ ] **Step 12: Commit**

```bash
git add apps/api/src
git commit -m "feat(api): add BullMQ queues, sample processor and redis healthcheck"
```

---

## Task 13: OpenAPI Swagger UI

**Files:**
- Modify: `apps/api/src/main.ts`

- [ ] **Step 1: Modifier `apps/api/src/main.ts`** pour ajouter Swagger

```typescript
import { initSentry } from './sentry/sentry.bootstrap';
initSentry();

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MID API')
    .setDescription('Marathon International de Douala — API officielle')
    .setVersion('0.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addTag('health', 'Liveness and readiness probes')
    .addTag('auth', 'Authentication-related endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/openapi.json',
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  app.get(Logger).log(`API listening on http://localhost:${port}/api`, 'Bootstrap');
  app.get(Logger).log(`Swagger UI at http://localhost:${port}/docs`, 'Bootstrap');
}

void bootstrap();
```

- [ ] **Step 2: Vérifier**

```bash
pnpm db:up
pnpm --filter @mid/api start &
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/docs/openapi.json
curl -s http://localhost:3000/docs/openapi.json | jq '.info.title'
```

Expected : `200`, et `"MID API"`.

Ouvre `http://localhost:3000/docs` dans un navigateur — Swagger UI doit s'afficher avec les tags `health` et `auth`.

Tuer le process.

- [ ] **Step 3: Lint + typecheck**

```bash
pnpm --filter @mid/api lint
pnpm --filter @mid/api typecheck
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src
git commit -m "feat(api): expose OpenAPI specification and Swagger UI on /docs"
```

---

## Task 14: Dockerfile multi-stage prod

**Files:**
- Create: `apps/api/Dockerfile`

- [ ] **Step 1: Créer `apps/api/Dockerfile`**

```dockerfile
# syntax=docker/dockerfile:1.7

# === Stage 1: build the monorepo ===
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /repo

# Copy everything needed to install + build the whole monorepo
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc turbo.json tsconfig.base.json ./
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/shared-types/package.json packages/shared-types/
COPY apps/api/package.json apps/api/

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Now copy sources
COPY packages/eslint-config packages/eslint-config
COPY packages/shared-types packages/shared-types
COPY apps/api apps/api

# Generate prisma client + build api
RUN pnpm --filter @mid/shared-types build
RUN pnpm --filter @mid/api prisma:generate
RUN pnpm --filter @mid/api build

# === Stage 2: production runtime ===
FROM node:22-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
RUN apk add --no-cache dumb-init

WORKDIR /app

# Install only production deps for api (deploy strips workspace symlinks)
COPY --from=builder /repo/apps/api/package.json ./
COPY --from=builder /repo/pnpm-lock.yaml ./
COPY --from=builder /repo/package.json /tmp/root-package.json
COPY --from=builder /repo/pnpm-workspace.yaml /tmp/

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

# Copy built artifacts
COPY --from=builder /repo/apps/api/dist ./dist
COPY --from=builder /repo/apps/api/prisma ./prisma
COPY --from=builder /repo/packages/shared-types/dist ./node_modules/@mid/shared-types/dist
COPY --from=builder /repo/packages/shared-types/package.json ./node_modules/@mid/shared-types/

# Non-root user
RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -s /bin/sh -D nodejs
USER nodejs

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q --spider http://localhost:3000/api/healthz || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

- [ ] **Step 2: Build l'image en local**

Depuis la racine du repo :
```bash
docker build -t mid-api:dev -f apps/api/Dockerfile .
```

Expected: build réussit en 2-5 min (premier build, les builds suivants seront cachés). Image finale ~150-250 MB.

```bash
docker images mid-api:dev
```

- [ ] **Step 3: Lancer le container et vérifier le boot**

S'assurer que Postgres + Redis tournent (`pnpm db:up`), puis :
```bash
docker run --rm -it \
  --name mid-api-test \
  -p 3001:3000 \
  -e DATABASE_URL=postgresql://mid:mid_dev_password@host.docker.internal:5432/mid_dev \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  -e SUPABASE_URL=https://test.supabase.local \
  -e SUPABASE_ANON_KEY=test-key \
  -e NODE_ENV=production \
  mid-api:dev &

sleep 8
curl -s http://localhost:3001/api/healthz | jq .
curl -s http://localhost:3001/api/readyz | jq .
```

Expected :
- `healthz` → `{"status":"ok",...}`
- `readyz` → `{"status":"ok","checks":{"postgres":"up","redis":"up"}}`

Note: sur Linux pur (pas Docker Desktop Windows/Mac), `host.docker.internal` n'est pas résolu — utiliser `--network host` ou l'IP de l'hôte. Sur Docker Desktop Windows, ça marche out-of-the-box.

Tuer le container :
```bash
docker kill mid-api-test
```

- [ ] **Step 4: Vérifier la taille et le contenu**

```bash
docker images mid-api:dev --format "{{.Size}}"
```

Expected : entre 150 et 300 MB. Si > 500 MB, vérifier le `.dockerignore`.

- [ ] **Step 5: Commit**

```bash
git add apps/api/Dockerfile
git commit -m "feat(api): add multi-stage production Dockerfile"
```

---

## Task 15: Vérification finale + push branche + PR + tag

- [ ] **Step 1: Sanity check complet en local**

```bash
pnpm install
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: tout passe.

- [ ] **Step 2: Vérifier que toute la stack tourne**

```bash
pnpm db:up
pnpm --filter @mid/api start &
sleep 5
curl -s http://localhost:3000/api/healthz | jq .
curl -s http://localhost:3000/api/readyz | jq .
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/docs/openapi.json
# Tuer le node
```

Expected: tous les endpoints répondent.

- [ ] **Step 3: Push la branche feature**

```bash
git push -u origin phase0/plan2-api-nestjs
```

- [ ] **Step 4: Ouvrir une PR via gh CLI**

```bash
gh pr create \
  --title "feat(api): Phase 0 Plan 2 — NestJS API skeleton" \
  --body "$(cat <<'EOF'
## Summary

Implements Plan 2/5 of the MID monorepo (NestJS API skeleton).

- NestJS 11 boot with config validation (Zod), Pino logger, Sentry, global exception filter
- Health endpoints (\`/healthz\` liveness, \`/readyz\` readiness with Postgres + Redis checks)
- Supabase JWT auth (JWKS validation via jose) with global guard + \`@Public()\` + \`@CurrentUser()\` decorators
- Prisma 6 with initial User model and migration
- BullMQ queues with sample processor
- OpenAPI 3 spec auto-generated, served at \`/docs\`
- Multi-stage Dockerfile (production image ~200 MB)
- 16 tests passing (unit + E2E with mock JWKS)

See \`docs/superpowers/plans/2026-05-27-phase0-plan2-api-nestjs.md\` for full task breakdown.

## Test plan

- [x] \`pnpm test\` green (16 tests)
- [x] \`pnpm build\` succeeds
- [x] \`pnpm --filter @mid/api start\` boots; health endpoints respond
- [x] \`/docs/openapi.json\` returns valid OpenAPI 3 JSON
- [x] \`docker build\` succeeds and container runs

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: Attendre la CI sur la PR**

```bash
gh pr checks --watch
```

Expected: tous les checks passent.

- [ ] **Step 6: Merger la PR (squash)**

```bash
gh pr merge --squash --delete-branch
```

- [ ] **Step 7: Récupérer le main mergé**

```bash
git checkout main
git pull
```

- [ ] **Step 8: Tag annotated de fin de plan**

```bash
git tag -a phase0-plan2-api -m "Phase 0 — Plan 2 : NestJS API skeleton complete"
git push --tags
```

- [ ] **Step 9: Vérification finale CI verte**

```bash
gh run list --repo Franck-F/MID_Mobile_App --branch main --limit 1
```

Expected: dernière run sur main = `success`.

---

## Self-review du plan

**Coverage du spec :**

- Section 7.1 (Stack technique API) → Tasks 1-13 (NestJS, Prisma, Vitest, BullMQ, OpenAPI, PDF — sauf PDF différé) ✅
- Section 7.2 (10 modules métier) → squelette uniquement (auth, health, prisma, queues, config, logging). Les 6 autres modules (users, races, registrations, payments, results, content, notifications, admin, tracking ingestion) sont l'objet de plans futurs. ⚠️ explicitement hors-scope.
- Section 7.3 (Auth flow) → Tasks 10-11 (JWT validation JWKS, AuthGuard) ✅
- Section 7.4 (Background jobs BullMQ) → Task 12 (squelette uniquement, jobs métier différés) ✅
- Section 11.1 (Sécurité) → CORS, rate limiting, audit log → différés à un plan ultérieur. Auth + transport HTTPS → couverts en infra (Plan 5). ⚠️ noté.

**Placeholders scan :** aucun "TBD" ou "à compléter" caché. Les zones hors-scope sont explicitement mentionnées et renvoyées à des plans futurs.

**Type consistency :**
- `SupabaseClaims` défini en Task 10, réutilisé en Task 11 ✅
- `Env` défini en Task 3, réutilisé en Tasks 4, 10, 12 ✅
- `QUEUE_NAMES.SAMPLE` défini en Task 12 step 1, utilisé en step 2 et 5 ✅
- `Liveness`/`Readiness` types redéfinis en Task 9 et 12 (évolution incrémentale du health controller). Vérifier que la version finale (Task 12) est la définitive — oui ✅

**Risques d'exécution identifiés :**
- **Task 1** : si pnpm refuse à cause de conflicts NestJS 11 peer deps, l'implementer devra ajuster les versions à la marge (mineures uniquement). Documenter dans le commit.
- **Task 8** : `pnpm prisma:migrate:dev` exige que `apps/api/.env` existe avec `DATABASE_URL`. Vérifier en Step 3.
- **Task 11 Step 6** : si on rend HealthController public via `@Public()` mais que `AuthModule` n'est pas encore importé dans `AppModule` à ce stade, il y aura une erreur DI. L'ordre des steps gère ça (AuthModule importé en Step 5 AVANT que HealthController soit modifié en Step 6).
- **Task 14** : le Dockerfile suppose que `host.docker.internal` est résolu, ce qui est vrai sur Docker Desktop Windows/Mac mais pas sur Linux. La doc le mentionne.
- **Task 15** : ouverture PR via gh nécessite que `gh` soit authentifié. Si pas, basculer en push manuel + PR via navigateur.

**Améliorations différées (notées pour plan futur)** :
- Rate limiter global (@nestjs/throttler) — Plan métier
- Audit log immutable des actions admin — Plan métier `admin`
- CORS configuration stricte — Plan 5 (infra)
- Helmet / CSRF protection — Plan 5 (infra)
- Métriques Prometheus + healthcheck enrichi — Plan 5 (observabilité prod)

---

## Done — Phase 0 Plan 2/5 livré

À la fin de ce plan :
- ✅ API NestJS bootable, configurée, observée
- ✅ Auth Supabase JWT fonctionnel et testé
- ✅ Prisma branché, première migration, healthcheck Postgres+Redis
- ✅ BullMQ prêt pour la suite, sample processor testé
- ✅ OpenAPI auto-générée sur `/docs`
- ✅ Image Docker prod buildable
- ✅ 16 tests verts, CI verte
- ✅ Tag `phase0-plan2-api`

**Plan suivant :** Phase 0 — Plan 3/5 : Tracking service skeleton (Express + Socket.io + Redis adapter + interpolation stub + Dockerfile).
