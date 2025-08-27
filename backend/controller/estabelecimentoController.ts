import { Request, Response } from 'express';
import { Estabelecimento } from '../models/estabelecimento';

// =================================================================
// OPERAÇÕES CRUD PARA ESTABELECIMENTOS COMERCIAIS
// =================================================================

/**
 * @description Lista todos os estabelecimentos comerciais
 * @route GET /api/estabelecimentos
 * @access Public
 */
export const listAll = async (req: Request, res: Response) => {
  try {
    const estabelecimentos = await Estabelecimento.find({ status: 'ativo' })
      .populate('usuario', 'nome email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: estabelecimentos.length,
      data: estabelecimentos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estabelecimentos',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * @description Busca um estabelecimento específico por ID
 * @route GET /api/estabelecimentos/:id
 * @access Public
 */
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const estabelecimento = await Estabelecimento.findById(id)
      .populate('usuario', 'nome email');

    if (!estabelecimento) {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: estabelecimento
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estabelecimento',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * @description Cria um novo estabelecimento comercial
 * @route POST /api/estabelecimentos
 * @access Private (Admin)
 */
export const create = async (req: Request, res: Response) => {
  try {
    const estabelecimentoData = {
      ...req.body,
      usuario: req.user?._id // Vem do middleware de autenticação
    };

    const estabelecimento = await Estabelecimento.create(estabelecimentoData);

    await estabelecimento.populate('usuario', 'nome email');

    res.status(201).json({
      success: true,
      message: 'Estabelecimento criado com sucesso',
      data: estabelecimento
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao criar estabelecimento',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * @description Atualiza um estabelecimento existente
 * @route PUT /api/estabelecimentos/:id
 * @access Private (Admin)
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove campos que não devem ser atualizados
    delete updateData.usuario;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const estabelecimento = await Estabelecimento.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('usuario', 'nome email');

    if (!estabelecimento) {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Estabelecimento atualizado com sucesso',
      data: estabelecimento
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar estabelecimento',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * @description Remove um estabelecimento
 * @route DELETE /api/estabelecimentos/:id
 * @access Private (Admin)
 */
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const estabelecimento = await Estabelecimento.findByIdAndDelete(id);

    if (!estabelecimento) {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Estabelecimento removido com sucesso',
      data: estabelecimento
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao remover estabelecimento',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * @description Busca estabelecimentos por tipo
 * @route GET /api/estabelecimentos/tipo/:tipo
 * @access Public
 */
export const getByType = async (req: Request, res: Response) => {
  try {
    const { tipo } = req.params;

    const estabelecimentos = await Estabelecimento.find({ 
      tipo, 
      status: 'ativo' 
    })
      .populate('usuario', 'nome email')
      .sort({ nome: 1 });

    res.status(200).json({
      success: true,
      count: estabelecimentos.length,
      data: estabelecimentos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estabelecimentos por tipo',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * @description Busca estabelecimentos por proximidade
 * @route GET /api/estabelecimentos/proximos?lat=:lat&lng=:lng&raio=:raio
 * @access Public
 */
export const getNearby = async (req: Request, res: Response) => {
  try {
    const { lat, lng, raio = 5 } = req.query; // raio em km, padrão 5km

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude e longitude são obrigatórias'
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const raioKm = parseFloat(raio as string);

    // Para MongoDB, usamos uma busca simples por proximidade baseada em coordenadas
    // já que não temos dados com geometria Point ainda
    const estabelecimentos = await Estabelecimento.find({
      status: 'ativo',
      'localizacao.latitude': { $gte: latitude - 0.1, $lte: latitude + 0.1 },
      'localizacao.longitude': { $gte: longitude - 0.1, $lte: longitude + 0.1 }
    })
      .populate('usuario', 'nome email')
      .limit(50);

    res.status(200).json({
      success: true,
      count: estabelecimentos.length,
      data: estabelecimentos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estabelecimentos próximos',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
