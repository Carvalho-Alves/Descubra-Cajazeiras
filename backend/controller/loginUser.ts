import { Request, Response, NextFunction } from 'express';
import { loginSchema } from '../validations/uservalidation'; // Supondo que você tenha um schema para login
import { loginUserService } from '../service/userService';

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  
    const validatedBody = loginSchema.parse(req.body);
    const loginResult = await loginUserService(validatedBody);
    return res.status(200).json(loginResult);
  };