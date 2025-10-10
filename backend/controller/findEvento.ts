import { Request, Response, NextFunction } from 'express';
import { Evento } from '../models/evento';

export const findEventoController = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const evento = await Evento.findById(id);

    if (!evento) {
      const error: any = new Error('Evento não encontrado.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json(evento);
};