// scripts/controller/estabelecimentoController.js

import estabelecimentoService from '../service/estabelecimentoService.js';
import Estabelecimento from '../models/Estabelecimento.js';

class EstabelecimentoController {
    constructor() {
        this.estabelecimentos = [];
        this.filtroAtual = '';
        this.buscaAtual = '';
        this.mapMarkers = [];
        this.initializeEventListeners();
    }

    /**
     * Inicializa os event listeners
     */
    initializeEventListeners() {
        // Botão de atualizar
        document.getElementById('btnAtualizarEstabelecimentos')?.addEventListener('click', () => {
            this.carregarEstabelecimentos();
        });

        // Filtros por tipo
        document.querySelectorAll('input[name="filtroEstabelecimento"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.filtroAtual = e.target.value;
                this.aplicarFiltros();
            });
        });

        // Busca por texto
        const inputBusca = document.getElementById('inputBuscaEstabelecimento');
        const btnBuscar = document.getElementById('btnBuscarEstabelecimento');
        const btnLimparBusca = document.getElementById('btnLimparBuscaEstabelecimento');

        if (inputBusca && btnBuscar && btnLimparBusca) {
            btnBuscar.addEventListener('click', () => {
                this.buscarEstabelecimentos();
            });

            inputBusca.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.buscarEstabelecimentos();
                }
            });

            btnLimparBusca.addEventListener('click', () => {
                this.limparBusca();
            });
        }

        // Botão novo estabelecimento
        document.getElementById('btnNovoEstabelecimento')?.addEventListener('click', () => {
            this.abrirModalNovoEstabelecimento();
        });
    }

    /**
     * Carrega todos os estabelecimentos
     */
    async carregarEstabelecimentos() {
        try {
            this.mostrarLoading(true);
            
            this.estabelecimentos = await estabelecimentoService.listAll();
            this.renderizarEstabelecimentos();
            
        } catch (error) {
            console.error('Erro ao carregar estabelecimentos:', error);
            this.mostrarErro('Erro ao carregar estabelecimentos');
        } finally {
            this.mostrarLoading(false);
        }
    }

    /**
     * Renderiza a lista de estabelecimentos
     */
    renderizarEstabelecimentos() {
        const container = document.getElementById('listaEstabelecimentos');
        const nenhumDiv = document.getElementById('nenhumEstabelecimento');
        
        if (!container) return;

        if (this.estabelecimentos.length === 0) {
            container.innerHTML = '';
            nenhumDiv.style.display = 'block';
            return;
        }

        nenhumDiv.style.display = 'none';
        
        const estabelecimentosFiltrados = this.aplicarFiltros();
        
        container.innerHTML = estabelecimentosFiltrados.map(estabelecimento => 
            this.criarCardEstabelecimento(estabelecimento)
        ).join('');
        
        // Adiciona os estabelecimentos ao mapa
        this.addEstabelecimentosToMap(estabelecimentosFiltrados);
    }

    /**
     * Aplica filtros e busca
     */
    aplicarFiltros() {
        let estabelecimentosFiltrados = [...this.estabelecimentos];

        // Filtro por tipo
        if (this.filtroAtual) {
            estabelecimentosFiltrados = estabelecimentosFiltrados.filter(
                e => e.tipo === this.filtroAtual
            );
        }

        // Filtro por busca
        if (this.buscaAtual) {
            const buscaLower = this.buscaAtual.toLowerCase();
            estabelecimentosFiltrados = estabelecimentosFiltrados.filter(e =>
                e.nome.toLowerCase().includes(buscaLower) ||
                e.categoria.toLowerCase().includes(buscaLower) ||
                e.descricao.toLowerCase().includes(buscaLower)
            );
        }

        return estabelecimentosFiltrados;
    }

    /**
     * Busca estabelecimentos por texto
     */
    async buscarEstabelecimentos() {
        const inputBusca = document.getElementById('inputBuscaEstabelecimento');
        const btnLimparBusca = document.getElementById('btnLimparBuscaEstabelecimento');
        
        if (!inputBusca) return;

        this.buscaAtual = inputBusca.value.trim();
        
        if (this.buscaAtual) {
            btnLimparBusca.style.display = 'inline-block';
            this.renderizarEstabelecimentos();
        } else {
            this.limparBusca();
        }
    }

    /**
     * Limpa a busca
     */
    limparBusca() {
        const inputBusca = document.getElementById('inputBuscaEstabelecimento');
        const btnLimparBusca = document.getElementById('btnLimparBuscaEstabelecimento');
        
        if (inputBusca && btnLimparBusca) {
            inputBusca.value = '';
            this.buscaAtual = '';
            btnLimparBusca.style.display = 'none';
            this.renderizarEstabelecimentos();
        }
    }

    /**
     * Cria o card HTML de um estabelecimento
     */
    criarCardEstabelecimento(estabelecimento) {
        const statusColor = estabelecimento.getStatusColor();
        const statusText = estabelecimento.getStatusText();
        const tipoIcon = estabelecimento.getTipoIcon();
        
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="card-title mb-0">
                            <i class="${tipoIcon} me-2"></i>
                            ${estabelecimento.nome}
                        </h6>
                        <span class="badge bg-${statusColor}">${statusText}</span>
                    </div>
                    
                    <div class="card-body">
                        <p class="card-text small text-muted mb-2">
                            <i class="fas fa-tag me-1"></i>${estabelecimento.categoria}
                        </p>
                        
                        <p class="card-text">${estabelecimento.descricao}</p>
                        
                        <div class="mb-2">
                            <strong><i class="fas fa-map-marker-alt me-1"></i>Endereço:</strong><br>
                            <small class="text-muted">${estabelecimento.getEnderecoCompleto()}</small>
                        </div>
                        
                        <div class="mb-2">
                            <strong><i class="fas fa-clock me-1"></i>Horário:</strong><br>
                            <small class="text-muted">
                                Seg: ${estabelecimento.getHorarioFormatado('segunda')}<br>
                                Ter: ${estabelecimento.getHorarioFormatado('terca')}<br>
                                Qua: ${estabelecimento.getHorarioFormatado('quarta')}<br>
                                Qui: ${estabelecimento.getHorarioFormatado('quinta')}<br>
                                Sex: ${estabelecimento.getHorarioFormatado('sexta')}<br>
                                Sáb: ${estabelecimento.getHorarioFormatado('sabado')}<br>
                                Dom: ${estabelecimento.getHorarioFormatado('domingo')}
                            </small>
                        </div>
                        
                        <div class="mb-2">
                            <strong><i class="fas fa-phone me-1"></i>Contato:</strong><br>
                            <small class="text-muted">${estabelecimento.getContatoFormatado()}</small>
                        </div>
                        
                        ${estabelecimento.servicos.length > 0 ? `
                            <div class="mb-2">
                                <strong><i class="fas fa-cogs me-1"></i>Serviços:</strong><br>
                                <small class="text-muted">${estabelecimento.getServicosFormatados()}</small>
                            </div>
                        ` : ''}
                        
                        ${estabelecimento.pagamentos.length > 0 ? `
                            <div class="mb-2">
                                <strong><i class="fas fa-credit-card me-1"></i>Pagamentos:</strong><br>
                                <small class="text-muted">${estabelecimento.getPagamentosFormatados()}</small>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="card-footer">
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-user me-1"></i>
                                ${estabelecimento.usuario?.nome || 'Admin'}
                            </small>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-info btn-sm" onclick="estabelecimentoController.showOnMap('${estabelecimento._id}')" title="Mostrar no mapa">
                                    <i class="fas fa-map-marker-alt"></i>
                                </button>
                                <button class="btn btn-outline-primary btn-sm" onclick="estabelecimentoController.editarEstabelecimento('${estabelecimento._id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger btn-sm" onclick="estabelecimentoController.removerEstabelecimento('${estabelecimento._id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Mostra/esconde o loading
     */
    mostrarLoading(mostrar) {
        const loadingDiv = document.getElementById('loadingEstabelecimentos');
        if (loadingDiv) {
            loadingDiv.style.display = mostrar ? 'block' : 'none';
        }
    }

    /**
     * Mostra mensagem de erro
     */
    mostrarErro(mensagem) {
        console.error(mensagem);
        // Pode ser implementado um toast ou alert mais elegante
        alert(mensagem);
    }

    /**
     * Abre modal para novo estabelecimento
     */
    abrirModalNovoEstabelecimento() {
        // Implementar modal de criação
        alert('Funcionalidade de criação em desenvolvimento');
    }

    /**
     * Adiciona estabelecimentos ao mapa
     */
    addEstabelecimentosToMap(estabelecimentos) {
        if (!window.map || !estabelecimentos || estabelecimentos.length === 0) return;
        
        // Remove marcadores existentes
        if (this.mapMarkers) {
            this.mapMarkers.forEach(marker => marker.remove());
            this.mapMarkers = [];
        }
        
        this.mapMarkers = estabelecimentos.map(estabelecimento => {
            const marker = L.marker([
                estabelecimento.localizacao.latitude,
                estabelecimento.localizacao.longitude
            ]).addTo(window.map);
            
            const popupContent = `
                <div class="estabelecimento-popup">
                    <h6><i class="fas ${estabelecimento.getTipoIcon()} me-2"></i>${estabelecimento.nome}</h6>
                    <p class="mb-1"><strong>${estabelecimento.categoria}</strong></p>
                    <p class="mb-1 small">${estabelecimento.descricao.substring(0, 100)}...</p>
                    <p class="mb-1 small"><i class="fas fa-map-marker-alt me-1"></i>${estabelecimento.getEnderecoCompleto()}</p>
                    <p class="mb-1 small"><i class="fas fa-phone me-1"></i>${estabelecimento.contato.telefone}</p>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-primary" onclick="estabelecimentoController.showEstabelecimentoDetails('${estabelecimento._id}')">
                            Ver detalhes
                        </button>
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            return marker;
        });
    }

    /**
     * Mostra estabelecimento no mapa
     */
    showOnMap(estabelecimentoId) {
        const estabelecimento = this.estabelecimentos.find(e => e._id === estabelecimentoId);
        if (!estabelecimento || !window.map) return;
        
        const lat = estabelecimento.localizacao.latitude;
        const lng = estabelecimento.localizacao.longitude;
        
        // Centraliza o mapa no estabelecimento
        window.map.setView([lat, lng], 16);
        
        // Encontra e abre o popup do marcador
        const marker = this.mapMarkers?.find(m => 
            m.getLatLng().lat === lat && m.getLatLng().lng === lng
        );
        if (marker) {
            marker.openPopup();
        }
    }

    /**
     * Mostra detalhes do estabelecimento
     */
    showEstabelecimentoDetails(estabelecimentoId) {
        const estabelecimento = this.estabelecimentos.find(e => e._id === estabelecimentoId);
        if (!estabelecimento) return;
        
        // Fecha o modal de estabelecimentos e mostra detalhes
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEstabelecimentos'));
        if (modal) modal.hide();
        
        // Aqui você pode implementar um modal de detalhes ou navegar para uma página específica
        alert(`Detalhes de ${estabelecimento.nome}\n\n${estabelecimento.descricao}`);
    }

    /**
     * Edita estabelecimento
     */
    editarEstabelecimento(id) {
        // Implementar modal de edição
        alert(`Editar estabelecimento ${id} - Funcionalidade em desenvolvimento`);
    }

    /**
     * Remove estabelecimento
     */
    async removerEstabelecimento(id) {
        if (confirm('Tem certeza que deseja remover este estabelecimento?')) {
            try {
                await estabelecimentoService.remove(id);
                this.carregarEstabelecimentos();
                alert('Estabelecimento removido com sucesso!');
            } catch (error) {
                console.error('Erro ao remover estabelecimento:', error);
                this.mostrarErro('Erro ao remover estabelecimento');
            }
        }
    }

    /**
     * Inicializa o controller
     */
    init() {
        this.carregarEstabelecimentos();
    }
}

// Cria e exporta uma instância única
const estabelecimentoController = new EstabelecimentoController();

// Torna disponível globalmente para uso nos event handlers
window.estabelecimentoController = estabelecimentoController;

export default estabelecimentoController;
