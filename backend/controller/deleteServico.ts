import { Request, Response, NextFunction } from 'express';
import { deleteServico } from '../service/servicoService';

export const deleteServicoController = async (req: Request, res: Response, next: NextFunction) => {
  const usuarioId = req.user.sub;
  const resultado = await deleteServico(req.body, usuarioId);

  if (!resultado) {
    const error: any = new Error('Serviço não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json(resultado);
};