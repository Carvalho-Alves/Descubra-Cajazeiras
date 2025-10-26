import { Request, Response, NextFunction } from 'express';
import { Evento } from '../models/evento';
import { Types } from 'mongoose';

export const findMyEventosController = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId as string;
  if (!userId) {
    return res.status(401).json({ message: 'Não autenticado.' });
  }
  const eventos = await Evento.find({ usuario: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .lean();
  res.status(200).json(eventos);
};
