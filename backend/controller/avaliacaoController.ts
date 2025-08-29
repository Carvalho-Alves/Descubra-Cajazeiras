import { Request, Response } from "express";
import * as avaliacaoService from "../service/avaliacaoService";

// Criar nova avaliação
export const create = async (req: Request, res: Response) => {
  const usuarioId = (req as any).userId;
  const { tipo, referenciaId, nota, comentario } = req.body;

  const resultado = await avaliacaoService.criarAvaliacao({
    tipo,
    referenciaId,
    nota,
    comentario,
    usuarioId,
  });

  res.status(201).json({ success: true, data: resultado });
};

// Listar avaliações por serviço/evento com estatísticas
export const listarPorReferencia = async (req: Request, res: Response) => {
  const { tipo, id } = req.params;
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;

  const [avaliacoes, estat] = await Promise.all([
    avaliacaoService.listarAvaliacoesPorReferencia(tipo as any, id, limit, page),
    avaliacaoService.obterEstatisticas(tipo as any, id),
  ]);

  res.json({ success: true, meta: estat, data: avaliacoes });
};

// Buscar avaliação por ID
export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const avaliacao = await avaliacaoService.buscarPorId(id);
  res.json({ success: true, data: avaliacao });
};

// Atualizar avaliação
export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const usuarioId = (req as any).userId;
  const { nota, comentario } = req.body;

  const avaliacao = await avaliacaoService.atualizar(id, usuarioId, {
    nota,
    comentario,
  });

  res.json({ success: true, data: avaliacao });
};

// Deletar avaliação
export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  const usuarioId = (req as any).userId;

  await avaliacaoService.remover(id, usuarioId);

  res.status(200).json({ message: "Avaliação deletada com sucesso.", success: true });
};

// Lista todas as avaliações
export const listarTodas = async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;

  const avaliacoes = await avaliacaoService.listarTodas(limit, page);

  res.json({ success: true, data: avaliacoes });
};

export default { create, listarPorReferencia, getById, update, remove, listarTodas };