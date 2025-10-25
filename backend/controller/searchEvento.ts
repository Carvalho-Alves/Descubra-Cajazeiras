import { Request, Response } from 'express';
import { searchEventos } from '../service/eventoService';

export const searchEventoController = async (req: Request, res: Response) => {
  const q = String(req.query.q || '');
  const items = await searchEventos(q);
  const normalized = items.map((e: any) => ({
    _id: e._id,
    nome: e.nome,
    descricao: e.descricao,
    data: e.data,
    horario: e.horario,
    status: e.status,
    localizacao: e.localizacao || e.localização,
    imagem: e.imagem || [],
    usuario: e.usuario,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }));
  res.status(200).json(normalized);
};
