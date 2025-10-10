import { Request, Response, NextFunction } from 'express';
import { findUsersService as findUsersService } from '../service/userService';

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  
    const users = await findUsersService();

    if (!users) {
        const error: any = new Error('Usuários não encontrados.');
        error.statusCode = 404;
        throw error;
    }
    return res.status(200).json(users);
};