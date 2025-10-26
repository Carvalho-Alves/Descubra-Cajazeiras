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
    this.inputImagem = document.getElementById('inputImagemServico');
    this.previewImagem = document.getElementById('previewImagemServico');
    this.btnLimparImagem = document.getElementById('btnLimparImagemServico');
        
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
        
        // Busca
        this.inputBusca = document.getElementById('inputBuscaServicos');
        this.btnBuscar = document.getElementById('btnBuscarServicos');
        if (this.btnBuscar) this.btnBuscar.addEventListener('click', () => this.aplicarBuscaEFiltro());
        if (this.inputBusca) {
            this.inputBusca.addEventListener('input', () => this.aplicarBuscaEFiltro());
            this.inputBusca.addEventListener('keydown', (e) => { if (e.key === 'Enter'){ e.preventDefault(); this.aplicarBuscaEFiltro(); }});
        }
        document.getElementById('modalServico').addEventListener('hidden.bs.modal', () => {
            this.limparFormulario();
        });

        // Imagem: preview e limpar
        if (this.inputImagem) {
            this.inputImagem.addEventListener('change', () => this.atualizarPreviewImagem());
        }
        if (this.btnLimparImagem) {
            this.btnLimparImagem.addEventListener('click', () => this.limparImagem());
        }
    }

    checkAuthentication() {
        const usuario = this.getUsuarioAutenticado();
        const token = localStorage.getItem('authToken');
        const usuarioLogado = usuario !== null && token !== null;

        if (usuarioLogado) {
            const nomeUsuario = usuario.user?.nome || usuario.nome || "Usuário";
            const fotoRaw = usuario.user?.foto || usuario.foto || '';
            let avatarUrl = 'assets/images/default-avatar.svg';
            if (fotoRaw) {
                if (typeof fotoRaw === 'string' && (fotoRaw.startsWith('http') || fotoRaw.startsWith('/'))) {
                    avatarUrl = fotoRaw;
                } else {
                    const m = String(fotoRaw).match(/uploads[\\/].*$/i);
                    if (m) avatarUrl = '/' + m[0].replace(/\\/g, '/');
                }
            }
            // Cache-buster baseado em updatedAt armazenado no objeto ou em flag local
            try {
                const storedVersion = localStorage.getItem('avatarVersion');
                const updatedAtRaw = (usuario.user?.updatedAt || usuario.updatedAt);
                const version = storedVersion || (updatedAtRaw ? String(new Date(updatedAtRaw).getTime()) : '');
                if (version && avatarUrl && !avatarUrl.startsWith('assets/')) {
                    const joinChar = avatarUrl.includes('?') ? '&' : '?';
                    avatarUrl = `${avatarUrl}${joinChar}v=${encodeURIComponent(version)}`;
                }
            } catch {}
            this.usuarioArea.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-primary dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown">
                        <img src="${avatarUrl}" alt="Avatar" class="avatar-img rounded-circle me-2" style="width:28px;height:28px;object-fit:cover;" onerror="this.onerror=null;this.src='assets/images/default-avatar.svg';this.classList.add('loaded');" onload="this.classList.add('loaded')"> ${nomeUsuario}
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

    getServicosFiltrados() {
        const q = (this.inputBusca?.value || '').toLowerCase().trim();
        let lista = this.servicos;
        if (this.filtroAtivo) lista = lista.filter(s => (s.tipo_servico || '') === this.filtroAtivo);
        if (q) {
            lista = lista.filter(s =>
                (s.nome || '').toLowerCase().includes(q) ||
                (s.descricao || '').toLowerCase().includes(q)
            );
        }
        return lista;
    }

    aplicarBuscaEFiltro() {
        const servicosFiltrados = this.getServicosFiltrados();
        this.renderizarServicos(servicosFiltrados);
        this.adicionarMarcadoresNoMapa(servicosFiltrados);
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
            const token = localStorage.getItem('authToken');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await fetch('/api/servicos/mine', { headers });
            if (response.status === 401) {
                this.mostrarAlerta('Faça login para visualizar seus serviços.', 'warning');
                setTimeout(()=> window.location.href = 'auth.html', 1000);
                this.loadingServicos.style.display = 'none';
                return;
            }
            if (!response.ok) throw new Error('Falha ao buscar serviços.');
            
            this.servicos = await response.json();
            this.aplicarBuscaEFiltro();
            this.atualizarEstatisticas();
        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            this.mostrarAlerta('Erro ao carregar serviços: ' + error.message, 'danger');
        } finally {
            this.loadingServicos.style.display = 'none';
        }
    }

    renderizarServicos(servicosFiltrados = null) {
        if (!servicosFiltrados) servicosFiltrados = this.getServicosFiltrados();

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

    adicionarMarcadoresNoMapa(servicosFiltrados = null) {
        if (!servicosFiltrados) servicosFiltrados = this.getServicosFiltrados();
        this.map.removeLayer(this.marcadores);
        this.marcadores = new L.MarkerClusterGroup();
        
        servicosFiltrados.forEach(servico => {
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
                        <div class="btn-group btn-group-sm w-100 mt-1">
                            <button class="btn btn-outline-secondary" onclick="avaliacoesUI.abrir('servico','${servico._id}', ${JSON.stringify(servico.nome||'Serviço')})">
                                <i class="fas fa-star me-1"></i>Avaliações
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
        this.aplicarBuscaEFiltro();
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
        // Reset preview imagem
        if (this.previewImagem) {
            this.previewImagem.src = 'assets/images/favicon.png';
        }
        if (this.inputImagem) {
            this.inputImagem.value = '';
        }
        
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
            // Usa FormData para suportar upload de imagem
            const formData = new FormData();
            formData.append('nome', dadosServico.nome);
            formData.append('tipo_servico', dadosServico.tipo_servico);
            if (dadosServico.descricao) formData.append('descricao', dadosServico.descricao);
            formData.append('localizacao', JSON.stringify(dadosServico.localizacao));
            if (dadosServico.contato && (dadosServico.contato.telefone || dadosServico.contato.instagram)) {
                formData.append('contato', JSON.stringify(dadosServico.contato));
            }
            if (dadosServico.categoria) formData.append('categoria', dadosServico.categoria);
            if (this.inputImagem && this.inputImagem.files && this.inputImagem.files[0]) {
                formData.append('imagem', this.inputImagem.files[0]);
            }

            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            
            const response = await fetch(url, {
                method,
                headers,
                body: formData
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

    atualizarPreviewImagem() {
        const file = this.inputImagem?.files?.[0];
        if (!file) return this.limparImagem();
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB.');
            this.limparImagem();
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            if (this.previewImagem) this.previewImagem.src = reader.result;
        };
        reader.readAsDataURL(file);
    }

    limparImagem() {
    if (this.inputImagem) this.inputImagem.value = '';
    if (this.previewImagem) this.previewImagem.src = 'assets/images/favicon.png';
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

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.servicosPage = new ServicosPageManager();
});
