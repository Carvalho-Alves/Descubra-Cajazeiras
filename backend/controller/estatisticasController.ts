import { Request, Response } from 'express';
import { Servico } from '../models/servico';
import { Evento } from '../models/evento';

export const estatisticasController = async (_req: Request, res: Response) => {
  const [totalPontos, totalEventos, pontosPorTipo, pontosPorMes, pontosRecentes] = await Promise.all([
    Servico.countDocuments(),
    Evento.countDocuments(),
    Servico.aggregate([
      { $group: { _id: '$tipo_servico', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Servico.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Servico.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      { $project: { nome: 1, tipo: '$tipo_servico', createdAt: 1 } },
    ]),
  ]);

  return res.json({
    success: true,
    data: {
      totalPontos,
      totalEventos,
      pontosPorTipo,
      pontosPorMes,
      distribuicaoGeografica: pontosPorTipo,
      pontosRecentes,
    },
  });
};
