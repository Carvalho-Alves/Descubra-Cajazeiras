import { Request, Response } from 'express';
import { Evento } from '../models/evento';
import jwt from 'jsonwebtoken';
import { env } from '../database/env';

// Middleware para verificar o token de autenticação
const authenticateToken = (req: any, res: Response, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    const secret = (env as any).JWT_ACCESS_SECRET || 'dev-secret';
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Adiciona os dados do usuário decodificado ao objeto de requisição
    next();
  } catch (error) {
    res.status(403).json({ message: 'Token inválido.' });
  }
};

const eventoController = {
  // Rota de criação de eventos protegida
  create: [authenticateToken, async (req: any, res: Response) => {
    try {
      const userId = req.user.sub; // Obtém o ID do usuário do token
      const novoEvento = new Evento({
        ...req.body,
        usuarioId: userId, // Associa o evento ao ID do usuário
      });
      await novoEvento.save();
      res.status(201).json(novoEvento);
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      res.status(500).json({ message: 'Ocorreu um erro no servidor.' });
    }
  }],

  findAll: async (_req: Request, res: Response) => {
    try {
      const eventos = await Evento.find();
      res.status(200).json(eventos);
    } catch (error) {
      console.error("Erro ao listar eventos:", error);
      res.status(500).json({ message: 'Ocorreu um erro no servidor.' });
    }
  },

  findById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const evento = await Evento.findById(id);

      if (!evento) {
        return res.status(404).json({ message: 'Evento não encontrado.' });
      }
      res.status(200).json(evento);
    } catch (error) {
      console.error("Erro ao buscar evento:", error);
      res.status(500).json({ message: 'Ocorreu um erro no servidor.' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const eventoAtualizado = await Evento.findByIdAndUpdate(id, req.body, { new: true });

      if (!eventoAtualizado) {
        return res.status(404).json({ message: 'Evento não encontrado.' });
      }
      res.status(200).json(eventoAtualizado);
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      res.status(500).json({ message: 'Ocorreu um erro no servidor.' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const eventoDeletado = await Evento.findByIdAndDelete(id);

      if (!eventoDeletado) {
        return res.status(404).json({ message: 'Evento não encontrado.' });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar evento:", error);
      res.status(500).json({ message: 'Ocorreu um erro no servidor.' });
    }
  },
};

export default eventoController;