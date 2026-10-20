import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  API_PORT: z.coerce.number().int().min(1).max(65535),
  API_CORS_ORIGIN: z.string().url(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),
  CONTENT_CACHE_MAX_AGE_SECONDS: z.coerce.number().int().min(0).max(86400).default(300),
});

export type AppConfig = z.infer<typeof environmentSchema>;

export function loadEnv(source: Record<string, string | undefined>): AppConfig {
  const result = environmentSchema.safeParse(source);
  if (result.success) return result.data;

  const invalidVariables = new Set(
    result.error.issues.map((issue) => issue.path[0]).filter((value): value is string => typeof value === 'string'),
  );
  const variables = ['NODE_ENV', 'API_PORT', 'API_CORS_ORIGIN', 'LOG_LEVEL', 'CONTENT_CACHE_MAX_AGE_SECONDS'].filter(
    (name) => invalidVariables.has(name),
  );
  throw new Error(`Configuração inválida. Verifique: ${variables.join(', ')}.`);
}
