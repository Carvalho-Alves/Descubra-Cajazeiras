import { Request, Response, NextFunction } from 'express';
import { removerAvaliacao } from "../service/avaliacaoService";

export const removeAvaliacaoController = async (req: Request, res: Response, next: NextFunction) => {
  const usuarioId = req.user.sub;
  const { id } = req.params;

  await removerAvaliacao(id, usuarioId);

  res.status(200).json({ message: 'Avaliação removida com sucesso.' });
};
