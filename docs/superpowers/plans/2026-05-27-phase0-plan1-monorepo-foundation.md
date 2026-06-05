# Phase 0 — Plan 1/4 : Fondations monorepo + CI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mettre en place un monorepo pnpm + Turborepo vide mais fonctionnel, avec configuration TS/lint/format partagée, un premier package `shared-types`, un docker-compose pour Postgres+Redis locaux, et une CI GitHub Actions qui exécute lint + type-check + tests sur chaque PR.

**Architecture:** Monorepo unique `mid-app/` géré par **pnpm workspaces** + **Turborepo** pour les builds incrémentaux. Configurations partagées (TS, ESLint, Prettier) extraites en packages réutilisables. Tests avec **Vitest** (rapide, ESM-friendly, compatible monorepo). CI **GitHub Actions** avec cache pnpm + cache Turbo.

**Tech Stack:** Node.js 22 LTS · pnpm 9 · Turborepo 2 · TypeScript 5.6 · ESLint 9 · Prettier 3 · Vitest 2 · Husky 9 · commitlint · Docker · GitHub Actions

**Deliverable de ce plan :** un repo Git vierge prêt à accueillir les 4 apps (api, tracking, admin, mobile) avec :
- Lint + format + commit hooks fonctionnels en local
- Un package `shared-types` avec un premier schema Zod testé
- Postgres + Redis qui démarrent en local via `docker compose up`
- CI verte sur la première PR de test

**Pré-requis avant de démarrer :**
- Node.js 22 LTS installé (`node --version` → v22.x)
- pnpm 9 installé (`pnpm --version` → 9.x ; sinon `npm i -g pnpm@9`)
- Git installé
- Docker Desktop installé et lancé
- Compte GitHub avec un repo vide créé (par ex. `tarasports/mid-app`)

---

## Task 1: Initialiser le dépôt Git et les fichiers racine

**Files:**
- Create: `.gitignore`
- Create: `.gitattributes`
- Create: `.nvmrc`
- Create: `.editorconfig`
- Create: `LICENSE`
- Create: `README.md`

- [ ] **Step 1: Initialiser le dépôt Git**

Run (depuis `C:\Users\Franck\Documents\App-Mobile-MID`) :
```bash
git init -b main
```
Expected: `Initialized empty Git repository in .../App-Mobile-MID/.git/`

- [ ] **Step 2: Créer `.gitignore`**

Contenu de `.gitignore` :
```gitignore
# Dependencies
node_modules/
.pnp/
.pnp.js
.pnpm-store/

# Build artifacts
dist/
build/
out/
.next/
.turbo/
.expo/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local
!.env.example

# Logs
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
.DS_Store
Thumbs.db

# Tests
coverage/
.nyc_output/

# Superpowers brainstorm artifacts
.superpowers/

# OS
*.swp
*.swo

# Mobile platform-specific
*.orig
*.jks
*.p8
*.p12
*.key
*.mobileprovision
ios/Pods/
android/build/
android/.gradle/

# Terraform
*.tfstate
*.tfstate.*
.terraform/
.terraform.lock.hcl
```

- [ ] **Step 3: Créer `.gitattributes`**

Contenu de `.gitattributes` :
```
* text=auto eol=lf
*.{cmd,[cC][mM][dD]} text eol=crlf
*.{bat,[bB][aA][tT]} text eol=crlf
*.ps1 text eol=crlf
```

- [ ] **Step 4: Créer `.nvmrc`**

Contenu de `.nvmrc` :
```
22
```

- [ ] **Step 5: Créer `.editorconfig`**

Contenu de `.editorconfig` :
```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

- [ ] **Step 6: Créer `LICENSE`**

Contenu de `LICENSE` (placeholder propriétaire à confirmer avec TARA) :
```
Copyright (c) 2026 TARA Sport and Events

All rights reserved.

This source code is proprietary to TARA Sport and Events and may not be
copied, modified, distributed, or used without explicit written permission
from TARA Sport and Events.

Contact: contact@tarasportsent.com (à confirmer)
```

- [ ] **Step 7: Créer `README.md` minimal (sera enrichi en Task 13)**

Contenu de `README.md` :
```markdown
# Marathon International de Douala — Application officielle

Monorepo de l'application mobile officielle du Marathon International de Douala (MID),
organisé par TARA Sport and Events.

Documentation complète : voir `docs/superpowers/specs/2026-05-27-mid-mobile-app-design.md`

## Démarrage rapide

À venir — voir Task 13 du plan `docs/superpowers/plans/2026-05-27-phase0-plan1-monorepo-foundation.md`.
```

- [ ] **Step 8: Premier commit**

```bash
git add .gitignore .gitattributes .nvmrc .editorconfig LICENSE README.md
git commit -m "chore: initial repository setup with gitignore and base config"
```

Expected: commit créé avec hash visible.

---

## Task 2: Configurer pnpm workspaces

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.npmrc`

- [ ] **Step 1: Créer `package.json` racine**

Contenu de `package.json` :
```json
{
  "name": "mid-app",
  "version": "0.0.0",
  "private": true,
  "description": "Marathon International de Douala — monorepo officiel",
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "build": "turbo run build",
    "dev": "turbo run dev",
    "clean": "turbo run clean && rimraf node_modules .turbo"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "typescript": "^5.6.3",
    "rimraf": "^6.0.1"
  }
}
```

- [ ] **Step 2: Créer `pnpm-workspace.yaml`**

Contenu de `pnpm-workspace.yaml` :
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 3: Créer `.npmrc`**

Contenu de `.npmrc` :
```
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=false
node-linker=isolated
prefer-workspace-packages=true
link-workspace-packages=deep
```

- [ ] **Step 4: Créer les répertoires de base**

```bash
mkdir -p apps packages infrastructure/docker .github/workflows docs/runbooks
touch apps/.gitkeep packages/.gitkeep
```

- [ ] **Step 5: Installer les dépendances racine**

```bash
pnpm install
```

Expected: pnpm crée `node_modules/`, `pnpm-lock.yaml`. Pas d'erreur.

- [ ] **Step 6: Vérifier que pnpm voit le workspace**

```bash
pnpm list --depth 0
```

Expected: liste affiche `mid-app@0.0.0`, `turbo@^2.3.0`, `typescript@^5.6.3`, `rimraf@^6.0.1`.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-workspace.yaml .npmrc pnpm-lock.yaml apps/.gitkeep packages/.gitkeep
git commit -m "chore: setup pnpm workspaces with Turborepo and TypeScript"
```

---

## Task 3: Configurer Turborepo

**Files:**
- Create: `turbo.json`

- [ ] **Step 1: Créer `turbo.json`**

Contenu de `turbo.json` :
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local", ".nvmrc", "tsconfig.base.json"],
  "globalEnv": ["NODE_ENV", "CI"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
      "inputs": ["src/**", "tsconfig.json", "package.json"]
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

- [ ] **Step 2: Vérifier que Turbo est opérationnel**

```bash
pnpm turbo run --help
```

Expected: aide Turbo affichée sans erreur.

- [ ] **Step 3: Vérifier qu'une commande no-op fonctionne**

```bash
pnpm turbo run lint
```

Expected: `No tasks were executed as part of this run.` (normal, aucun package n'a encore de script `lint`).

- [ ] **Step 4: Commit**

```bash
git add turbo.json
git commit -m "chore: configure Turborepo task pipeline"
```

---

## Task 4: Configuration TypeScript de base

**Files:**
- Create: `tsconfig.base.json`

- [ ] **Step 1: Créer `tsconfig.base.json`**

Contenu de `tsconfig.base.json` :
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "incremental": true
  },
  "exclude": ["node_modules", "dist", "build", ".next", ".expo", ".turbo"]
}
```

- [ ] **Step 2: Vérifier la syntaxe TS**

```bash
pnpm tsc --noEmit --project tsconfig.base.json
```

Expected: pas d'erreur (peut afficher un warning "no input files" — c'est normal).

- [ ] **Step 3: Commit**

```bash
git add tsconfig.base.json
git commit -m "chore: add strict TypeScript base config"
```

---

## Task 5: Package ESLint partagé

**Files:**
- Create: `packages/eslint-config/package.json`
- Create: `packages/eslint-config/index.mjs`
- Create: `packages/eslint-config/node.mjs`
- Create: `packages/eslint-config/react.mjs`
- Create: `packages/eslint-config/README.md`

- [ ] **Step 1: Créer le répertoire**

```bash
mkdir -p packages/eslint-config
```

- [ ] **Step 2: Créer `packages/eslint-config/package.json`**

```json
{
  "name": "@mid/eslint-config",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./index.mjs",
  "exports": {
    ".": "./index.mjs",
    "./node": "./node.mjs",
    "./react": "./react.mjs"
  },
  "dependencies": {
    "@eslint/js": "^9.15.0",
    "eslint": "^9.15.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.31.0",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^5.0.0",
    "globals": "^15.12.0",
    "typescript-eslint": "^8.16.0"
  }
}
```

- [ ] **Step 3: Créer `packages/eslint-config/index.mjs`** (config TypeScript de base)

```javascript
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    plugins: { import: importPlugin },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  prettier
);
```

- [ ] **Step 4: Créer `packages/eslint-config/node.mjs`** (extension Node)

```javascript
import globals from "globals";

import base from "./index.mjs";

export default [
  ...base,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
```

- [ ] **Step 5: Créer `packages/eslint-config/react.mjs`** (extension React + RN)

```javascript
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

import base from "./index.mjs";

export default [
  ...base,
  {
    plugins: { react, "react-hooks": reactHooks },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];
```

- [ ] **Step 6: Créer `packages/eslint-config/README.md`**

```markdown
# @mid/eslint-config

Configuration ESLint partagée pour le monorepo MID.

## Usage

Dans un package consumer (`apps/api/eslint.config.mjs`) :

```js
import config from "@mid/eslint-config/node";
export default config;
```

Pour React/RN :

```js
import config from "@mid/eslint-config/react";
export default config;
```
```

- [ ] **Step 7: Installer les dépendances**

```bash
pnpm install
```

Expected: les dépendances du package sont installées.

- [ ] **Step 8: Commit**

```bash
git add packages/eslint-config pnpm-lock.yaml
git commit -m "feat(eslint-config): add shared ESLint config package for node and react"
```

---

## Task 6: Prettier

**Files:**
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Modify: `package.json` (add prettier devDep + script)

- [ ] **Step 1: Créer `.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "bracketSameLine": false
}
```

- [ ] **Step 2: Créer `.prettierignore`**

```
node_modules
dist
build
.next
.expo
.turbo
coverage
pnpm-lock.yaml
*.md
.superpowers
```

- [ ] **Step 3: Ajouter Prettier au `package.json` racine**

Dans `package.json`, ajouter dans `devDependencies` :
```json
"prettier": "^3.4.1"
```

Et dans `scripts`, ajouter :
```json
"format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,yml,yaml}\"",
"format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,yml,yaml}\""
```

- [ ] **Step 4: Installer**

```bash
pnpm install
```

- [ ] **Step 5: Vérifier que Prettier tourne**

```bash
pnpm format:check
```

Expected: liste de fichiers vérifiés, tous OK (ou auto-correction par `pnpm format`).

- [ ] **Step 6: Commit**

```bash
git add .prettierrc.json .prettierignore package.json pnpm-lock.yaml
git commit -m "chore: add Prettier formatter config"
```

---

## Task 7: Husky + lint-staged + commitlint (git hooks)

**Files:**
- Create: `.husky/pre-commit`
- Create: `.husky/commit-msg`
- Create: `commitlint.config.mjs`
- Modify: `package.json` (add husky/lint-staged/commitlint devDeps + scripts)

- [ ] **Step 1: Ajouter les devDependencies**

Dans `package.json` `devDependencies` :
```json
"husky": "^9.1.7",
"lint-staged": "^15.2.10",
"@commitlint/cli": "^19.6.0",
"@commitlint/config-conventional": "^19.6.0"
```

Dans `scripts`, ajouter :
```json
"prepare": "husky"
```

Ajouter à la racine de `package.json` :
```json
"lint-staged": {
  "*.{ts,tsx,js,jsx}": ["prettier --write"],
  "*.{json,yml,yaml,md}": ["prettier --write"]
}
```

- [ ] **Step 2: Installer**

```bash
pnpm install
```

Expected: `husky` exécute `prepare`, qui crée `.husky/_/`.

- [ ] **Step 3: Créer le hook `pre-commit`**

```bash
pnpm husky add .husky/pre-commit "pnpm lint-staged"
```

Si la commande échoue (Husky 9 syntaxe), créer manuellement `.husky/pre-commit` :
```bash
pnpm lint-staged
```

Puis :
```bash
chmod +x .husky/pre-commit
```

(Sur Windows, le bit exécutable n'est pas appliqué mais Git pour Windows gère correctement.)

- [ ] **Step 4: Créer le hook `commit-msg`**

Contenu de `.husky/commit-msg` :
```bash
pnpm commitlint --edit "$1"
```

Puis : `chmod +x .husky/commit-msg`

- [ ] **Step 5: Créer `commitlint.config.mjs`**

```javascript
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "perf", "test", "chore", "ci", "build", "revert"],
    ],
    "subject-case": [2, "never", ["upper-case", "start-case", "pascal-case"]],
    "header-max-length": [2, "always", 100],
  },
};
```

- [ ] **Step 6: Tester le hook commit-msg avec un message invalide**

```bash
git commit --allow-empty -m "Bad message"
```

Expected: échec — commitlint refuse car ne respecte pas le format conventional.

- [ ] **Step 7: Tester avec un message valide**

```bash
git commit --allow-empty -m "chore: test commitlint"
```

Expected: succès. Le commit passe.

- [ ] **Step 8: Annuler le commit de test**

```bash
git reset --soft HEAD~1
```

- [ ] **Step 9: Commit définitif**

```bash
git add .husky commitlint.config.mjs package.json pnpm-lock.yaml
git commit -m "chore: add husky, lint-staged and commitlint hooks"
```

---

## Task 8: Package shared-types (premier package métier)

**Files:**
- Create: `packages/shared-types/package.json`
- Create: `packages/shared-types/tsconfig.json`
- Create: `packages/shared-types/eslint.config.mjs`
- Create: `packages/shared-types/vitest.config.ts`
- Create: `packages/shared-types/src/index.ts`
- Create: `packages/shared-types/src/enums.ts`
- Create: `packages/shared-types/src/schemas/race-category.ts`
- Create: `packages/shared-types/src/schemas/race-category.test.ts`

- [ ] **Step 1: Créer le répertoire**

```bash
mkdir -p packages/shared-types/src/schemas
```

- [ ] **Step 2: Créer `packages/shared-types/package.json`**

```json
{
  "name": "@mid/shared-types",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "tsc",
    "clean": "rimraf dist .turbo"
  },
  "dependencies": {
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@mid/eslint-config": "workspace:*",
    "typescript": "^5.6.3",
    "vitest": "^2.1.5",
    "rimraf": "^6.0.1"
  }
}
```

- [ ] **Step 3: Créer `packages/shared-types/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

- [ ] **Step 4: Créer `packages/shared-types/eslint.config.mjs`**

```javascript
import config from "@mid/eslint-config";
export default config;
```

- [ ] **Step 5: Créer `packages/shared-types/vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
```

- [ ] **Step 6: Écrire le premier test (TDD — il doit échouer)**

Contenu de `packages/shared-types/src/schemas/race-category.test.ts` :
```typescript
import { describe, expect, it } from "vitest";

import { RaceCategorySchema } from "./race-category";

describe("RaceCategorySchema", () => {
  it("accepts valid categories", () => {
    expect(RaceCategorySchema.parse("marathon")).toBe("marathon");
    expect(RaceCategorySchema.parse("half_marathon")).toBe("half_marathon");
    expect(RaceCategorySchema.parse("ten_km")).toBe("ten_km");
    expect(RaceCategorySchema.parse("kids_run")).toBe("kids_run");
  });

  it("rejects unknown categories", () => {
    expect(() => RaceCategorySchema.parse("ultra_marathon")).toThrow();
    expect(() => RaceCategorySchema.parse("")).toThrow();
    expect(() => RaceCategorySchema.parse(null)).toThrow();
  });
});
```

- [ ] **Step 7: Installer les dépendances**

```bash
pnpm install
```

- [ ] **Step 8: Lancer le test pour vérifier qu'il échoue**

```bash
pnpm --filter @mid/shared-types test
```

Expected: FAIL avec "Cannot find module './race-category'" ou équivalent.

- [ ] **Step 9: Implémenter le schema**

Contenu de `packages/shared-types/src/schemas/race-category.ts` :
```typescript
import { z } from "zod";

export const RaceCategorySchema = z.enum(["marathon", "half_marathon", "ten_km", "kids_run"]);

export type RaceCategory = z.infer<typeof RaceCategorySchema>;
```

- [ ] **Step 10: Créer l'index public**

Contenu de `packages/shared-types/src/enums.ts` :
```typescript
export const SUPPORTED_LOCALES = ["fr", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const PAYMENT_PROVIDERS = ["orange_momo", "mtn_momo", "card"] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];
```

Contenu de `packages/shared-types/src/index.ts` :
```typescript
export * from "./enums";
export * from "./schemas/race-category";
```

- [ ] **Step 11: Relancer les tests**

```bash
pnpm --filter @mid/shared-types test
```

Expected: PASS — 2 tests passent.

- [ ] **Step 12: Vérifier typecheck et lint**

```bash
pnpm --filter @mid/shared-types typecheck
pnpm --filter @mid/shared-types lint
```

Expected: pas d'erreur.

- [ ] **Step 13: Vérifier que Turbo orchestre correctement**

```bash
pnpm turbo run test lint typecheck
```

Expected: tous OK, mise en cache visible dès la 2ème exécution.

- [ ] **Step 14: Commit**

```bash
git add packages/shared-types pnpm-lock.yaml
git commit -m "feat(shared-types): add package with RaceCategory schema and tests"
```

---

## Task 9: docker-compose pour Postgres + Redis locaux

**Files:**
- Create: `infrastructure/docker/docker-compose.dev.yml`
- Create: `.env.example`

- [ ] **Step 1: Créer `infrastructure/docker/docker-compose.dev.yml`**

```yaml
name: mid-dev

services:
  postgres:
    image: postgres:16-alpine
    container_name: mid-postgres-dev
    restart: unless-stopped
    environment:
      POSTGRES_USER: mid
      POSTGRES_PASSWORD: mid_dev_password
      POSTGRES_DB: mid_dev
    ports:
      - "5432:5432"
    volumes:
      - mid-postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mid -d mid_dev"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: mid-redis-dev
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - mid-redis-data:/data
    command: ["redis-server", "--appendonly", "yes"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  mid-postgres-data:
  mid-redis-data:
```

- [ ] **Step 2: Créer `.env.example` à la racine**

```bash
# Base de données locale (docker-compose)
DATABASE_URL=postgresql://mid:mid_dev_password@localhost:5432/mid_dev

# Redis local (docker-compose)
REDIS_URL=redis://localhost:6379

# Supabase (à remplir avec votre projet)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Sentry (optionnel en dev)
SENTRY_DSN=

# Mode dev
NODE_ENV=development
```

- [ ] **Step 3: Vérifier que Docker démarre les services**

```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
```

Expected: Postgres et Redis démarrent. Vérifier via :
```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml ps
```

Les deux services doivent être en `healthy`.

- [ ] **Step 4: Tester la connexion Postgres**

```bash
docker exec mid-postgres-dev psql -U mid -d mid_dev -c "SELECT version();"
```

Expected: affiche la version PostgreSQL 16.

- [ ] **Step 5: Tester la connexion Redis**

```bash
docker exec mid-redis-dev redis-cli ping
```

Expected: `PONG`.

- [ ] **Step 6: Arrêter les services (on les relancera quand nécessaire)**

```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml down
```

- [ ] **Step 7: Ajouter scripts au `package.json` racine**

Dans `scripts` :
```json
"db:up": "docker compose -f infrastructure/docker/docker-compose.dev.yml up -d",
"db:down": "docker compose -f infrastructure/docker/docker-compose.dev.yml down",
"db:logs": "docker compose -f infrastructure/docker/docker-compose.dev.yml logs -f",
"db:reset": "docker compose -f infrastructure/docker/docker-compose.dev.yml down -v && docker compose -f infrastructure/docker/docker-compose.dev.yml up -d"
```

- [ ] **Step 8: Commit**

```bash
git add infrastructure/docker .env.example package.json
git commit -m "chore: add docker-compose for local Postgres and Redis"
```

---

## Task 10: GitHub Actions — CI lint + typecheck

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Créer `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-typecheck:
    name: Lint & TypeCheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version-file: ".nvmrc"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Format check
        run: pnpm format:check

      - name: Lint
        run: pnpm lint

      - name: TypeCheck
        run: pnpm typecheck

  test:
    name: Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: mid
          POSTGRES_PASSWORD: mid_dev_password
          POSTGRES_DB: mid_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd="pg_isready -U mid -d mid_test"
          --health-interval=5s
          --health-timeout=5s
          --health-retries=5
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd="redis-cli ping"
          --health-interval=5s
          --health-timeout=5s
          --health-retries=5

    env:
      DATABASE_URL: postgresql://mid:mid_dev_password@localhost:5432/mid_test
      REDIS_URL: redis://localhost:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version-file: ".nvmrc"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for lint, typecheck and tests"
```

---

## Task 11: Configurer le remote GitHub et pousser

**Files:** (aucun, c'est une étape ops)

- [ ] **Step 1: Ajouter le remote GitHub**

Remplacer `<USER>/<REPO>` par la vraie URL (par ex. `tarasports/mid-app`) :
```bash
git remote add origin https://github.com/<USER>/<REPO>.git
```

- [ ] **Step 2: Vérifier**

```bash
git remote -v
```

Expected: origin listé en fetch et push.

- [ ] **Step 3: Push initial**

```bash
git push -u origin main
```

Expected: tous les commits sont poussés. La CI démarre automatiquement sur GitHub.

- [ ] **Step 4: Vérifier la CI sur GitHub**

Aller sur la page Actions du repo. Le job `CI` doit passer (lint + typecheck + tests verts).

⚠️ **Si la CI échoue** : ne pas continuer, diagnostiquer le problème (logs CI). Causes typiques :
- Locale différente entre dev et CI (chmod, EOL) → vérifier `.gitattributes`
- pnpm-lock.yaml désynchronisé → `pnpm install` puis recommit
- Variable d'env manquante

---

## Task 12: Configurer Dependabot

**Files:**
- Create: `.github/dependabot.yml`

- [ ] **Step 1: Créer `.github/dependabot.yml`**

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5
    groups:
      dev-dependencies:
        dependency-type: "development"
        update-types: ["minor", "patch"]
      prod-dependencies:
        dependency-type: "production"
        update-types: ["minor", "patch"]
    labels:
      - "dependencies"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
    labels:
      - "dependencies"
      - "ci"
```

- [ ] **Step 2: Commit et push**

```bash
git add .github/dependabot.yml
git commit -m "ci: enable Dependabot for npm and github-actions"
git push
```

---

## Task 13: Enrichir le README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Remplacer `README.md` par version complète**

Contenu de `README.md` :
````markdown
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
````

- [ ] **Step 2: Commit et push**

```bash
git add README.md
git commit -m "docs: write complete onboarding README"
git push
```

---

## Task 14: Vérification finale et tag de phase

- [ ] **Step 1: Sanity check complet**

```bash
pnpm install
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: tout passe sans erreur. Vérifier que Turbo met en cache.

- [ ] **Step 2: Vérifier la propreté du repo**

```bash
git status
```

Expected: `nothing to commit, working tree clean`.

- [ ] **Step 3: Vérifier le contenu du repo**

```bash
git ls-files | sort
```

Expected: liste cohérente avec la structure documentée dans le README. Pas de `node_modules`, pas de `.env`, pas de `dist`.

- [ ] **Step 4: Démarrage Docker complet**

```bash
pnpm db:up
docker compose -f infrastructure/docker/docker-compose.dev.yml ps
```

Expected: postgres + redis healthy. Puis `pnpm db:down`.

- [ ] **Step 5: Tag annotated pour marquer la fin du Plan 1**

```bash
git tag -a phase0-plan1-monorepo -m "Phase 0 — Plan 1 : monorepo foundation complete"
git push --tags
```

- [ ] **Step 6: Vérifier la CI verte sur GitHub**

Aller sur la page Actions, dernière run sur `main` : tout doit être ✅.

---

## Self-review du plan

**Coverage du spec (section 5.4 Organisation monorepo) :**
- ✅ Monorepo Turborepo (Task 3)
- ✅ pnpm workspaces (Task 2)
- ✅ Structure `apps/`, `packages/`, `infrastructure/`, `docs/` (Task 2)
- ✅ `packages/shared-types/` (Task 8)
- ✅ Docker compose dev (Task 9)
- ✅ CI GitHub Actions (Task 10)
- ⚠️ Les autres packages (`ui-mobile`, `ui-admin`) et apps (`api`, `tracking`, `admin`, `mobile`) sont prévus dans les Plans 2-4.

**Placeholders :** aucun "TBD/TODO/à venir" caché — les renvois vers les Plans 2-4 sont explicites.

**Type consistency :** `RaceCategory` est défini une seule fois (Task 8). Pas d'autres types croisés à ce stade.

**Décisions implicites du spec respectées :**
- Node 22, pnpm 9, TypeScript strict, ESLint 9 flat config, Conventional Commits

**Risques / points d'attention pendant l'exécution :**
- **Task 1 Step 1** : si le dossier contient déjà un `.git/` (ex : `git init` antérieur), `git init -b main` est idempotent mais ne change pas la branche existante. Si la branche actuelle est `master`, faire `git branch -m master main`.
- **Task 7 Step 3** : la commande `pnpm husky add` n'existe plus en Husky 9, l'instruction donne le fallback manuel.
- **Task 11** : nécessite un repo GitHub existant ; à créer manuellement avant.
- **Task 7 Step 6-8** : le test du hook commit-msg peut "marquer" l'historique avec un commit annulé — bien vérifier `git log` après l'étape 8.

---

## Done — Phase 0 Plan 1 livré

À la fin de ce plan :
- ✅ Monorepo Turborepo fonctionnel
- ✅ Configuration TS/lint/format partagée
- ✅ Premier package `shared-types` avec test
- ✅ Postgres + Redis disponibles en local via Docker
- ✅ Hooks Git (pre-commit + commit-msg)
- ✅ CI GitHub Actions verte sur PR
- ✅ Dependabot configuré
- ✅ README d'onboarding

**Plan suivant (à créer après exécution de ce plan) :** Phase 0 — Plan 2/4 : API NestJS + Tracking service skeleton (Prisma, Supabase JWT, BullMQ, Socket.io, health checks, Dockerfiles).
