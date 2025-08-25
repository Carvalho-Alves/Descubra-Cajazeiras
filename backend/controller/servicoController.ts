import { Request, Response, NextFunction } from 'express';
import { createServicoSchema, updateServicoSchema } from '../validations/servicovalidation';
import * as servicoService from '../service/servicoService';

export const create = async (req: Request, res: Response) => {
  try {
    // 1. Obtenha o 'usuarioId' do objeto de requisição (req).
    //    Isso geralmente vem do middleware de autenticação (ex: req.user.id).
    const usuarioId = req.userId; // Ou req.user.id, dependendo de como você configurou o middleware.

    // 2. Obtenha os dados do serviço do corpo da requisição.
    const servicoData = req.body;

    // 3. Chame a função createServico, passando os dois argumentos esperados.
    const servico = createServico(servicoData, usuarioId);

    // 4. Envie uma resposta de sucesso.
    res.status(201).json({
      success: true,
      data: servico,
      message: "Serviço criado com sucesso.",
    });
  } catch (error: any) {
    // 5. Trate os erros, se houver.
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @route   GET /api/servicos
 * @desc    Lista todos os serviços turísticos
 * @access  Public
 */
export const listAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const servicos = await servicoService.listServicos();
    res.status(200).json(servicos);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/servicos/:id
 * @desc    Busca um serviço turístico específico pelo ID
 * @access  Public
 */
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

/**
 * @route   PUT /api/servicos/:id
 * @desc    Atualiza um serviço turístico
 * @access  Private (requer autenticação e posse do recurso)
 */
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

function createServico(_servicoData: any, _usuarioId: string | undefined) {
  throw new Error('Function not implemented.');
}
