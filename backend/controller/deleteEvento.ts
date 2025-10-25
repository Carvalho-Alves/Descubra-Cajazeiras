import { Request, Response, NextFunction } from 'express';
import { deleteEvento } from '../service/eventoService';

export const deleteEventoController = async (req: Request, res: Response, _next: NextFunction) => {
    const usuarioId = req.userId as string;
    const eventoId = req.params.id;

        const userRole = req.user?.role as string | undefined;
        const removerEvento = await deleteEvento(eventoId, usuarioId, userRole);

    if (!removerEvento) {
        const error: any = new Error('Evento não encontrado.');
        error.statusCode = 404;
        throw error;
    }

    res.status(200).json(removerEvento);
};