import { Request, Response, NextFunction } from 'express';
import { deleteUserService } from '../service/userService'; // Importa o serviço de delete

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await deleteUserService(id);
    return res.status(200).json(result);
};