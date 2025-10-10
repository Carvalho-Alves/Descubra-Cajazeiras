import { Request, Response, NextFunction } from 'express';
import { createServicoSchema, updateServicoSchema } from '../validations/servicovalidation';
import * as servicoService from '../service/servicoService';

export const editServicoController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const updateData = updateServicoSchema.parse(req.body);
  const usuarioId = req.userId!;

  const servicoAtualizado = await servicoService.updateServico(id, usuarioId, updateData);
  res.status(200).json(servicoAtualizado);
};