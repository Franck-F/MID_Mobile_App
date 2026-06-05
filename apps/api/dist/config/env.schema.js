"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const zod_1 = require("zod");
exports.envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
    LOG_LEVEL: zod_1.z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    DATABASE_URL: zod_1.z.string().url(),
    REDIS_URL: zod_1.z.string().url(),
    SUPABASE_URL: zod_1.z.string().url(),
    SUPABASE_ANON_KEY: zod_1.z.string().min(1),
    SUPABASE_JWT_AUDIENCE: zod_1.z.string().default('authenticated'),
    SENTRY_DSN: zod_1.z.string().optional(),
    SENTRY_ENVIRONMENT: zod_1.z.string().default('development'),
    SENTRY_TRACES_SAMPLE_RATE: zod_1.z.coerce.number().min(0).max(1).default(0.1),
});
//# sourceMappingURL=env.schema.js.map