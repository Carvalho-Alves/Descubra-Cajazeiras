import { Request, Response, NextFunction } from 'express';
import * as avaliacaoService from "../service/avaliacaoService";

export const findAvaliacaoController = async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const avaliacao = await avaliacaoService.buscarPorIdAvaliacao(id);

    if (!avaliacao) {
        const error: any = new Error('Avaliação não encontrado.');
        error.statusCode = 404;
        throw error;
    }
      res.status(200).json(avaliacao);
};