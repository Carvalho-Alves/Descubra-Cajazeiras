import { Request, Response, NextFunction } from 'express';
import { findUserService as findUserService } from '../service/userService';

export const findUser = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await findUserService(id);
    if (!user) {
        const error: any = new Error('Usuário não encontrado.');
        error.statusCode = 404;
        throw error;
    }
    return res.status(200).json(user);
};