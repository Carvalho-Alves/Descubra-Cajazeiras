import { Request, Response, NextFunction } from 'express';
import { registerSchema } from '../validations/uservalidation';
import { createUserService } from '../service/userService';
import jwt from 'jsonwebtoken';
import { env } from '../database/env';

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const foto = req.file ? req.file.path : undefined;
        const userData = { ...req.body, foto };
        const validatedBody = registerSchema.parse(userData);
        const newUser = await createUserService(validatedBody);
        const payload = { 
            sub: newUser._id.toString(),
            email: newUser.email 
        };
        const secret = (env as any).JWT_ACCESS_SECRET || 'dev-secret';
        const token = jwt.sign(payload, secret, {
            expiresIn: '1h'
        });
        return res.status(201).json({
            message: 'Usuário registrado com sucesso!',
            user: newUser,
            token: token
        });

    } catch (error) {
        next(error);
    }
};