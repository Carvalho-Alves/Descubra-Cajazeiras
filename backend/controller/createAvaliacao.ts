import { Request, Response, NextFunction } from 'express';
import { criarAvaliacao } from "../service/avaliacaoService";


export const createAvaliacaoController = async (req: Request, res: Response, next: NextFunction) => {
    const usuarioId = req.user.sub;
    const { tipo, referenciaId, nota, comentario } = req.body;

    const novaAvaliacao = await criarAvaliacao({
        tipo,
        referenciaId,
        usuarioId,
        nota,
        comentario
    });
    return res.status(201).json(novaAvaliacao);
};
