import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../database/env';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      user?: any;
    }
  }
}

export function ensureAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ erro: 'Token não informado' });
    }

    const [, token] = authHeader.split(' ');
    if (!token) {
      return res.status(401).json({ erro: 'Token inválido' });
    }

    const secret =
      env.JWT_ACCESS_SECRET ||
      env.JWT_SECRET ||
      'dev-secret';

    const payload = jwt.verify(token, secret) as any;
    const userId = payload.sub || payload.id || payload._id;

    if (!userId) {
      // Esta é a linha mais importante. Ela revela o problema na geração do token.
      return res.status(401).json({ erro: 'Token inválido: ID de usuário não encontrado.' });
    }

    req.userId = userId;
    req.userEmail = payload.email;
    req.user = payload;

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ erro: 'Token expirado' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ erro: 'Token inválido' });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({ erro: 'Erro interno na autenticação' });
  }
}

/** Permite a operação apenas para o próprio usuário (params.id) ou Admin. */
export function ensureSelfOrAdmin(paramName = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    const targetId = req.params[paramName];
    const userId = req.userId || req.user?.sub;

    if (!userId) {
      return res.status(401).json({ erro: 'Não autenticado' });
    }

    const isSelf = String(userId) === String(targetId);
    const isAdmin = req.user?.role === 'Admin';

    if (isSelf || isAdmin) {
      return next();
    }

    return res.status(403).json({ erro: 'Sem permissão para esta operação.' });
  };
}