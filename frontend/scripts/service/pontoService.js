class PontoService {

    constructor() {
        this.servicosUrl = '/api/servicos'; 
        this.eventosUrl = '/api/eventos'; 
        this.estatisticasUrl = '/api/estatisticas';
    }

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

    getUsuarioAutenticado() {
        try {
            const usuario = localStorage.getItem('usuarioAutenticado');
            return usuario ? JSON.parse(usuario) : null;
        } catch (e) {
            console.error('Falha ao obter usuário do localStorage:', e);
            return null;
        }
    }

    logoutUsuario() {
        localStorage.removeItem('usuarioAutenticado');
        localStorage.removeItem('authToken');
        console.log('Logout realizado');
        window.location.href = 'index.html'; // Redireciona para a página principal
    }

    getAuthToken() {
        return localStorage.getItem('authToken');
    }

}

export default new PontoService();