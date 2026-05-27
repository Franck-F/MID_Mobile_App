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
