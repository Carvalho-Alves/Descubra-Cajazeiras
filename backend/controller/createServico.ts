import { Request, Response } from 'express';
import { createServico } from '../service/servicoService';

export const createServicoController = async (req: Request, res: Response) => {
  const usuarioId = req.userId || req.user?.sub; // Suporta ambos os formatos
  
  if (!usuarioId) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }
  
  const novoServico = await createServico(req.body, usuarioId);
  res.status(201).json(novoServico);
};
