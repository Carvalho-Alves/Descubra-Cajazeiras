import { Request, Response, NextFunction } from 'express';
import { listarAvaliacoesPorReferencia } from "../service/avaliacaoService";

export const listarAvaliacoesPorReferenciaController = async (req: Request, res: Response, next: NextFunction) => {
      const { tipo, id } = req.params;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
    
      const [avaliacoes, estat] = await Promise.all([
        listarAvaliacoesPorReferencia(tipo as any, id, limit, page),
        listarAvaliacoesPorReferencia(tipo as any, id)
      ]);
    
      res.status(200).json([avaliacoes, estat]);
};