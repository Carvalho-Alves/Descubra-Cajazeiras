import { Request, Response, NextFunction } from 'express';
import { updateUserService } from '../service/userService';

export const editUser = async (req: Request, res: Response, next: NextFunction) => {
  
    const { id } = req.params;
    const { nome, email, role } = req.body;
    const user = await updateUserService(id, { nome, email, role });
    if (!user) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    return res.status(200).json(user);

  };