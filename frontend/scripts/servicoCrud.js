// scripts/servicoCrud.js
// Gerenciador de CRUD de Serviços Turísticos integrado ao mapa

class ServicoCrudManager {
    constructor(map, pontoService) {
        this.map = map;
        this.pontoService = pontoService;
        this.marcadores = L.MarkerClusterGroup();
        this.miniMapa = null;
        this.miniMapaMarcador = null;
        this.servicos = [];
        this.filtroAtivo = '';
        this.modoEdicao = false;

        this.initializeElements();
        this.setupEventListeners();
        this.setupMiniMapa();
        this.carregarServicos();
    }

    initializeElements() {
        // Modal elements
        this.modal = new bootstrap.Modal(document.getElementById('modalPonto'));
        this.form = document.getElementById('formPonto');
        this.tituloModal = document.getElementById('tituloModal');
        this.btnTexto = document.getElementById('btnTexto');
        this.alertContainer = document.getElementById('alertContainer');

        // Form inputs
        this.inputNome = document.getElementById('inputNome');
        this.inputTipoServico = document.getElementById('inputTipoServico');
        this.inputDescricao = document.getElementById('inputDescricao');
        this.inputLatitude = document.getElementById('inputLatitude');
        this.inputLongitude = document.getElementById('inputLongitude');
        this.inputTelefone = document.getElementById('inputTelefone');
        this.inputInstagram = document.getElementById('inputInstagram');
        this.inputServicoId = document.getElementById('inputServicoId');
        this.camposDinamicos = document.getElementById('camposDinamicos');

        // Campo de busca de endereço
        this.inputEndereco = document.getElementById('inputEnderecoServico');
        this.btnBuscarEndereco = document.getElementById('btnBuscarEnderecoServico');
        this.resultadosBusca = document.getElementById('resultadosBuscaServico');

        // Filter elements
        this.filtrosTipo = document.querySelectorAll('input[name="filtroTipo"]');
        this.listaServicos = document.getElementById('listaPontos');

        // Buttons
        this.btnNovoPonto = document.getElementById('btnNovoPonto');
        this.btnAtualizarLista = document.getElementById('btnAtualizarLista');
        this.btnAdicionarNoMapa = document.getElementById('btnAdicionarNoMapa');
    }

    setupEventListeners() {
        // Formulário
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.inputTipoServico.addEventListener('change', () => this.atualizarCamposDinamicos());

        // Coordenadas
        this.inputLatitude.addEventListener('change', () => this.atualizarMiniMapa());
        this.inputLongitude.addEventListener('change', () => this.atualizarMiniMapa());

        // Filtros
        this.filtrosTipo.forEach(filtro => {
            filtro.addEventListener('change', (e) => this.aplicarFiltro(e.target.value));
        });

        // Botões
        this.btnNovoPonto.addEventListener('click', () => this.abrirModalCriacao());
        this.btnAtualizarLista.addEventListener('click', () => this.carregarServicos());
        this.btnAdicionarNoMapa.addEventListener('click', () => this.abrirModalCriacao());

        // Clique no mapa para criar novo serviço
        this.map.on('click', (e) => this.onMapClick(e));

        // Modal events
        document.getElementById('modalPonto').addEventListener('hidden.bs.modal', () => this.limparFormulario());
    }

    setupMiniMapa() {
        // Aguarda o modal ser mostrado para inicializar o mini mapa
        document.getElementById('modalPonto').addEventListener('shown.bs.modal', () => {
            if (!this.miniMapa) {
                this.miniMapa = L.map('miniMapa').setView([-6.8897, -38.5583], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.miniMapa);

                // Clique no mini mapa atualiza coordenadas
                this.miniMapa.on('click', (e) => {
                    this.inputLatitude.value = e.latlng.lat.toFixed(6);
                    this.inputLongitude.value = e.latlng.lng.toFixed(6);
                    this.atualizarMiniMapa();
                });
            }

            // Força o redimensionamento do mini mapa
            setTimeout(() => {
                this.miniMapa.invalidateSize();
                this.atualizarMiniMapa();
            }, 100);
        });
    }

    atualizarMiniMapa() {
        if (!this.miniMapa) return;

        const lat = parseFloat(this.inputLatitude.value);
        const lng = parseFloat(this.inputLongitude.value);

        if (!isNaN(lat) && !isNaN(lng)) {
            // Remove marcador anterior
            if (this.miniMapaMarcador) {
                this.miniMapa.removeLayer(this.miniMapaMarcador);
            }

            // Adiciona novo marcador
            this.miniMapaMarcador = L.marker([lat, lng]).addTo(this.miniMapa);
            this.miniMapa.setView([lat, lng], 16);
        }
    }

    atualizarCamposDinamicos() {
        const tipo = this.inputTipoServico.value;
        this.camposDinamicos.innerHTML = '';

        if (!tipo) return;

        let camposHTML = '<h6 class="mt-3 mb-3"><i class="fas fa-cog me-2"></i>Informações Específicas</h6>';

        switch (tipo) {
            case 'Hospedagem':
                camposHTML += `
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Tipo de Hospedagem</label>
                                <select class="form-select" id="inputSubcategoria">
                                    <option value="">Selecione...</option>
                                    <option value="Hotel">Hotel</option>
                                    <option value="Pousada">Pousada</option>
                                    <option value="Hostel">Hostel</option>
                                    <option value="Casa de Temporada">Casa de Temporada</option>
                                    <option value="Apartamento">Apartamento</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Faixa de Preço</label>
                                <select class="form-select" id="inputFaixaPreco">
                                    <option value="">Não informado</option>
                                    <option value="$">$ - Econômico</option>
                                    <option value="$$">$$ - Moderado</option>
                                    <option value="$$$">$$$ - Caro</option>
                                    <option value="$$$$">$$$$ - Muito Caro</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'Alimentação/Lazer':
                camposHTML += `
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Tipo de Estabelecimento</label>
                                <select class="form-select" id="inputSubcategoria">
                                    <option value="">Selecione...</option>
                                    <option value="Restaurante">Restaurante</option>
                                    <option value="Lanchonete">Lanchonete</option>
                                    <option value="Bar">Bar</option>
                                    <option value="Cafeteria">Cafeteria</option>
                                    <option value="Sorveteria">Sorveteria</option>
                                    <option value="Casa de Shows">Casa de Shows</option>
                                    <option value="Clube">Clube</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Tipo de Cozinha</label>
                                <input type="text" class="form-control" id="inputTipoCozinha" placeholder="Ex: Nordestina, Italiana, Caseira...">
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Horário de Funcionamento</label>
                        <input type="text" class="form-control" id="inputHorario" placeholder="Ex: Seg-Dom: 18h às 23h">
                    </div>
                `;
                break;

            case 'Ponto Turístico':
                camposHTML += `
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Categoria</label>
                                <select class="form-select" id="inputSubcategoria">
                                    <option value="">Selecione...</option>
                                    <option value="Igreja">Igreja/Templo</option>
                                    <option value="Museu">Museu</option>
                                    <option value="Praça">Praça/Parque</option>
                                    <option value="Monumento">Monumento</option>
                                    <option value="Centro Cultural">Centro Cultural</option>
                                    <option value="Mirante">Mirante</option>
                                    <option value="Trilha">Trilha</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Entrada</label>
                                <select class="form-select" id="inputEntrada">
                                    <option value="Gratuita">Gratuita</option>
                                    <option value="Paga">Paga</option>
                                    <option value="Doação">Doação</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Horário de Visitação</label>
                        <input type="text" class="form-control" id="inputHorario" placeholder="Ex: Ter-Dom: 8h às 17h">
                    </div>
                `;
                break;
        }

        this.camposDinamicos.innerHTML = camposHTML;
    }

    async carregarServicos() {
        try {
            console.log('Carregando serviços...');
            this.servicos = await this.pontoService.listarServicos();
            console.log('Serviços carregados:', this.servicos);
            this.renderizarServicos();
            this.adicionarMarcadoresNoMapa();
        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            this.mostrarAlerta('Erro ao carregar serviços: ' + error.message, 'danger');
        }
    }

    renderizarServicos() {
        const servicosFiltrados = this.filtroAtivo
            ? this.servicos.filter(s => s.tipo_servico === this.filtroAtivo)
            : this.servicos;

        this.listaServicos.innerHTML = '';

        const usuarioLogadoId = this.getUsuarioId(); // Obtém o ID do usuário

        servicosFiltrados.forEach(servico => {
            const item = document.createElement('div');
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${servico.nome}</h6>
                        <p class="mb-1 text-muted">
                            ${this.getIconePorTipo(servico.tipo_servico)} ${servico.tipo_servico}
                        </p>
                        <small class="text-muted">${servico.descricao ? servico.descricao.substring(0, 60) + '...' : 'Sem descrição'}</small>
                    </div>
                    <div class="btn-group-vertical btn-group-sm">
                        <button class="btn btn-outline-primary btn-sm" onclick="servicoCrud.visualizarServico('${servico._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${servico.usuario === usuarioLogadoId ? `
                        <button class="btn btn-outline-warning btn-sm" onclick="servicoCrud.editarServico('${servico._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="servicoCrud.excluirServico('${servico._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        ` : ''}
                    </div>
                </div>
            `;

            // Clique no item centraliza no mapa
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-group-vertical')) {
                    this.centralizarNoServico(servico);
                }
            });

            this.listaServicos.appendChild(item);
        });
    }

    adicionarMarcadoresNoMapa() {
        // Limpa marcadores existentes
        this.map.removeLayer(this.marcadores);
        this.marcadores = new L.MarkerClusterGroup();

        this.servicos.forEach(servico => {
            if (servico.localizacao && servico.localizacao.latitude && servico.localizacao.longitude) {
                const marcador = L.marker([servico.localizacao.latitude, servico.localizacao.longitude], {
                    icon: this.criarIconePorTipo(servico.tipo_servico)
                });

                const usuarioLogadoId = this.getUsuarioId();
                const popupContent = `
                    <div class="popup-servico">
                        <h6>${servico.nome}</h6>
                        <p class="mb-1">${this.getIconePorTipo(servico.tipo_servico)} ${servico.tipo_servico}</p>
                        <p class="mb-2">${servico.descricao ? servico.descricao.substring(0, 100) + '...' : ''}</p>
                        <div class="btn-group btn-group-sm w-100">
                            <button class="btn btn-primary" onclick="servicoCrud.visualizarServico('${servico._id}')">
                                <i class="fas fa-eye me-1"></i>Ver
                            </button>
                            ${servico.usuario === usuarioLogadoId ? `
                            <button class="btn btn-warning" onclick="servicoCrud.editarServico('${servico._id}')">
                                <i class="fas fa-edit me-1"></i>Editar
                            </button>
                            <button class="btn btn-danger" onclick="servicoCrud.excluirServico('${servico._id}')">
                                <i class="fas fa-trash me-1"></i>Excluir
                            </button>
                            ` : ''}
                        </div>
                    </div>
                `;

                marcador.bindPopup(popupContent);
                this.marcadores.addLayer(marcador);
            }
        });

        this.map.addLayer(this.marcadores);
    }

    criarIconePorTipo(tipo) {
        let iconClass, color;

        switch (tipo) {
            case 'Hospedagem':
                iconClass = 'fa-bed';
                color = '#28a745';
                break;
            case 'Alimentação/Lazer':
                iconClass = 'fa-utensils';
                color = '#fd7e14';
                break;
            case 'Ponto Turístico':
                iconClass = 'fa-landmark';
                color = '#6f42c1';
                break;
            default:
                iconClass = 'fa-map-marker-alt';
                color = '#007bff';
        }

        return L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-icon" style="background-color: ${color}">
                    <i class="fas ${iconClass}"></i>
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
    }

    getIconePorTipo(tipo) {
        switch (tipo) {
            case 'Hospedagem': return '🏨';
            case 'Alimentação/Lazer': return '🍽️';
            case 'Ponto Turístico': return '🏛️';
            default: return '📍';
        }
    }

    aplicarFiltro(tipo) {
        this.filtroAtivo = tipo;
        this.renderizarServicos();
        // TODO: Filtrar marcadores no mapa também
    }

    onMapClick(e) {
        // Só cria novo serviço se estiver em modo de edição ou for admin
        // Por enquanto, sempre permite (depois integrar com autenticação)
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            this.abrirModalCriacao({
                latitude: e.latlng.lat,
                longitude: e.latlng.lng
            });
        }
    }

    abrirModalCriacao(coordenadas = null) {
        this.limparFormulario();
        this.tituloModal.textContent = 'Novo Serviço Turístico';
        this.btnTexto.textContent = 'Salvar Serviço';

        if (coordenadas) {
            this.inputLatitude.value = coordenadas.latitude.toFixed(6);
            this.inputLongitude.value = coordenadas.longitude.toFixed(6);
        } else {
            // Define coordenadas padrão de Cajazeiras se não fornecidas
            this.inputLatitude.value = '-6.8897';
            this.inputLongitude.value = '-38.5583';
        }

        this.modal.show();
    }

    async visualizarServico(id) {
        try {
            const servico = await this.pontoService.obterServico(id);
            // TODO: Implementar modal de visualização
            console.log('Visualizar serviço:', servico);
        } catch (error) {
            this.mostrarAlerta('Erro ao carregar serviço: ' + error.message, 'danger');
        }
    }

    async editarServico(id) {
        try {
            const servico = await this.pontoService.obterServico(id);
            this.preencherFormulario(servico);
            this.tituloModal.textContent = 'Editar Serviço';
            this.btnTexto.textContent = 'Atualizar Serviço';
            this.modal.show();
        } catch (error) {
            this.mostrarAlerta('Erro ao carregar serviço: ' + error.message, 'danger');
        }
    }

    async excluirServico(id) {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            try {
                const usuarioId = this.getUsuarioId();
                await this.pontoService.deletarServico(id, usuarioId); // Envia o ID do usuário
                this.mostrarAlerta('Serviço excluído com sucesso!', 'success');
                this.carregarServicos();
            } catch (error) {
                this.mostrarAlerta('Erro ao excluir serviço: ' + error.message, 'danger');
            }
        }
    }

    preencherFormulario(servico) {
        this.inputServicoId.value = servico._id;
        this.inputNome.value = servico.nome || '';
        this.inputTipoServico.value = servico.tipo_servico || '';
        this.inputDescricao.value = servico.descricao || '';

        if (servico.localizacao) {
            this.inputLatitude.value = servico.localizacao.latitude || '';
            this.inputLongitude.value = servico.localizacao.longitude || '';
        }

        if (servico.contato) {
            this.inputTelefone.value = servico.contato.telefone || '';
            this.inputInstagram.value = servico.contato.instagram || '';
        }

        // Atualiza campos dinâmicos
        this.atualizarCamposDinamicos();

        // Preenche campos dinâmicos se existirem
        setTimeout(() => {
            if (servico.categoria) {
                const subcategoria = document.getElementById('inputSubcategoria');
                if (subcategoria) subcategoria.value = servico.categoria;
            }
        }, 100);
    }

    limparFormulario() {
        this.form.reset();
        this.inputServicoId.value = '';
        this.camposDinamicos.innerHTML = '';
        this.alertContainer.innerHTML = '';

        if (this.miniMapaMarcador) {
            this.miniMapa.removeLayer(this.miniMapaMarcador);
            this.miniMapaMarcador = null;
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const dadosServico = this.coletarDadosFormulario();
        const isEdicao = !!this.inputServicoId.value;

        try {
            const usuarioId = this.getUsuarioId();
            if (isEdicao) {
                await this.pontoService.atualizarServico(this.inputServicoId.value, usuarioId, dadosServico);
                this.mostrarAlerta('Serviço atualizado com sucesso!', 'success');
            } else {
                await this.pontoService.criarServico(dadosServico);
                this.mostrarAlerta('Serviço criado com sucesso!', 'success');
            }

            this.modal.hide();
            this.carregarServicos();
        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
            this.mostrarAlerta('Erro ao salvar serviço: ' + error.message, 'danger');
        }
    }

    coletarDadosFormulario() {
        const dados = {
            nome: this.inputNome.value.trim(),
            tipo_servico: this.inputTipoServico.value,
            descricao: this.inputDescricao.value.trim(),
            localizacao: {
                latitude: parseFloat(this.inputLatitude.value),
                longitude: parseFloat(this.inputLongitude.value)
            },
            contato: {
                telefone: this.inputTelefone.value.trim(),
                instagram: this.inputInstagram.value.trim()
            }
        };

        // Adiciona campos dinâmicos
        const subcategoria = document.getElementById('inputSubcategoria');
        if (subcategoria && subcategoria.value) {
            dados.categoria = subcategoria.value;
        }

        return dados;
    }

    centralizarNoServico(servico) {
        if (servico.localizacao && servico.localizacao.latitude && servico.localizacao.longitude) {
            this.map.setView([servico.localizacao.latitude, servico.localizacao.longitude], 17);
        }
    }

    mostrarAlerta(mensagem, tipo = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${tipo} alert-dismissible fade show`;
        alert.innerHTML = `
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        this.alertContainer.innerHTML = '';
        this.alertContainer.appendChild(alert);

        // Auto remove após 5 segundos
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    // Método para obter o ID do usuário (mesclado do AuthService)
    getUsuarioId() {
        // Lógica real para obter o ID do usuário autenticado (ex: do token JWT)
        // IMPORTANTE: Altere este valor para o ID do usuário que você está testando.
        // Ele deve corresponder a um usuário que é proprietário de um serviço no seu banco de dados para que os botões de edição/exclusão apareçam e funcionem.
        return "68acfd1a25aaff2fa222e132";
    }
}

// Variável global para acesso fácil
let servicoCrud = null;

// Garante que o script só seja executado após o DOM ser carregado
document.addEventListener('DOMContentLoaded', () => {
    // Inicialização do mapa
    const map = L.map('mapa').setView([-6.8897, -38.5583], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Inicialização do gerenciador de serviços
    const pontoService = new PontoService();
    let servicoCrud = new ServicoCrudManager(map, pontoService);
    window.servicoCrud = servicoCrud;
});

// A classe PontoService precisa ser definida em algum lugar do seu código
// (exemplo abaixo)
class PontoService {
    async listarServicos() {
        const response = await fetch('/api/servicos');
        if (!response.ok) {
            throw new Error('Erro ao listar serviços.');
        }
        return response.json();
    }

    async obterServico(id) {
        const response = await fetch(`/api/servicos/${id}`);
        if (!response.ok) {
            throw new Error('Serviço não encontrado.');
        }
        return response.json();
    }

    async criarServico(dados) {
        const response = await fetch('/api/servicos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao criar serviço.');
        }

        return response.json();
    }

    async atualizarServico(id, usuarioId, dados) {
        const response = await fetch(`/api/servicos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...dados, usuarioId }), 
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao atualizar serviço.');
        }

        return response.json();
    }

    async deletarServico(id, usuarioId) {
        const response = await fetch(`/api/servicos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usuarioId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao excluir serviço.');
        }
    }
}