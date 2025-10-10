import { Request, Response, NextFunction } from 'express';
import { deleteEvento } from '../service/eventoService';

export const deleteEventoController = async (req: Request, res: Response, next: NextFunction) => {
    const usuarioId = req.user.sub;
    const removerEvento = await deleteEvento(req.body, usuarioId);

    if (!removerEvento) {
        const error: any = new Error('Evento não encontrado.');
        error.statusCode = 404;
        throw error;
    }

    res.status(200).json(removerEvento);
};