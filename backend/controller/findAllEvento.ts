import { Request, Response, NextFunction } from 'express';
import { listEvento } from '../service/eventoService';

export const findAllEventoController = async (req: Request, res: Response, next: NextFunction) => {
    const eventos = await listEvento();

    if (!eventos) {
        const error: any = new Error('Eventos não encontrados.');
        error.statusCode = 404;
        throw error;
    };

    // Ordena por criação mais recente primeiro para facilitar ver novos itens no topo
    const ordenados = [...eventos].sort((a: any, b: any) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return tb - ta;
    });
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).json(ordenados);
};