import { Request, Response } from 'express';
import { createServico } from '../service/servicoService';

export const createServicoController = async (req: Request, res: Response) => {
  const usuarioId = req.user.sub;
  const novoServico = await createServico(req.body, usuarioId);
  res.status(201).json(novoServico);
};
