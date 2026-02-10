import { Request, Response, NextFunction } from 'express';
import { deleteServico } from '../service/servicoService';

export const deleteServicoController = async (req: Request, res: Response, next: NextFunction) => {
  const usuarioId = (req as any).user?.sub || (req as any).userId;
  const id = (req.params as any).id ?? req.body;
  const resultado = await deleteServico(id, usuarioId);

  if (!resultado) {
    const error: any = new Error('Serviço não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json(resultado);
};