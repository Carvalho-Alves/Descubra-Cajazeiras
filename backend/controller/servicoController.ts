import { Request, Response, NextFunction } from 'express';
import { createServicoSchema, updateServicoSchema } from '../validations/servicovalidation';
import * as servicoService from '../service/servicoService';

export const create = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.userId;
    
    if (!usuarioId || typeof usuarioId !== 'string') {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado ou ID inválido.",
      });
    }

    const servicoData = req.body;
    const servico = await servicoService.createServico(servicoData, usuarioId);

    res.status(201).json({
      success: true,
      data: servico,
      message: "Serviço criado com sucesso.",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const listAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const servicos = await servicoService.listServicos();
    res.status(200).json(servicos);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const servico = await servicoService.getServicoById(id);

    if (!servico) {
      return res.status(404).json({ message: 'Serviço não encontrado.' });
    }
    res.status(200).json(servico);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = updateServicoSchema.parse(req.body);
    const usuarioId = req.userId!;

    const servicoAtualizado = await servicoService.updateServico(id, usuarioId, updateData);
    res.status(200).json(servicoAtualizado);
  } catch (error)
 {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuarioId = req.userId!;

    const resultado = await servicoService.deleteServico(id, usuarioId);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};


