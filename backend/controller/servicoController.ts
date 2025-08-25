import { Request, Response, NextFunction } from 'express';
import { createServicoSchema, updateServicoSchema } from '../validations/servicovalidation';
import * as servicoService from '../service/servicoService';

/**
 * @route   POST /api/servicos
 * @desc    Cria um novo serviço turístico
 * @access  Private (requer autenticação)
 */
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Valida os dados recebidos no corpo da requisição
    const servicoData = createServicoSchema.parse(req.body);
    
    // Pega o ID do usuário que foi injetado pelo middleware de autenticação (ensureAuth)
    const usuarioId = req.userId!; 

    // Chama a camada de serviço para criar o recurso no banco de dados
    const novoServico = await servicoService.createServico({ ...servicoData, usuarioId });
    
    res.status(201).json(novoServico);
  } catch (error) {
    // Em caso de erro (validação ou outro), passa para o próximo middleware de erro
    next(error); 
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

/**
 * @route   DELETE /api/servicos/:id
 * @desc    Deleta um serviço turístico
 * @access  Private (requer autenticação e posse do recurso)
 */
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