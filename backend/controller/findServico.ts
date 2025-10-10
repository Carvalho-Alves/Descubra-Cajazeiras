import { Request, Response, NextFunction } from 'express';
import * as servicoService from '../service/servicoService';

export const findServicoController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const servico = await servicoService.getServicoById(id);

  if (!servico) {
    const error: any = new Error('Serviço não encontrado.');
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json(servico);
};