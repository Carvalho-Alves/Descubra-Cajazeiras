import { Request, Response, NextFunction } from 'express';
import { updateUserService } from '../service/userService';

export const editUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { nome, email, role } = req.body;
        
        // Pega o caminho do arquivo se uma foto foi enviada
        const foto = req.file ? req.file.path : undefined;

        // Cria o objeto com os dados que serão atualizados
        const updateData = { nome, email, role, foto };

        // Chama o serviço de atualização com os novos dados
        const user = await updateUserService(id, updateData);
        
        if (!user) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        
        return res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};