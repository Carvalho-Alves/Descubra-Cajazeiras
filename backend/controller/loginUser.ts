import { Request, Response, NextFunction } from 'express';
import { loginSchema } from '../validations/uservalidation';
import { loginUserService } from '../service/userService';
import jwt from 'jsonwebtoken';
import { env } from '../database/env';

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedBody = loginSchema.parse(req.body);
        const user = await loginUserService(validatedBody);
        const payload = {
            sub: user._id.toString(),
            email: user.email
        };
        const secret = (env as any).JWT_ACCESS_SECRET || 'dev-secret';
        const token = jwt.sign(payload, secret, {
            expiresIn: '1h' // 
        });
        return res.status(200).json({
            message: 'Login bem-sucedido!',
            user: {
                _id: user._id,
                email: user.email,
                nome: user.nome
            },
            token: token
        });

    } catch (error) {
        next(error);
    }
};