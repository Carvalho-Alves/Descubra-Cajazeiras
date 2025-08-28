import { Request, Response, NextFunction } from 'express';
import { createServicoSchema, updateServicoSchema } from '../validations/servicovalidation';
import * as servicoService from '../service/servicoService';

export const create = async (req: Request, res: Response) => {
  const usuarioId = req.userId;
  if (!usuarioId || typeof usuarioId !== 'string') {
    const error: any = new Error("Usuário não autenticado ou ID inválido.");
    error.statusCode = 401;
    throw error;
  }

  const servicoData = req.body;
  const servico = await servicoService.createServico(servicoData, usuarioId);

  res.status(201).json({
    success: true,
    data: servico,
    message: "Serviço criado com sucesso.",
  });
};

/**
 * @route   GET /api/servicos
 * @desc    Lista todos os serviços turísticos
 * @access  Public
 */
export const listAll = async (req: Request, res: Response, next: NextFunction) => {
  const servicos = await servicoService.listServicos();
  res.status(200).json(servicos);
};

/**
 * @route   GET /api/servicos/:id
 * @desc    Busca um serviço turístico específico pelo ID
 * @access  Public
 */
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const servico = await servicoService.getServicoById(id);

  if (!servico) {
    const error: any = new Error('Serviço não encontrado.');
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json(servico);
};

/**
 * @route   PUT /api/servicos/:id
 * @desc    Atualiza um serviço turístico
 * @access  Private (requer autenticação e posse do recurso)
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const updateData = updateServicoSchema.parse(req.body);
  const usuarioId = req.userId!;

  const servicoAtualizado = await servicoService.updateServico(id, usuarioId, updateData);
  res.status(200).json(servicoAtualizado);
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const usuarioId = req.userId!;

  const resultado = await servicoService.deleteServico(id, usuarioId);
  res.status(200).json(resultado);
};


