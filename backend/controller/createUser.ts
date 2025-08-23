import { Request, Response, NextFunction } from 'express';
import { registerSchema } from '../validations/uservalidation';
import { createUserService } from '../service/userService';

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const foto = req.file ? req.file.path : undefined;
        const userData = { ...req.body, foto };
        const validatedBody = registerSchema.parse(userData);
        const newUser = await createUserService(validatedBody);
        
        return res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
};