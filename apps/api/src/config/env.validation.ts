import type { Env } from './env.schema';
import { envSchema } from './env.schema';

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const formatted = result.error.format();
    console.error('❌ Invalid environment variables:', JSON.stringify(formatted, null, 2));
    throw new Error('Invalid environment variables — see logs above');
  }
  return result.data;
}
