import { Estabelecimento, IEstabelecimento } from '../models/estabelecimento';

export class EstabelecimentoService {
  /**
   * Lista todos os estabelecimentos ativos
   */
  static async listAll(): Promise<IEstabelecimento[]> {
    try {
      return await Estabelecimento.find({ status: 'ativo' })
        .populate('usuario', 'nome email')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Erro ao listar estabelecimentos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Busca estabelecimento por ID
   */
  static async getById(id: string): Promise<IEstabelecimento | null> {
    try {
      return await Estabelecimento.findById(id)
        .populate('usuario', 'nome email');
    } catch (error) {
      throw new Error(`Erro ao buscar estabelecimento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Cria novo estabelecimento
   */
  static async create(data: Partial<IEstabelecimento>): Promise<IEstabelecimento> {
    try {
      const estabelecimento = await Estabelecimento.create(data);
      await estabelecimento.populate('usuario', 'nome email');
      return estabelecimento;
    } catch (error) {
      throw new Error(`Erro ao criar estabelecimento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Atualiza estabelecimento existente
   */
  static async update(id: string, data: Partial<IEstabelecimento>): Promise<IEstabelecimento | null> {
    try {
      // Remove campos que não devem ser atualizados
      const updateData = { ...data };
      delete updateData.usuario;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      return await Estabelecimento.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true
        }
      ).populate('usuario', 'nome email');
    } catch (error) {
      throw new Error(`Erro ao atualizar estabelecimento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Remove estabelecimento
   */
  static async remove(id: string): Promise<IEstabelecimento | null> {
    try {
      return await Estabelecimento.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Erro ao remover estabelecimento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Busca estabelecimentos por tipo
   */
  static async getByType(tipo: string): Promise<IEstabelecimento[]> {
    try {
      return await Estabelecimento.find({ 
        tipo, 
        status: 'ativo' 
      })
        .populate('usuario', 'nome email')
        .sort({ nome: 1 });
    } catch (error) {
      throw new Error(`Erro ao buscar estabelecimentos por tipo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Busca estabelecimentos por proximidade
   */
  static async getNearby(lat: number, lng: number, raio: number = 5): Promise<IEstabelecimento[]> {
    try {
      return await Estabelecimento.find({
        status: 'ativo',
        localizacao: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: raio * 1000 // Converte km para metros
          }
        }
      })
        .populate('usuario', 'nome email')
        .limit(50);
    } catch (error) {
      throw new Error(`Erro ao buscar estabelecimentos próximos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Busca estabelecimentos por texto (nome, categoria, descrição)
   */
  static async searchByText(searchTerm: string): Promise<IEstabelecimento[]> {
    try {
      const regex = new RegExp(searchTerm, 'i');
      
      return await Estabelecimento.find({
        status: 'ativo',
        $or: [
          { nome: regex },
          { categoria: regex },
          { descricao: regex }
        ]
      })
        .populate('usuario', 'nome email')
        .sort({ nome: 1 });
    } catch (error) {
      throw new Error(`Erro ao buscar estabelecimentos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Conta total de estabelecimentos por tipo
   */
  static async countByType(): Promise<{ [key: string]: number }> {
    try {
      const result = await Estabelecimento.aggregate([
        { $match: { status: 'ativo' } },
        { $group: { _id: '$tipo', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const counts: { [key: string]: number } = {};
      result.forEach(item => {
        counts[item._id] = item.count;
      });

      return counts;
    } catch (error) {
      throw new Error(`Erro ao contar estabelecimentos por tipo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}

export default EstabelecimentoService;
