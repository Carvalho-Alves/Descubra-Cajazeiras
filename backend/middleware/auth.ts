import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../database/env';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

export function ensureAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ erro: 'Token não informado' });
  const [, token] = auth.split(' ');
  
    const secret = (env as any).JWT_ACCESS_SECRET || (env as any).JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret) as any;
    req.userId = payload.sub || payload.id;
    req.userEmail = payload.email;
    return next();
  }