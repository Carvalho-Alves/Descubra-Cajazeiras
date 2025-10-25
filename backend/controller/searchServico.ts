import { Request, Response } from 'express';
import { searchServicos } from '../service/servicoService';

export const searchServicoController = async (req: Request, res: Response) => {
  const q = String(req.query.q || '');
  const items = await searchServicos(q);
  // Normaliza campos para evitar divergências no front
  const normalized = items.map((s: any) => ({
    _id: s._id,
    nome: s.nome,
    descricao: s.descricao,
    tipo_servico: s.tipo_servico,
    categoria: s.categoria,
    contato: s.contato,
    localizacao: s.localizacao || s.localização,
    imagem: s.imagem || s.imagens || [],
    usuario: s.usuario || s.usuário,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    score: s.score || s.pontuação,
  }));
  res.status(200).json(normalized);
};
