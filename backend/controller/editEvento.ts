import { Request, Response, NextFunction } from 'express';
import { Evento } from '../models/evento';

export const editEventoController = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const eventoAtualizado = await Evento.findByIdAndUpdate(id, req.body, { new: true });

    if (!eventoAtualizado) {
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }
    res.status(200).json(eventoAtualizado);
};