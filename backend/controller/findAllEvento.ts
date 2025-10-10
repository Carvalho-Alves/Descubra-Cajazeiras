import { Request, Response, NextFunction } from 'express';
import { Evento } from '../models/evento';

export const findAllEventoController = async (req: Request, res: Response, next: NextFunction) => {
    const eventos = await Evento.find();

    if (!eventos) {
        const error: any = new Error('Eventos não encontrados.');
        error.statusCode = 404;
        throw error;
    };

    res.status(200).json(eventos);
};