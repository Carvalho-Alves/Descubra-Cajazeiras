import { Request, Response, NextFunction } from 'express';
import { updateUserService } from '../service/userService';
import { adminEditUserSchema } from '../validations/uservalidation';
import { IUser } from '../models/user';

export const editUser = async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = adminEditUserSchema.parse(req.body);
    const { id } = req.params;
    const updateData: Partial<IUser> = { ...validatedData };

    if (req.file) {
        updateData.foto = `/uploads/${(req as any).file.filename}`;
    }

    if (Object.keys(updateData).length === 0) {
        const error: any = new Error('Nenhum dado fornecido para atualização.');
        error.statusCode = 400;
        throw error;
    }

    const user = await updateUserService(id, updateData);

    if (!user) {
        const error: any = new Error('Usuário não encontrado');
        error.statusCode = 404;
        throw error;
    }
    
    res.status(200).json(user);
};