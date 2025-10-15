import { Request, Response, NextFunction } from 'express';
import { createServicoSchema, updateServicoSchema } from '../validations/servicovalidation';
import * as servicoService from '../service/servicoService';

export const editServicoController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const updateData = updateServicoSchema.parse(req.body);
  const usuarioId = req.userId || req.user?.sub; // Suporta ambos os formatos

  if (!usuarioId) {
    const error: any = new Error('Usuário não autenticado.');
    error.statusCode = 401;
    throw error;
  }

  const servicoAtualizado = await servicoService.updateServico(id, usuarioId, updateData);
  res.status(200).json(servicoAtualizado);
};