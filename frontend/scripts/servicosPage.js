// scripts/servicosPage.js
// Página dedicada para gerenciar serviços turísticos

class ServicosPageManager {
    constructor() {
        this.map = null;
        this.marcadores = new L.MarkerClusterGroup();
        this.miniMapa = null;
        this.miniMapaMarcador = null;
        this.servicos = [];
        this.filtroAtivo = '';
        
        this.initializeElements();
        this.setupMap();
        this.setupEventListeners();
        this.checkAuthentication();
        this.carregarServicos();
    }

    initializeElements() {
        // Modal elements
        this.modal = new bootstrap.Modal(document.getElementById('modalServico'));
        this.form = document.getElementById('formServico');
        this.tituloModal = document.getElementById('tituloModalServico');
        this.btnTexto = document.getElementById('btnTextoServico');
        this.alertContainer = document.getElementById('alertContainerServico');
        
        // Form inputs
        this.inputNome = document.getElementById('inputNomeServico');
        this.inputTipoServico = document.getElementById('inputTipoServicoModal');
        this.inputDescricao = document.getElementById('inputDescricaoServico');
        this.inputLatitude = document.getElementById('inputLatitudeServico');
        this.inputLongitude = document.getElementById('inputLongitudeServico');
        this.inputTelefone = document.getElementById('inputTelefoneServico');
        this.inputInstagram = document.getElementById('inputInstagramServico');
        this.inputServicoId = document.getElementById('inputServicoIdModal');
        this.camposDinamicos = document.getElementById('camposDinamicosServico');
        
        // Page elements
        this.listaServicos = document.getElementById('listaServicos');
        this.loadingServicos = document.getElementById('loadingServicos');
        this.nenhumServico = document.getElementById('nenhumServico');
        this.usuarioArea = document.getElementById('usuario-area');
        
        // Statistics
        this.totalServicos = document.getElementById('totalServicos');
        this.totalHospedagem = document.getElementById('totalHospedagem');
        this.totalTuristico = document.getElementById('totalTuristico');
        
        // Filters
        this.filtrosServicos = document.querySelectorAll('input[name="filtroServico"]');
        
        // Buttons
        this.btnNovoServico = document.getElementById('btnNovoServico');
        this.btnNovoServicoMapa = document.getElementById('btnNovoServicoMapa');
        this.btnPrimeiroServico = document.getElementById('btnPrimeiroServico');
        this.btnAtualizarServicos = document.getElementById('btnAtualizarServicos');
        this.btnCentralizarMapa = document.getElementById('btnCentralizarMapa');
        this.btnDashboard = document.getElementById('btnDashboard');
    }

    setupMap() {
        // Mapa principal
        this.map = L.map('mapaServicos').setView([-6.8897, -38.5583], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
        
        // Clique no mapa para criar serviço
        this.map.on('click', (e) => {
            if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
                this.abrirModalCriacao({
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng
                });
            }
        });
    }

    setupEventListeners() {
        // Formulário
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.inputTipoServico.addEventListener('change', () => this.atualizarCamposDinamicos());
        
        // Coordenadas
        this.inputLatitude.addEventListener('change', () => this.atualizarMiniMapa());
        this.inputLongitude.addEventListener('change', () => this.atualizarMiniMapa());
        
        // Filtros
        this.filtrosServicos.forEach(filtro => {
            filtro.addEventListener('change', (e) => this.aplicarFiltro(e.target.value));
        });
        
        // Botões
        this.btnNovoServico.addEventListener('click', () => this.abrirModalCriacao());
        this.btnNovoServicoMapa.addEventListener('click', () => this.abrirModalCriacao());
        this.btnPrimeiroServico.addEventListener('click', () => this.abrirModalCriacao());
        this.btnAtualizarServicos.addEventListener('click', () => this.carregarServicos());
        this.btnCentralizarMapa.addEventListener('click', () => this.centralizarNaMinhaLocalizacao());
        
        // Modal events
        document.getElementById('modalServico').addEventListener('shown.bs.modal', () => {
            this.setupMiniMapa();
        });
        
        document.getElementById('modalServico').addEventListener('hidden.bs.modal', () => {
            this.limparFormulario();
        });
    }

    checkAuthentication() {
        const usuario = this.getUsuarioAutenticado();
        const token = localStorage.getItem('authToken');
        const usuarioLogado = usuario !== null && token !== null;

        if (usuarioLogado) {
            const nomeUsuario = usuario.user?.nome || usuario.nome || "Usuário";
            this.usuarioArea.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle me-2"></i> ${nomeUsuario}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="index.html">
                            <i class="fas fa-map me-2"></i>Voltar ao Mapa
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" id="btnSairServicos">
                            <i class="fas fa-sign-out-alt me-2"></i>Sair
                        </a></li>
                    </ul>
                </div>
            `;
            
            // Mostrar botão Dashboard para usuários logados
            if (this.btnDashboard) {
                this.btnDashboard.style.display = 'inline-block';
            }
            
            document.getElementById('btnSairServicos').addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Deseja realmente sair?')) {
                    this.logout();
                }
            });
        } else {
            this.usuarioArea.innerHTML = `
                <a href="auth.html" class="btn btn-primary">
                    <i class="fas fa-sign-in-alt me-2"></i>Entrar
                </a>
            `;
            
            // Esconder botão Dashboard para usuários não logados
            if (this.btnDashboard) {
                this.btnDashboard.style.display = 'none';
            }
        }
    }

    getUsuarioAutenticado() {
        try {
            const usuario = localStorage.getItem('usuarioAutenticado');
            return usuario ? JSON.parse(usuario) : null;
        } catch (e) {
            return null;
        }
    }

    logout() {
        localStorage.removeItem('usuarioAutenticado');
        localStorage.removeItem('authToken');
        window.location.href = 'index.html';
    }

    setupMiniMapa() {
        if (!this.miniMapa) {
            this.miniMapa = L.map('miniMapaServico').setView([-6.8897, -38.5583], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.miniMapa);
            
            this.miniMapa.on('click', (e) => {
                this.inputLatitude.value = e.latlng.lat.toFixed(6);
                this.inputLongitude.value = e.latlng.lng.toFixed(6);
                this.atualizarMiniMapa();
            });
        }
        
        setTimeout(() => {
            this.miniMapa.invalidateSize();
            this.atualizarMiniMapa();
        }, 100);
    }

    atualizarMiniMapa() {
        if (!this.miniMapa) return;
        
        const lat = parseFloat(this.inputLatitude.value);
        const lng = parseFloat(this.inputLongitude.value);
        
        if (!isNaN(lat) && !isNaN(lng)) {
            if (this.miniMapaMarcador) {
                this.miniMapa.removeLayer(this.miniMapaMarcador);
            }
            
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
                                    <option value="Casa de Shows">Casa de Shows</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Horário de Funcionamento</label>
                                <input type="text" class="form-control" id="inputHorario" placeholder="Ex: Seg-Dom: 18h às 23h">
                            </div>
                        </div>
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
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Horário de Visitação</label>
                                <input type="text" class="form-control" id="inputHorario" placeholder="Ex: Ter-Dom: 8h às 17h">
                            </div>
                        </div>
                    </div>
                `;
                break;
        }
        
        this.camposDinamicos.innerHTML = camposHTML;
    }

    async carregarServicos() {
        this.loadingServicos.style.display = 'block';
        this.listaServicos.innerHTML = '';
        this.nenhumServico.style.display = 'none';
        
        try {
            const response = await fetch('/api/servicos');
            if (!response.ok) throw new Error('Falha ao buscar serviços.');
            
            this.servicos = await response.json();
            this.renderizarServicos();
            this.adicionarMarcadoresNoMapa();
            this.atualizarEstatisticas();
        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            this.mostrarAlerta('Erro ao carregar serviços: ' + error.message, 'danger');
        } finally {
            this.loadingServicos.style.display = 'none';
        }
    }

    renderizarServicos() {
        const servicosFiltrados = this.filtroAtivo 
            ? this.servicos.filter(s => s.tipo_servico === this.filtroAtivo)
            : this.servicos;

        this.listaServicos.innerHTML = '';
        this.nenhumServico.style.display = servicosFiltrados.length === 0 ? 'block' : 'none';
        
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
                        <button class="btn btn-outline-warning btn-sm" onclick="servicosPage.editarServico('${servico._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="servicosPage.excluirServico('${servico._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-group-vertical')) {
                    this.centralizarNoServico(servico);
                }
            });
            
            this.listaServicos.appendChild(item);
        });
    }

    adicionarMarcadoresNoMapa() {
        this.map.removeLayer(this.marcadores);
        this.marcadores = new L.MarkerClusterGroup();
        
        this.servicos.forEach(servico => {
            if (servico.localizacao && servico.localizacao.latitude && servico.localizacao.longitude) {
                const marcador = L.marker([servico.localizacao.latitude, servico.localizacao.longitude], {
                    icon: this.criarIconePorTipo(servico.tipo_servico)
                });
                
                const popupContent = `
                    <div class="popup-servico">
                        <h6>${servico.nome}</h6>
                        <p class="mb-1">${this.getIconePorTipo(servico.tipo_servico)} ${servico.tipo_servico}</p>
                        <p class="mb-2">${servico.descricao ? servico.descricao.substring(0, 100) + '...' : ''}</p>
                        <div class="btn-group btn-group-sm w-100">
                            <button class="btn btn-warning" onclick="servicosPage.editarServico('${servico._id}')">
                                <i class="fas fa-edit me-1"></i>Editar
                            </button>
                            <button class="btn btn-danger" onclick="servicosPage.excluirServico('${servico._id}')">
                                <i class="fas fa-trash me-1"></i>Excluir
                            </button>
                        </div>
                    </div>
                `;
                
                marcador.bindPopup(popupContent);
                this.marcadores.addLayer(marcador);
            }
        });
        
        this.map.addLayer(this.marcadores);
    }

    atualizarEstatisticas() {
        const total = this.servicos.length;
        const hospedagem = this.servicos.filter(s => s.tipo_servico === 'Hospedagem').length;
        const turistico = this.servicos.filter(s => s.tipo_servico === 'Ponto Turístico').length;
        
        this.totalServicos.textContent = total;
        this.totalHospedagem.textContent = hospedagem;
        this.totalTuristico.textContent = turistico;
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
    }

    abrirModalCriacao(coordenadas = null) {
        this.limparFormulario();
        this.tituloModal.textContent = 'Novo Serviço Turístico';
        this.btnTexto.textContent = 'Salvar Serviço';
        
        if (coordenadas) {
            this.inputLatitude.value = coordenadas.latitude.toFixed(6);
            this.inputLongitude.value = coordenadas.longitude.toFixed(6);
        } else {
            this.inputLatitude.value = '-6.8897';
            this.inputLongitude.value = '-38.5583';
        }
        
        this.modal.show();
    }

    async editarServico(id) {
        try {
            const response = await fetch(`/api/servicos/${id}`);
            if (!response.ok) throw new Error('Serviço não encontrado');
            
            const servico = await response.json();
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
                const token = localStorage.getItem('authToken');
                const response = await fetch(`/api/servicos/${id}`, {
                    method: 'DELETE',
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                
                if (!response.ok) throw new Error('Erro ao excluir serviço');
                
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
        
        this.atualizarCamposDinamicos();
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
        const token = localStorage.getItem('authToken');
        
        try {
            const url = isEdicao ? `/api/servicos/${this.inputServicoId.value}` : '/api/servicos';
            const method = isEdicao ? 'PUT' : 'POST';
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(dadosServico)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao salvar serviço');
            }
            
            this.mostrarAlerta(
                isEdicao ? 'Serviço atualizado com sucesso!' : 'Serviço criado com sucesso!', 
                'success'
            );
            
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

    centralizarNaMinhaLocalizacao() {
        if (!navigator.geolocation) {
            alert('Geolocalização não é suportada por este navegador.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                this.map.setView([lat, lng], 16);
            },
            (error) => {
                alert('Erro ao obter localização: ' + error.message);
            }
        );
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
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
}

// === DASHBOARD MANAGER ===
class DashboardManager {
    constructor() {
        this.btnAtualizarDashboard = document.getElementById('btnAtualizarDashboard');
        this.graficos = {
            servicosPorTipo: null,
            crescimento: null
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Atualizar dashboard quando o modal for aberto
        document.getElementById('modalDashboard').addEventListener('shown.bs.modal', () => {
            this.carregarDashboard();
        });

        // Botão de atualizar
        this.btnAtualizarDashboard?.addEventListener('click', () => {
            this.carregarDashboard();
        });
    }

    async carregarDashboard() {
        try {
            // Buscar dados
            const [servicos, eventos] = await Promise.all([
                fetch('/api/servicos').then(res => res.json()),
                fetch('/api/eventos').then(res => res.json()).catch(() => [])
            ]);

            // Atualizar estatísticas
            this.atualizarEstatisticas(servicos, eventos);
            
            // Atualizar gráficos
            this.atualizarGraficos(servicos);
            
            // Atualizar listas
            this.atualizarListas(servicos, eventos);

        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        }
    }

    atualizarEstatisticas(servicos, eventos) {
        // Total de serviços
        document.getElementById('dashTotalServicos').textContent = servicos.length;
        
        // Total de eventos
        document.getElementById('dashTotalEventos').textContent = eventos.length;
        
        // Tipo mais comum
        const tiposCounts = {};
        servicos.forEach(s => {
            const tipo = s.tipo_servico || 'Outro';
            tiposCounts[tipo] = (tiposCounts[tipo] || 0) + 1;
        });
        
        const tipoMaisComum = Object.entries(tiposCounts)
            .sort((a, b) => b[1] - a[1])[0];
        
        document.getElementById('dashTipoMaisComum').textContent = 
            tipoMaisComum ? `${tipoMaisComum[0]} (${tipoMaisComum[1]})` : 'N/A';
        
        // Novos cadastros no mês
        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();
        const novosMes = servicos.filter(s => {
            if (!s.createdAt) return false;
            const data = new Date(s.createdAt);
            return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
        }).length;
        
        document.getElementById('dashCrescimentoMes').textContent = novosMes;
    }

    atualizarGraficos(servicos) {
        this.criarGraficoServicosPorTipo(servicos);
        this.criarGraficoCrescimento(servicos);
    }

    criarGraficoServicosPorTipo(servicos) {
        const ctx = document.getElementById('graficoServicosPorTipo');
        if (!ctx) return;

        // Contar por tipo
        const tiposCounts = {};
        servicos.forEach(s => {
            const tipo = s.tipo_servico || 'Outro';
            tiposCounts[tipo] = (tiposCounts[tipo] || 0) + 1;
        });

        // Destruir gráfico anterior se existir
        if (this.graficos.servicosPorTipo) {
            this.graficos.servicosPorTipo.destroy();
        }

        // Criar novo gráfico
        this.graficos.servicosPorTipo = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(tiposCounts),
                datasets: [{
                    data: Object.values(tiposCounts),
                    backgroundColor: [
                        '#0d6efd', // blue
                        '#198754', // green
                        '#ffc107', // yellow
                        '#dc3545', // red
                        '#6c757d'  // gray
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    criarGraficoCrescimento(servicos) {
        const ctx = document.getElementById('graficoCrescimento');
        if (!ctx) return;

        // Agrupar por mês (últimos 6 meses)
        const meses = [];
        const counts = [];
        const hoje = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            const mesNome = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            meses.push(mesNome);
            
            const count = servicos.filter(s => {
                if (!s.createdAt) return false;
                const servicoData = new Date(s.createdAt);
                return servicoData.getMonth() === data.getMonth() && 
                       servicoData.getFullYear() === data.getFullYear();
            }).length;
            
            counts.push(count);
        }

        // Destruir gráfico anterior se existir
        if (this.graficos.crescimento) {
            this.graficos.crescimento.destroy();
        }

        // Criar novo gráfico
        this.graficos.crescimento = new Chart(ctx, {
            type: 'line',
            data: {
                labels: meses,
                datasets: [{
                    label: 'Novos Serviços',
                    data: counts,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    atualizarListas(servicos, eventos) {
        // Serviços recentes (últimos 5)
        const servicosRecentes = [...servicos]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        const containerServicos = document.getElementById('dashServicosRecentes');
        containerServicos.innerHTML = servicosRecentes.length === 0 
            ? '<div class="list-group-item text-muted">Nenhum serviço cadastrado</div>'
            : servicosRecentes.map(s => `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${s.nome || s.titulo}</h6>
                            <small class="text-muted">${s.tipo_servico || 'Tipo não especificado'}</small>
                        </div>
                        <small class="text-muted">
                            ${s.createdAt ? new Date(s.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível'}
                        </small>
                    </div>
                </div>
            `).join('');

        // Próximos eventos (próximos 5)
        const hoje = new Date();
        const proximosEventos = eventos
            .filter(e => new Date(e.data) >= hoje)
            .sort((a, b) => new Date(a.data) - new Date(b.data))
            .slice(0, 5);

        const containerEventos = document.getElementById('dashProximosEventos');
        containerEventos.innerHTML = proximosEventos.length === 0
            ? '<div class="list-group-item text-muted">Nenhum evento próximo</div>'
            : proximosEventos.map(e => `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${e.nome}</h6>
                            <small class="text-muted">${e.local || 'Local a definir'}</small>
                        </div>
                        <small class="text-muted">
                            ${new Date(e.data).toLocaleDateString('pt-BR')}
                        </small>
                    </div>
                </div>
            `).join('');
    }
}

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.servicosPage = new ServicosPageManager();
    window.dashboardManager = new DashboardManager();
});
