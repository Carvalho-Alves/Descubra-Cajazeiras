import { Request, Response, NextFunction } from 'express';
import { removerAvaliacao } from "../service/avaliacaoService";

export const removeAvaliacaoController = async (req: Request, res: Response, next: NextFunction) => {
      const usuarioId = req.user.sub
      const deleteavaliacao = await removerAvaliacao(req.body, usuarioId);

    if (!deleteavaliacao) {
        const error: any = new Error('Avaliação não encontrada.');
        error.statusCode = 404;
        throw error;
    }

      res.status(200).json(deleteavaliacao);
};
