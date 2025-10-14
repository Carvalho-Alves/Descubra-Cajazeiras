import { Request, Response } from "express";
import { listarAvaliacoesPorReferencia, obterEstatisticasAvaliacao } from "../service/avaliacaoService";

export const listarAvaliacoesPorReferenciaController = async (req: Request, res: Response) => {
  const { tipo, id } = req.params; // :tipo = servico|evento, :id = referenciaId
  const limit = Number(req.query.limit || 20);
  const page = Number(req.query.page || 1);

  const [items, stats] = await Promise.all([
    listarAvaliacoesPorReferencia(tipo as "servico" | "evento", id, limit, page),
    obterEstatisticasAvaliacao(tipo as "servico" | "evento", id),
  ]);

  return res.json({
    referencia: { tipo, id },
    paginacao: { page, limit, count: items.length },
    stats,    // { media, total }
    items,    // array de avaliações
  });
};
