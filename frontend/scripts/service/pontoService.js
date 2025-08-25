// scripts/service/pontoService.js

class PontoService {

    constructor() {
        this.servicosUrl = '/api/servicos'; 
        this.eventosUrl = '/api/eventos'; 
        this.estatisticasUrl = '/api/estatisticas';
    }

    /**
     * Lista todos os serviços (pontos turísticos).
     * @returns {Promise<Array>} Uma promessa que resolve para uma lista de serviços.
     * @throws {Error} Se a requisição falhar.
     */
    async listarServicos() {
        try {
            const response = await fetch(this.servicosUrl);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao carregar os serviços.');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro no PontoService.listarServicos:', error);
            throw error;
        }
    }
    
    /**
     * Lista todos os eventos.
     * @returns {Promise<Array>} Uma promessa que resolve para uma lista de eventos.
     * @throws {Error} Se a requisição falhar.
     */
    async listarEventos() {
        try {
            const response = await fetch(this.eventosUrl);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao carregar os eventos.');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro no PontoService.listarEventos:', error);
            throw error;
        }
    }

    /**
     * Cria um novo serviço.
     * @param {Object} servicoData Os dados do serviço a ser criado.
     * @returns {Promise<Object>} O serviço recém-criado.
     * @throws {Error} Se a requisição falhar.
     */
    async criarServico(servicoData) {
        try {
            const token = this.getAuthToken();
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(this.servicosUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(servicoData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao criar o serviço.');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro no PontoService.criarServico:', error);
            throw error;
        }
    }
    
    /**
     * Cria um novo evento.
     * @param {Object} eventoData Os dados do evento a ser criado.
     * @returns {Promise<Object>} O evento recém-criado.
     * @throws {Error} Se a requisição falhar.
     */
    async criarEvento(eventoData) {
        try {
            const response = await fetch(this.eventosUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventoData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao criar o evento.');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro no PontoService.criarEvento:', error);
            throw error;
        }
    }

    /**
     * Atualiza um serviço existente.
     * @param {string} id O ID do serviço a ser atualizado.
     * @param {Object} servicoData Os dados atualizados do serviço.
     * @returns {Promise<Object>} O serviço atualizado.
     * @throws {Error} Se a requisição falhar.
     */
    async atualizarServico(id, servicoData) {
        try {
            const token = this.getAuthToken();
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${this.servicosUrl}/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(servicoData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao atualizar o serviço.');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro no PontoService.atualizarServico:', error);
            throw error;
        }
    }
    
    /**
     * Atualiza um evento existente.
     * @param {string} id O ID do evento a ser atualizado.
     * @param {Object} eventoData Os dados atualizados do evento.
     * @returns {Promise<Object>} O evento atualizado.
     * @throws {Error} Se a requisição falhar.
     */
    async atualizarEvento(id, eventoData) {
        try {
            const response = await fetch(`${this.eventosUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventoData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao atualizar o evento.');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro no PontoService.atualizarEvento:', error);
            throw error;
        }
    }

    /**
     * Deleta um serviço.
     * @param {string} id O ID do serviço a ser deletado.
     * @returns {Promise<Object>} Uma promessa que resolve para uma mensagem de sucesso.
     * @throws {Error} Se a requisição falhar.
     */
    async deletarServico(id) {
        try {
            const token = this.getAuthToken();
            const headers = {};
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${this.servicosUrl}/${id}`, {
                method: 'DELETE',
                headers: headers
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao deletar o serviço.');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro no PontoService.deletarServico:', error);
            throw error;
        }
    }
    
    /**
     * Deleta um evento.
     * @param {string} id O ID do evento a ser deletado.
     * @returns {Promise<Object>} Uma promessa que resolve para uma mensagem de sucesso.
     * @throws {Error} Se a requisição falhar.
     */
    async deletarEvento(id) {
        try {
            const response = await fetch(`${this.eventosUrl}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao deletar o evento.');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro no PontoService.deletarEvento:', error);
            throw error;
        }
    }

    /**
     * Busca pontos turísticos (serviços) com base em uma query de texto.
     * @param {string} query A string de busca.
     * @returns {Promise<Array>} Uma promessa que resolve para uma lista de pontos correspondentes.
     * @throws {Error} Se a requisição falhar.
     */
    async buscarPontos(query) {
        try {
            const response = await fetch(`${this.servicosUrl}?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao buscar os pontos.');
            }
            const data = await response.json();
            return data.data; // Retorna a lista de dados.
        } catch (error) {
            console.error('Erro no PontoService.buscarPontos:', error);
            throw error;
        }
    }
    
    /**
     * Obtém estatísticas do dashboard.
     * @returns {Promise<Object>} As estatísticas do dashboard.
     * @throws {Error} Se a requisição falhar.
     */
    async obterEstatisticas() {
        try {
            const response = await fetch(this.estatisticasUrl);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao carregar as estatísticas.');
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Erro no PontoService.obterEstatisticas:', error);
            throw error;
        }
    }

    /**
     * Registra um novo usuário.
     * @param {FormData} formData Os dados do formulário, incluindo a foto.
     * @returns {Promise<Object>} O usuário recém-criado.
     * @throws {Error} Se a requisição falhar.
     */
    async registrarUsuario(formData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao registrar usuário.');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro no PontoService.registrarUsuario:', error);
            throw error;
        }
    }

    /**
     * Autentica um usuário.
     * @param {string} email O email do usuário.
     * @param {string} senha A senha do usuário.
     * @returns {Promise<Object>} Os dados do usuário logado.
     * @throws {Error} Se a requisição falhar ou as credenciais forem inválidas.
     */
    async loginUsuario(email, senha) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha na autenticação.');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro no PontoService.loginUsuario:', error);
            throw error;
        }
    }

    /**
     * Verifica se o usuário está autenticado.
     * @returns {Object|null} Os dados do usuário se estiver logado, ou null.
     */
    getUsuarioAutenticado() {
        try {
            const usuario = localStorage.getItem('usuarioAutenticado');
            return usuario ? JSON.parse(usuario) : null;
        } catch (e) {
            console.error('Falha ao obter usuário do localStorage:', e);
            return null;
        }
    }

    /**
     * Faz logout do usuário, removendo os dados de autenticação.
     */
    logoutUsuario() {
        localStorage.removeItem('usuarioAutenticado');
        localStorage.removeItem('authToken');
        console.log('Logout realizado');
        window.location.href = 'index.html'; // Redireciona para a página principal
    }

    /**
     * Obtém o token de autenticação.
     * @returns {string|null} O token se estiver logado, ou null.
     */
    getAuthToken() {
        return localStorage.getItem('authToken');
    }

}

// Exporta uma única instância do serviço para ser usada em toda a aplicação
export default new PontoService();