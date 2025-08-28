import { Request, Response, NextFunction } from 'express';
import { Evento } from '../models/evento';
import jwt from 'jsonwebtoken';
import { env } from '../database/env';


export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    const secret = (env as any).JWT_ACCESS_SECRET || 'dev-secret';
    const decoded = jwt.verify(token, secret);
    req.user = decoded; 
    next();
  } catch (error) {

    res.status(403).json({ message: 'Token inválido.' });
  }
};


const eventoController = {

  create: async (req: any, res: Response) => {
    const userId = req.user.sub; 
    const novoEvento = new Evento({
      ...req.body,
      usuarioId: userId, 
    });
    await novoEvento.save();
    res.status(201).json(novoEvento);
  },

  findAll: async (_req: Request, res: Response) => {
    const eventos = await Evento.find();
    res.status(200).json(eventos);
  },

  findById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const evento = await Evento.findById(id);

    if (!evento) {
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }
    res.status(200).json(evento);
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const eventoAtualizado = await Evento.findByIdAndUpdate(id, req.body, { new: true });

    if (!eventoAtualizado) {
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }
    res.status(200).json(eventoAtualizado);
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    const eventoDeletado = await Evento.findByIdAndDelete(id);

    if (!eventoDeletado) {
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }

    res.status(204).send();
  },
};

export default eventoController;
