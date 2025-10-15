// pontoModel.js - Script para exibir detalhes do ponto turístico

/**
 * Gerenciador da página de detalhes do ponto
 */
class PontoDetailManager {
    constructor() {
        this.urlParams = new URLSearchParams(window.location.search);
        this.pontoId = this.urlParams.get('id');
        this.tipo = this.urlParams.get('tipo') || 'servico';
        
        // Elementos do DOM
        this.loading = document.getElementById('loading');
        this.conteudoPrincipal = document.getElementById('conteudo-principal');
        this.erroContainer = document.getElementById('erro-container');
        this.mensagemErro = document.getElementById('mensagemErro');
        this.usuarioArea = document.getElementById('usuario-area');
        this.acoesAdmin = document.getElementById('acoes-admin');
        
        // Estado
        this.map = null;
        this.miniMapaEdit = null;
        this.miniMarcadorEdit = null;
        this.ponto = null;
    }

    /**
     * Inicializa a página
     */
    async init() {
        this.verificarAutenticacao();
        
        if (!this.pontoId) {
            this.mostrarErro('ID do ponto não fornecido.');
            return;
        }

        this.mostrarLoading();
        
        try {
            await this.carregarDadosPonto();
            this.preencherInformacoes();
            this.mostrarConteudo();
            await this.inicializarMapa();
            this.configurarBotoesAdmin();
        } catch (error) {
            console.error('Erro ao carregar ponto:', error);
            this.mostrarErro(error.message || 'Erro ao carregar os detalhes do ponto.');
        }
    }

    /**
     * Verifica autenticação do usuário
     */
    verificarAutenticacao() {
        const token = localStorage.getItem('authToken');
        const usuario = localStorage.getItem('usuarioAutenticado');

        if (usuario && token) {
            try {
                const dadosUsuario = JSON.parse(usuario);
                const nomeUsuario = dadosUsuario.user?.nome || dadosUsuario.nome || "Usuário";
                
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
                            <li><a class="dropdown-item text-danger" href="#" onclick="pontoDetail.logout()">
                                <i class="fas fa-sign-out-alt me-2"></i>Sair
                            </a></li>
                        </ul>
                    </div>
                `;
                
                this.acoesAdmin.style.display = 'block';
            } catch (e) {
                console.error('Erro ao parsear usuário:', e);
                this.renderizarUsuarioDeslogado();
            }
        } else {
            this.renderizarUsuarioDeslogado();
        }
    }

    /**
     * Renderiza área de usuário deslogado
     */
    renderizarUsuarioDeslogado() {
        this.usuarioArea.innerHTML = `
            <a href="auth.html" class="btn btn-primary">
                <i class="fas fa-sign-in-alt me-2"></i>Entrar
            </a>
        `;
    }

    /**
     * Carrega dados do ponto da API
     */
    async carregarDadosPonto() {
        const endpoint = this.tipo === 'evento' 
            ? `/api/eventos/${this.pontoId}` 
            : `/api/servicos/${this.pontoId}`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error('Ponto não encontrado');
        }

        this.ponto = await response.json();
        console.log('Dados do ponto carregados:', this.ponto);
        
        // Normalizar coordenadas (podem estar em localizacao ou diretamente no objeto)
        if (this.ponto.localizacao) {
            this.ponto.latitude = this.ponto.localizacao.latitude || this.ponto.localizacao.lat;
            this.ponto.longitude = this.ponto.localizacao.longitude || this.ponto.localizacao.lng;
        }
        
        // Validar coordenadas logo após carregar
        if (!this.ponto.latitude || !this.ponto.longitude) {
            console.warn('⚠️ Ponto sem coordenadas:', {
                latitude: this.ponto.latitude,
                longitude: this.ponto.longitude,
                localizacao: this.ponto.localizacao
            });
        }
    }

    /**
     * Preenche as informações do ponto na página
     */
    preencherInformacoes() {
        // Nome
        document.getElementById('pontoNome').textContent = 
            this.ponto.nome || this.ponto.titulo || 'Sem nome';

        // Descrição
        document.getElementById('pontoDescricao').textContent = 
            this.ponto.descricao || 'Sem descrição disponível';

        // Badge do tipo
        this.preencherBadgeTipo();

        // Endereço
        let endereco = this.ponto.endereco || this.ponto.localizacao?.endereco;
        if (!endereco && this.ponto.latitude && this.ponto.longitude) {
            endereco = `Lat: ${this.ponto.latitude}, Lng: ${this.ponto.longitude}`;
        } else if (!endereco) {
            endereco = 'Endereço não disponível';
        }
        document.getElementById('pontoEndereco').textContent = endereco;

        // Campos dinâmicos específicos do tipo
        this.preencherCamposDinamicos();

        // Informações de contato
        this.preencherContato();
    }

    /**
     * Preenche o badge do tipo de serviço
     */
    preencherBadgeTipo() {
        const tipoBadge = document.getElementById('pontoTipoBadge');
        
        if (this.ponto.tipo_servico) {
            let badgeClass = 'tipo-badge';
            
            if (this.ponto.tipo_servico.includes('Hospedagem')) {
                badgeClass += ' tipo-hospedagem';
            } else if (this.ponto.tipo_servico.includes('Alimentação')) {
                badgeClass += ' tipo-alimentacao';
            } else {
                badgeClass += ' tipo-turistico';
            }
            
            tipoBadge.innerHTML = `<span class="${badgeClass}">${this.ponto.tipo_servico}</span>`;
        }
    }

    /**
     * Preenche campos dinâmicos baseados no tipo de serviço
     */
    preencherCamposDinamicos() {
        const container = document.getElementById('camposDinamicos');
        container.innerHTML = '';

        // Hospedagem - Categoria
        if (this.ponto.categoria_hospedagem) {
            container.innerHTML += this.criarInfoItem(
                'fas fa-hotel',
                'Categoria',
                this.ponto.categoria_hospedagem
            );
        }

        // Hospedagem - Número de quartos
        if (this.ponto.numero_quartos) {
            container.innerHTML += this.criarInfoItem(
                'fas fa-bed',
                'Quartos',
                this.ponto.numero_quartos
            );
        }

        // Alimentação - Tipo de cozinha
        if (this.ponto.tipo_cozinha) {
            container.innerHTML += this.criarInfoItem(
                'fas fa-utensils',
                'Tipo de Cozinha',
                this.ponto.tipo_cozinha
            );
        }

        // Horário de funcionamento (se houver)
        if (this.ponto.horario_funcionamento) {
            container.innerHTML += this.criarInfoItem(
                'fas fa-clock',
                'Horário',
                this.ponto.horario_funcionamento
            );
        }

        // Preço médio (se houver)
        if (this.ponto.preco_medio) {
            container.innerHTML += this.criarInfoItem(
                'fas fa-dollar-sign',
                'Preço Médio',
                this.ponto.preco_medio
            );
        }
    }

    /**
     * Cria um item de informação HTML
     */
    criarInfoItem(icone, label, valor) {
        return `
            <div class="info-item">
                <div class="info-icon">
                    <i class="${icone}"></i>
                </div>
                <div>
                    <h6 class="mb-1 text-muted">${label}</h6>
                    <p class="mb-0">${valor}</p>
                </div>
            </div>
        `;
    }

    /**
     * Preenche informações de contato
     */
    preencherContato() {
        const contatoSection = document.getElementById('contatoSection');
        let temContato = false;

        // Telefone
        if (this.ponto.telefone) {
            document.getElementById('telefoneItem').style.display = 'flex';
            document.getElementById('pontoTelefone').textContent = this.ponto.telefone;
            document.getElementById('pontoTelefone').href = `tel:${this.ponto.telefone}`;
            temContato = true;
        }

        // Instagram
        if (this.ponto.instagram) {
            document.getElementById('instagramItem').style.display = 'flex';
            const instagramHandle = this.ponto.instagram.replace('@', '');
            document.getElementById('pontoInstagram').textContent = '@' + instagramHandle;
            document.getElementById('pontoInstagram').href = `https://instagram.com/${instagramHandle}`;
            temContato = true;
        }

        // Email (se houver)
        if (this.ponto.email) {
            const emailItem = document.createElement('div');
            emailItem.className = 'info-item';
            emailItem.innerHTML = `
                <div class="info-icon">
                    <i class="fas fa-envelope"></i>
                </div>
                <div>
                    <h6 class="mb-1 text-muted">Email</h6>
                    <a href="mailto:${this.ponto.email}" class="text-decoration-none">${this.ponto.email}</a>
                </div>
            `;
            contatoSection.appendChild(emailItem);
            temContato = true;
        }

        contatoSection.style.display = temContato ? 'block' : 'none';
    }

    /**
     * Inicializa o mapa Leaflet
     */
    async inicializarMapa() {
        // Aguarda um pouco para garantir que o elemento existe no DOM
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const mapElement = document.getElementById('mapaPonto');
            
            if (!mapElement) {
                console.warn('Elemento do mapa não encontrado');
                return;
            }

            // Validar coordenadas
            const lat = parseFloat(this.ponto.latitude);
            const lng = parseFloat(this.ponto.longitude);

            if (isNaN(lat) || isNaN(lng)) {
                console.error('Coordenadas inválidas:', { lat: this.ponto.latitude, lng: this.ponto.longitude });
                mapElement.innerHTML = '<div class="alert alert-warning m-3">Coordenadas não disponíveis para este ponto.</div>';
                return;
            }

            // Inicializa o mapa
            this.map = L.map('mapaPonto').setView([lat, lng], 16);

            // Adiciona camada de tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(this.map);

            // Adiciona marcador
            const marker = L.marker([lat, lng])
                .addTo(this.map);

            // Popup do marcador
            const popupContent = `
                <div style="text-align: center;">
                    <strong>${this.ponto.nome || this.ponto.titulo}</strong>
                    ${this.ponto.tipo_servico ? `<br><small>${this.ponto.tipo_servico}</small>` : ''}
                </div>
            `;
            marker.bindPopup(popupContent).openPopup();

            // Força atualização do tamanho do mapa
            setTimeout(() => {
                this.map.invalidateSize();
            }, 100);

        } catch (mapError) {
            console.error('Erro ao inicializar mapa:', mapError);
        }
    }

    /**
     * Configura os botões de ação para administradores
     */
    configurarBotoesAdmin() {
        const btnEditar = document.getElementById('btnEditarPonto');
        const btnExcluir = document.getElementById('btnExcluirPonto');

        if (btnEditar) {
            btnEditar.addEventListener('click', () => this.abrirModalEdicao());
        }

        if (btnExcluir) {
            btnExcluir.addEventListener('click', () => this.excluirPonto());
        }
    }

    /**
     * Abre o modal de edição e preenche com os dados atuais
     */
    abrirModalEdicao() {
        // Preencher campos básicos
        document.getElementById('editNome').value = this.ponto.nome || '';
        document.getElementById('editTipoServico').value = this.ponto.tipo_servico || '';
        document.getElementById('editDescricao').value = this.ponto.descricao || '';
        
        // Localização
        document.getElementById('editEndereco').value = this.ponto.endereco || this.ponto.localizacao?.endereco || '';
        document.getElementById('editLatitude').value = this.ponto.latitude || '';
        document.getElementById('editLongitude').value = this.ponto.longitude || '';
        
        // Contato
        document.getElementById('editTelefone').value = this.ponto.telefone || '';
        document.getElementById('editInstagram').value = this.ponto.instagram?.replace('@', '') || '';

        // Preencher campos dinâmicos
        this.preencherCamposDinamicosEdicao();

        // Inicializar mini mapa de edição
        setTimeout(() => this.inicializarMiniMapaEdicao(), 300);

        // Configurar evento de submit
        const form = document.getElementById('formEditarPonto');
        form.onsubmit = (e) => this.salvarEdicao(e);

        // Abrir modal
        const modal = new bootstrap.Modal(document.getElementById('modalEditarPonto'));
        modal.show();
    }

    /**
     * Preenche campos dinâmicos no modal de edição
     */
    preencherCamposDinamicosEdicao() {
        const container = document.getElementById('camposDinamicosEdit');
        const tipoServico = this.ponto.tipo_servico;

        container.innerHTML = '';

        if (tipoServico === 'Hospedagem') {
            container.innerHTML = `
                <h6 class="mt-3 mb-3">
                    <i class="fas fa-hotel me-2"></i>Informações de Hospedagem
                </h6>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="editCategoriaHospedagem" class="form-label">Categoria</label>
                        <select class="form-select" id="editCategoriaHospedagem">
                            <option value="">Selecione...</option>
                            <option value="Hotel">Hotel</option>
                            <option value="Pousada">Pousada</option>
                            <option value="Resort">Resort</option>
                            <option value="Hostel">Hostel</option>
                        </select>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="editNumeroQuartos" class="form-label">Número de Quartos</label>
                        <input type="number" class="form-control" id="editNumeroQuartos">
                    </div>
                </div>
            `;
            
            if (this.ponto.categoria_hospedagem) {
                document.getElementById('editCategoriaHospedagem').value = this.ponto.categoria_hospedagem;
            }
            if (this.ponto.numero_quartos) {
                document.getElementById('editNumeroQuartos').value = this.ponto.numero_quartos;
            }

        } else if (tipoServico === 'Alimentação/Lazer') {
            container.innerHTML = `
                <h6 class="mt-3 mb-3">
                    <i class="fas fa-utensils me-2"></i>Informações do Estabelecimento
                </h6>
                <div class="mb-3">
                    <label for="editTipoCozinha" class="form-label">Tipo de Cozinha</label>
                    <input type="text" class="form-control" id="editTipoCozinha" placeholder="Ex: Brasileira, Italiana, Japonesa">
                </div>
            `;
            
            if (this.ponto.tipo_cozinha) {
                document.getElementById('editTipoCozinha').value = this.ponto.tipo_cozinha;
            }
        }

        // Adicionar listener para mudança de tipo
        document.getElementById('editTipoServico').addEventListener('change', () => {
            this.preencherCamposDinamicosEdicao();
        });
    }

    /**
     * Inicializa mini mapa de edição
     */
    inicializarMiniMapaEdicao() {
        const mapElement = document.getElementById('miniMapaEdit');
        
        if (!mapElement || this.miniMapaEdit) return;

        const lat = parseFloat(this.ponto.latitude) || -6.8897;
        const lng = parseFloat(this.ponto.longitude) || -38.5583;

        this.miniMapaEdit = L.map('miniMapaEdit').setView([lat, lng], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(this.miniMapaEdit);

        this.miniMarcadorEdit = L.marker([lat, lng], { draggable: true })
            .addTo(this.miniMapaEdit);

        // Atualizar coordenadas quando arrastar marcador
        this.miniMarcadorEdit.on('dragend', () => {
            const pos = this.miniMarcadorEdit.getLatLng();
            document.getElementById('editLatitude').value = pos.lat.toFixed(6);
            document.getElementById('editLongitude').value = pos.lng.toFixed(6);
        });

        // Atualizar marcador quando clicar no mapa
        this.miniMapaEdit.on('click', (e) => {
            this.miniMarcadorEdit.setLatLng(e.latlng);
            document.getElementById('editLatitude').value = e.latlng.lat.toFixed(6);
            document.getElementById('editLongitude').value = e.latlng.lng.toFixed(6);
        });

        // Atualizar marcador quando digitar coordenadas
        ['editLatitude', 'editLongitude'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                const newLat = parseFloat(document.getElementById('editLatitude').value);
                const newLng = parseFloat(document.getElementById('editLongitude').value);
                if (!isNaN(newLat) && !isNaN(newLng)) {
                    this.miniMarcadorEdit.setLatLng([newLat, newLng]);
                    this.miniMapaEdit.setView([newLat, newLng], 15);
                }
            });
        });

        // Forçar atualização do mapa
        setTimeout(() => {
            this.miniMapaEdit.invalidateSize();
        }, 100);
    }

    /**
     * Salva as edições do ponto
     */
    async salvarEdicao(e) {
        e.preventDefault();

        const alertContainer = document.getElementById('alertContainerEdit');
        alertContainer.innerHTML = '';

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Você precisa estar logado para editar');
            }

            console.log('Token encontrado para edição:', token ? 'Sim' : 'Não');

            // Coletar dados do formulário
            const dados = {
                nome: document.getElementById('editNome').value,
                tipo_servico: document.getElementById('editTipoServico').value,
                descricao: document.getElementById('editDescricao').value,
                localizacao: {
                    endereco: document.getElementById('editEndereco').value,
                    latitude: parseFloat(document.getElementById('editLatitude').value),
                    longitude: parseFloat(document.getElementById('editLongitude').value)
                },
                telefone: document.getElementById('editTelefone').value,
                instagram: document.getElementById('editInstagram').value
            };

            // Adicionar campos dinâmicos
            if (dados.tipo_servico === 'Hospedagem') {
                const catEl = document.getElementById('editCategoriaHospedagem');
                const quartoEl = document.getElementById('editNumeroQuartos');
                if (catEl) dados.categoria_hospedagem = catEl.value;
                if (quartoEl) dados.numero_quartos = parseInt(quartoEl.value) || 0;
            } else if (dados.tipo_servico === 'Alimentação/Lazer') {
                const cozinhaEl = document.getElementById('editTipoCozinha');
                if (cozinhaEl) dados.tipo_cozinha = cozinhaEl.value;
            }

            console.log('Dados a serem enviados:', dados);

            // Enviar requisição
            const endpoint = this.tipo === 'evento' 
                ? `/api/eventos/${this.pontoId}` 
                : `/api/servicos/${this.pontoId}`;

            console.log('Enviando PUT para:', endpoint);

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dados)
            });

            console.log('Status da resposta:', response.status);

            if (!response.ok) {
                const error = await response.json();
                console.error('Erro do servidor:', error);
                
                // Se o token expirou, redireciona para login
                if (response.status === 401 && (error.erro === 'Token expirado' || error.erro?.includes('Token'))) {
                    alert('Sua sessão expirou. Por favor, faça login novamente.');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('usuarioAutenticado');
                    window.location.href = 'telaLogin.html';
                    return;
                }
                
                throw new Error(error.erro || error.message || 'Erro ao salvar alterações');
            }

            // Sucesso
            alertContainer.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    Alterações salvas com sucesso!
                </div>
            `;

            // Recarregar página após 1 segundo
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('Erro ao salvar:', error);
            alertContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${error.message}
                </div>
            `;
        }
    }

    /**
     * Exclui o ponto (apenas admin)
     */
    async excluirPonto() {
        if (!confirm('Deseja realmente excluir este ponto? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            
            // Debug: Verificar se o token existe
            if (!token) {
                throw new Error('Você precisa estar autenticado para realizar esta ação.');
            }
            
            console.log('Token encontrado:', token ? 'Sim' : 'Não');
            
            const endpoint = this.tipo === 'evento' 
                ? `/api/eventos/${this.pontoId}` 
                : `/api/servicos/${this.pontoId}`;

            console.log('Enviando DELETE para:', endpoint);

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Status da resposta:', response.status);

            if (response.ok) {
                alert('Ponto excluído com sucesso!');
                window.location.href = 'index.html';
            } else {
                const error = await response.json();
                console.error('Erro do servidor:', error);
                
                // Se o token expirou, redireciona para login
                if (response.status === 401 && (error.erro === 'Token expirado' || error.erro?.includes('Token'))) {
                    alert('Sua sessão expirou. Por favor, faça login novamente.');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('usuarioAutenticado');
                    window.location.href = 'telaLogin.html';
                    return;
                }
                
                throw new Error(error.erro || error.message || 'Erro ao excluir');
            }
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir o ponto: ' + error.message);
        }
    }

    /**
     * Logout do usuário
     */
    logout() {
        if (confirm('Deseja realmente sair?')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('usuarioAutenticado');
            window.location.href = 'index.html';
        }
    }

    /**
     * Mostra o loading
     */
    mostrarLoading() {
        this.loading.style.display = 'flex';
        this.conteudoPrincipal.style.display = 'none';
        this.erroContainer.style.display = 'none';
    }

    /**
     * Mostra o conteúdo principal
     */
    mostrarConteudo() {
        this.loading.style.display = 'none';
        this.conteudoPrincipal.style.display = 'block';
        this.erroContainer.style.display = 'none';
    }

    /**
     * Mostra mensagem de erro
     */
    mostrarErro(mensagem) {
        this.loading.style.display = 'none';
        this.conteudoPrincipal.style.display = 'none';
        this.erroContainer.style.display = 'block';
        this.mensagemErro.textContent = mensagem;
    }
}

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.pontoDetail = new PontoDetailManager();
    window.pontoDetail.init();
});
