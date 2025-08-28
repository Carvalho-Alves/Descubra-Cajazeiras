import { Request, Response, NextFunction } from 'express';
import { findUsersService as findUsersService } from '../service/userService';

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  
    const users = await findUsersService();
    return res.status(200).json(users);
};