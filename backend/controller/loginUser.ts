import { Request, Response, NextFunction } from 'express';
import { loginSchema } from '../validations/uservalidation';
import { loginUserService } from '../service/userService';
import jwt from 'jsonwebtoken';
import { env } from '../database/env';

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    const validatedBody = loginSchema.parse(req.body);
    const user = await loginUserService(validatedBody);
    const payload = {
        sub: user._id.toString(),
        email: user.email,
        role: user.role
    };
    const secret = (env as any).JWT_ACCESS_SECRET || 'dev-secret';
    const token = jwt.sign(payload, secret, {
        expiresIn: '1h'
    });
    return res.status(200).json({
        message: 'Login bem-sucedido!',
        user: {
            _id: user._id,
            email: user.email,
            nome: user.nome,
            role: user.role,
            foto: ((): string | undefined => {
                const f = (user as any).foto as string | undefined;
                if (!f) return undefined;
                // Normaliza separadores e recorta a partir de '/uploads/' se existir
                const normalized = f.replace(/\\\\/g, '/');
                const idx = normalized.lastIndexOf('/uploads/');
                const url = idx >= 0 ? normalized.substring(idx) : normalized;
                return url.startsWith('/') ? url : `/${url}`;
            })()
        },
        token: token
    });
};