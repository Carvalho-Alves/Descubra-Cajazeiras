import { Request, Response, NextFunction } from 'express';
import { atualizarAvaliacao } from "../service/avaliacaoService";

export const editAvaliacaoController = async (req: Request, res: Response, next: NextFunction) => {
      const usuarioId = req.user.sub;
      const { nota, comentario } = req.body;
    
      const updateavaliacao = await atualizarAvaliacao(req.body, usuarioId, {
        nota,
        comentario,
      });
    
      res.status(200).json(updateavaliacao);
};