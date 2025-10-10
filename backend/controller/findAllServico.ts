import { Request, Response, NextFunction } from 'express';
import { createServicoSchema, updateServicoSchema } from '../validations/servicovalidation';
import * as servicoService from '../service/servicoService';

export const findAllServicoController = async (req: Request, res: Response, next: NextFunction) => {
  const servicos = await servicoService.listServicos();
  
  if (!servicos) {
    const error: any = new Error('Serviços não encontrados.');
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json(servicos);
};