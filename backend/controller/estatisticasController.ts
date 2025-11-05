import { Request, Response } from 'express';
import { Servico } from '../models/servico';
import { Evento } from '../models/evento';
import { Avaliacao } from '../models/avaliacao';

export const estatisticasController = async (_req: Request, res: Response) => {
  const [
    totalPontos,
    totalEventos,
    pontosPorTipo,
    pontosPorMes,
    pontosRecentes,
    totalAvaliacoes,
    mediaGeral,
    avaliacoesPorMes,
    distribuicaoNotas,
    eventosPorStatus,
    eventosPorMes,
    topServicosAvaliados,
    topEventosAvaliados,
    avaliacoesRecentes,
    eventosRecentes
  ] = await Promise.all([
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
    Avaliacao.countDocuments(),
    Avaliacao.aggregate([
      { $group: { _id: null, media: { $avg: '$nota' } } }
    ]).then(result => result[0]?.media || 0),
    Avaliacao.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$criadoEm' } }, total: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Avaliacao.aggregate([
      { $group: { _id: '$nota', total: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Evento.aggregate([
      { $group: { _id: '$status', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Evento.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Avaliacao.aggregate([
      { $match: { tipo: 'servico' } },
      {
        $lookup: {
          from: 'servicos_turisticos',
          localField: 'referenciaId',
          foreignField: '_id',
          as: 'servico'
        }
      },
      { $unwind: '$servico' },
      {
        $group: {
          _id: '$referenciaId',
          nome: { $first: '$servico.nome' },
          tipo: { $first: '$servico.tipo_servico' },
          totalAvaliacoes: { $sum: 1 },
          mediaAvaliacoes: { $avg: '$nota' }
        }
      },
      { $sort: { mediaAvaliacoes: -1 } },
      { $limit: 5 },
      { $project: { nome: 1, tipo: 1, totalAvaliacoes: 1, mediaAvaliacoes: { $round: ['$mediaAvaliacoes', 1] } } }
    ]),
    Avaliacao.aggregate([
      { $match: { tipo: 'evento' } },
      {
        $lookup: {
          from: 'eventos',
          localField: 'referenciaId',
          foreignField: '_id',
          as: 'evento'
        }
      },
      { $unwind: '$evento' },
      {
        $group: {
          _id: '$referenciaId',
          nome: { $first: '$evento.nome' },
          data: { $first: '$evento.data' },
          totalAvaliacoes: { $sum: 1 },
          mediaAvaliacoes: { $avg: '$nota' }
        }
      },
      { $sort: { mediaAvaliacoes: -1 } },
      { $limit: 5 },
      { $project: { nome: 1, data: 1, totalAvaliacoes: 1, mediaAvaliacoes: { $round: ['$mediaAvaliacoes', 1] } } }
    ]),
    Avaliacao.aggregate([
      { $sort: { criadoEm: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: 'usuarioId',
          foreignField: '_id',
          as: 'usuario'
        }
      },
      { $unwind: '$usuario' },
      {
        $lookup: {
          from: 'servicos_turisticos',
          let: { refId: '$referenciaId', tipo: '$tipo' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$_id', '$$refId'] }, { $eq: ['$$tipo', 'servico'] }] } } }
          ],
          as: 'servico'
        }
      },
      {
        $lookup: {
          from: 'eventos',
          let: { refId: '$referenciaId', tipo: '$tipo' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$_id', '$$refId'] }, { $eq: ['$$tipo', 'evento'] }] } } }
          ],
          as: 'evento'
        }
      },
      {
        $project: {
          nota: 1,
          comentario: 1,
          criadoEm: 1,
          usuarioNome: '$usuario.nome',
          servicoNome: { $ifNull: ['$servico.nome', null] },
          eventoNome: { $ifNull: ['$evento.nome', null] },
          tipo: 1
        }
      }
    ]),
    Evento.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: 'usuario',
          foreignField: '_id',
          as: 'criador'
        }
      },
      { $unwind: '$criador' },
      { $project: { nome: 1, data: 1, status: 1, createdAt: 1, criadorNome: '$criador.nome' } },
    ]),
  ]);

  return res.json({
    success: true,
    data: {
      totalPontos,
      totalEventos,
      totalAvaliacoes,
      mediaGeral: Number(mediaGeral.toFixed(1)),
      pontosPorTipo,
      pontosPorMes,
      avaliacoesPorMes,
      distribuicaoNotas,
      eventosPorStatus,
      eventosPorMes,
      topServicosAvaliados,
      topEventosAvaliados,
      avaliacoesRecentes,
      eventosRecentes,
      distribuicaoGeografica: pontosPorTipo,
      pontosRecentes,
    },
  });
};
