import { Request, Response, NextFunction } from 'express';
import * as avaliacaoService from "../service/avaliacaoService";
import { Avaliacao } from '../models/avaliacao';
import jwt from 'jsonwebtoken';
import { env } from '../database/env';

export const findAllAvaliacaoController = async (req: Request, res: Response, next: NextFunction) => {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
    
      const avaliacoes = await avaliacaoService.listarTodasAValiacao(limit, page);

    if (!avaliacoes) {
        const error: any = new Error('Avaliações não encontrados.');
        error.statusCode = 404;
        throw error;
    }
    
      res.status(200).json(avaliacoes);
};