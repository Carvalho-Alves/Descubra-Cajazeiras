import { Request, Response, NextFunction } from 'express';
import { registerSchema } from '../validations/uservalidation';
import { createUserService } from '../service/userService';
import jwt from 'jsonwebtoken';
import { env } from '../database/env';

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    const foto = req.file ? `/uploads/${(req as any).file.filename}` : undefined;
    const userData = { ...req.body, foto };
    const validatedBody = registerSchema.parse(userData);
    const newUser = await createUserService(validatedBody);
    const payload = {
        sub: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
    };
    const secret =
      env.JWT_ACCESS_SECRET ||
      env.JWT_SECRET ||
      'dev-secret';
    const token = jwt.sign(payload, secret, {
        expiresIn: '1h'
    });
    return res.status(201).json({
        message: 'Usuário registrado com sucesso!',
        user: newUser,
        token: token
    });
};