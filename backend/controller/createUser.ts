import { Request, Response, NextFunction } from 'express';
import { registerSchema } from '../validations/uservalidation';
import { createUserService } from '../service/userService';

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  
    const validatedBody = registerSchema.parse(req.body);
    const newUser = await createUserService(validatedBody);
    return res.status(201).json(newUser);
  };