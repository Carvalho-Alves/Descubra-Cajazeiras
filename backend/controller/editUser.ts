import { Request, Response, NextFunction } from 'express';
import { updateUserService } from '../service/userService';
import { adminEditUserSchema } from '../validations/uservalidation';
import { IUser } from '../models/user';

export const editUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = adminEditUserSchema.parse(req.body);
        const { id } = req.params;
        const updateData: Partial<IUser> = { ...validatedData };

        if (req.file) {
            updateData.foto = req.file.path;
        }
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ erro: 'Nenhum dado fornecido para atualização.' });
        }
        const user = await updateUserService(id, updateData); 
        if (!user) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        
        res.status(200).json(user);

    } catch (error) {
        next(error);
    }
};