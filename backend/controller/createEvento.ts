import { Request, Response, NextFunction } from 'express';
import {createEvento} from '../service/eventoService';

export const createEventoController = async (req: Request, res: Response, next: NextFunction) => {
  const usuarioId = req.userId as string;
  const novoEvento = await createEvento(req.body, usuarioId);
  res.status(201).json(novoEvento);
};
