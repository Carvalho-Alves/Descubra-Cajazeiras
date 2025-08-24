import { Request, Response, NextFunction } from 'express';
import { createServicoSchema, updateServicoSchema } from '../validations/servicovalidation';
import { createServico, listServicos, getServicoById, updateServico, deleteServico } from '../service/servicoService';

export const createServicoController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createServicoSchema.parse(req.body);
    const usuarioId = req.userId!;
     console.log('ID do Usuário no Controller:', usuarioId)
    const servico = await createServico({ ...validated, usuarioId });
    return res.status(201).json(servico);
  } catch (error) {
    next(error);
  }
};

export const listServicosController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const servicos = await listServicos();
    return res.status(200).json(servicos);
  } catch (error) {
    next(error);
  }
};

export const getServicoController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const servico = await getServicoById(id);
    if (!servico) return res.status(404).json({ message: 'Serviço não encontrado.' });
    return res.status(200).json(servico);
  } catch (error) {
    next(error);
  }
};

export const updateServicoController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validated = updateServicoSchema.parse(req.body);
    const usuarioId = req.userId!;
    const servico = await updateServico(id, usuarioId, validated);
    return res.status(200).json(servico);
  } catch (error) {
    next(error);
  }
};

export const deleteServicoController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuarioId = req.userId!;
    const result = await deleteServico(id, usuarioId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


