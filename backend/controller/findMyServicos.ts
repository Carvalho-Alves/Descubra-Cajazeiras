import { Request, Response, NextFunction } from 'express';
import { Servico } from '../models/servico';
import { Types } from 'mongoose';

export const findMyServicosController = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId as string;
  if (!userId) {
    return res.status(401).json({ message: 'Não autenticado.' });
  }
  const servicos = await Servico.find({ usuario: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .lean();
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.status(200).json(servicos);
};
