import { Request, Response, NextFunction } from 'express';
import { findUser as findUserService } from '../service/userService';

export const findUser = async (req: Request, res: Response, next: NextFunction) => {
  
    const { id } = req.params;
    const user = await findUserService(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    return res.status(200).json(user);
  };