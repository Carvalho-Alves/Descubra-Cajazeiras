// scripts/service/estabelecimentoService.js

import Estabelecimento from '../models/Estabelecimento.js';

class EstabelecimentoService {
    constructor() {
        this.baseURL = '/api/estabelecimentos';
        this.token = localStorage.getItem('authToken');
    }

    /**
     * Configura o token de autenticação
     */
    setAuthToken(token) {
        this.token = token;
    }

    /**
     * Obtém os headers para requisições autenticadas
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    /**
     * Lista todos os estabelecimentos
     */
    async listAll() {
        try {
            const response = await fetch(this.baseURL, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.data.map(estabelecimento => new Estabelecimento(estabelecimento));
        } catch (error) {
            console.error('Erro ao listar estabelecimentos:', error);
            throw error;
        }
    }

    /**
     * Busca estabelecimento por ID
     */
    async getById(id) {
        try {
            const response = await fetch(`${this.baseURL}/${id}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return new Estabelecimento(data.data);
        } catch (error) {
            console.error('Erro ao buscar estabelecimento:', error);
            throw error;
        }
    }

    /**
     * Cria novo estabelecimento
     */
    async create(estabelecimentoData) {
        try {
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(estabelecimentoData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return new Estabelecimento(data.data);
        } catch (error) {
            console.error('Erro ao criar estabelecimento:', error);
            throw error;
        }
    }

    /**
     * Atualiza estabelecimento existente
     */
    async update(id, estabelecimentoData) {
        try {
            const response = await fetch(`${this.baseURL}/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(estabelecimentoData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return new Estabelecimento(data.data);
        } catch (error) {
            console.error('Erro ao atualizar estabelecimento:', error);
            throw error;
        }
    }

    /**
     * Remove estabelecimento
     */
    async remove(id) {
        try {
            const response = await fetch(`${this.baseURL}/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao remover estabelecimento:', error);
            throw error;
        }
    }

    /**
     * Busca estabelecimentos por tipo
     */
    async getByType(tipo) {
        try {
            const response = await fetch(`${this.baseURL}/tipo/${tipo}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.data.map(estabelecimento => new Estabelecimento(estabelecimento));
        } catch (error) {
            console.error('Erro ao buscar estabelecimentos por tipo:', error);
            throw error;
        }
    }

    /**
     * Busca estabelecimentos próximos
     */
    async getNearby(lat, lng, raio = 5) {
        try {
            const params = new URLSearchParams({
                lat: lat.toString(),
                lng: lng.toString(),
                raio: raio.toString()
            });

            const response = await fetch(`${this.baseURL}/proximos?${params}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.data.map(estabelecimento => new Estabelecimento(estabelecimento));
        } catch (error) {
            console.error('Erro ao buscar estabelecimentos próximos:', error);
            throw error;
        }
    }

    /**
     * Busca estabelecimentos por texto
     */
    async searchByText(searchTerm) {
        try {
            // Implementação de busca local por enquanto
            // Pode ser expandida para usar uma API de busca no backend
            const estabelecimentos = await this.listAll();
            
            const searchLower = searchTerm.toLowerCase();
            return estabelecimentos.filter(estabelecimento => 
                estabelecimento.nome.toLowerCase().includes(searchLower) ||
                estabelecimento.categoria.toLowerCase().includes(searchLower) ||
                estabelecimento.descricao.toLowerCase().includes(searchLower)
            );
        } catch (error) {
            console.error('Erro ao buscar estabelecimentos:', error);
            throw error;
        }
    }

    /**
     * Obtém estatísticas dos estabelecimentos
     */
    async getStats() {
        try {
            const estabelecimentos = await this.listAll();
            
            const stats = {
                total: estabelecimentos.length,
                porTipo: {},
                porStatus: {},
                recentes: estabelecimentos
                    .filter(e => new Date(e.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                    .length
            };

            // Conta por tipo
            estabelecimentos.forEach(estabelecimento => {
                const tipo = estabelecimento.tipo;
                stats.porTipo[tipo] = (stats.porTipo[tipo] || 0) + 1;
            });

            // Conta por status
            estabelecimentos.forEach(estabelecimento => {
                const status = estabelecimento.status;
                stats.porStatus[status] = (stats.porStatus[status] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            throw error;
        }
    }

    /**
     * Valida dados do estabelecimento antes de enviar
     */
    validateEstabelecimento(estabelecimentoData) {
        const estabelecimento = new Estabelecimento(estabelecimentoData);
        return estabelecimento.validate();
    }

    /**
     * Obtém tipos de estabelecimento disponíveis
     */
    getTiposDisponiveis() {
        return [
            'Restaurante',
            'Bar',
            'Loja',
            'Farmácia',
            'Supermercado',
            'Outros'
        ];
    }

    /**
     * Obtém formas de pagamento comuns
     */
    getFormasPagamentoComuns() {
        return [
            'Dinheiro',
            'Cartão de Crédito',
            'Cartão de Débito',
            'PIX',
            'Transferência Bancária',
            'Vale Refeição',
            'Vale Alimentação'
        ];
    }

    /**
     * Obtém serviços comuns
     */
    getServicosComuns() {
        return [
            'Delivery',
            'Wi-Fi',
            'Estacionamento',
            'Ar Condicionado',
            'Acessibilidade',
            'Reservas',
            'Take Away',
            'Buffet',
            'Estacionamento Gratuito',
            'Wi-Fi Gratuito'
        ];
    }
}

// Exporta uma instância única do service
export default new EstabelecimentoService();
