import neo4j, { Driver } from 'neo4j-driver';
import { env } from './env';

let driver: Driver | null = null;

export function getNeo4jDriver(): Driver {
  const enabled = (process.env.NEO4J_ENABLED || 'false').toLowerCase() === 'true';
  if (!enabled) {
    throw new Error('Neo4j desabilitado (NEO4J_ENABLED=false).');
  }

  if (!driver) {
    const encEnv = String(process.env.NEO4J_ENCRYPTION || 'off').toLowerCase();
    const encrypted = encEnv === 'on' ? 'ENCRYPTION_ON' : 'ENCRYPTION_OFF';
    driver = neo4j.driver(
      env.NEO4J_URI,
      neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD),
      { encrypted: encrypted as any }
    );
  }
  return driver;
}

export async function closeNeo4j(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}