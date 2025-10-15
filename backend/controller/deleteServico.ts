import { Request, Response, NextFunction } from 'express';
import { deleteServico } from '../service/servicoService';

export const deleteServicoController = async (req: Request, res: Response, next: NextFunction) => {
  const servicoId = req.params.id; // Pega o ID dos parâmetros da URL
  const usuarioId = req.userId || req.user?.sub; // Suporta ambos os formatos

  if (!usuarioId) {
    const error: any = new Error('Usuário não autenticado.');
    error.statusCode = 401;
    throw error;
  }

  const resultado = await deleteServico(servicoId, usuarioId);

  if (!resultado) {
    const error: any = new Error('Serviço não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json(resultado);
};