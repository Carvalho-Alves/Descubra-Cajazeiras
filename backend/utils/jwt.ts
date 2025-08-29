import jwt from 'jsonwebtoken';
import { env } from '../database/env';

export function signAccessToken(sub: string, email: string) {
  const secret = (env as any).JWT_ACCESS_SECRET || (env as any).JWT_SECRET || 'dev-secret';
  const expiresIn = (env as any).JWT_EXPIRES_IN || '60m';
  return jwt.sign({ sub, email }, secret, { expiresIn });
}

export function signRefreshToken(sub: string) {
  const secret = (env as any).JWT_REFRESH_SECRET || (env as any).JWT_SECRET || 'dev-secret';
  const expiresIn = (env as any).JWT_REFRESH_EXPIRES_IN || '30d';
  return jwt.sign({ sub }, secret, { expiresIn });
}

export function verifyAccessToken(token: string) {
  const secret = (env as any).JWT_ACCESS_SECRET || (env as any).JWT_SECRET || 'dev-secret';
  return jwt.verify(token, secret);
}