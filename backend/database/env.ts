import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string().default('dev-secret'),
  JWT_ACCESS_SECRET: z.string().optional(),
  MONGODB_URI: z.string().default(''),
  MONGODB_DB_NAME: z.string().default(''),
  NEO4J_URI: z.string().default('bolt://localhost:7687'),
  NEO4J_USER: z.string().default('neo4j'),
  NEO4J_PASSWORD: z.string().default('neo4j')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    '❌ Erro nas variáveis de ambiente:',
    parsedEnv.error.issues
  );
  throw new Error('Variáveis de ambiente inválidas.');
}

export const env = parsedEnv.data;