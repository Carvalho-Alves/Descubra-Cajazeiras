import { Request, Response, NextFunction } from 'express';
import { updateUserService } from '../service/userService';
import { adminEditUserSchema } from '../validations/uservalidation';
import { IUser } from '../models/user';

/**
 * @route   PUT /api/users/:id
 * @desc    (Admin) Edita os dados de um usuário específico.
 * @access  Private (Admin)
 */
export const editUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Valida e limpa os dados que chegam do front-end.
        const validatedData = adminEditUserSchema.parse(req.body);

        const { id } = req.params;
        
        // 2. Constrói o objeto de atualização de forma mais limpa.
        const updateData: Partial<IUser> = { ...validatedData };

        // Adiciona o caminho da foto apenas se um novo arquivo foi enviado.
        if (req.file) {
            updateData.foto = req.file.path;
        }

        // 3. Garante que não envie um objeto vazio para o serviço.
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ erro: 'Nenhum dado fornecido para atualização.' });
        }

        // 4. Chama o serviço para atualizar o usuário no banco.
        const user = await updateUserService(id, updateData);
        
        if (!user) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        
        res.status(200).json(user);

    } catch (error) {
        next(error);
    }
};