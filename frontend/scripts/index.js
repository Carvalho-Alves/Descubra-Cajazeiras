import PontoController from './controller/pontoModel.js';
import pontoService from './service/pontoService.js'; // Importa o serviço para verificar o login


document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELEÇÃO DE ELEMENTOS DO HTML ---
    const usuarioArea = document.getElementById('usuario-area');
    const btnNovoPonto = document.getElementById('btnNovoPonto');
    const btnDashboard = document.getElementById('btnDashboard');
    const btnVerEventos = document.getElementById('btnVerEventos');
    const btnAtualizarLista = document.getElementById('btnAtualizarLista');
    const btnCentralizarLocalizacao = document.getElementById('btnCentralizarLocalizacao');
    
    // Elementos da lista de serviços
    const listaServicosContainer = document.getElementById('listaPontos');
    const loadingServicosSpinner = document.getElementById('loadingPontos');
    const nenhumServicoDiv = document.getElementById('nenhumPonto');
    
    // Elementos do modal de eventos
    const listaEventosContainer = document.getElementById('listaEventos');
    const loadingEventosSpinner = document.getElementById('loadingEventos');
    const nenhumEventoDiv = document.getElementById('nenhumEvento');
    
    // --- 2. ESTADO DA APLICAÇÃO ---
    let todosOsServicos = [];
    let eventosCarregados = false;

    // --- 3. INICIALIZAÇÃO DO MAPA ---
    const map = L.map('mapa').setView([-6.8897, -38.5583], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Marcador da localização do usuário
    let userLocationMarker = null;

    // --- 4. INICIALIZAÇÃO DO CRUD DE SERVIÇOS ---
    // Inicializa o gerenciador de CRUD após o DOM estar carregado
    setTimeout(() => {
        if (typeof ServicoCrudManager !== 'undefined') {
            window.servicoCrud = new ServicoCrudManager(map, pontoService);
            console.log('✅ CRUD de Serviços inicializado');
        }
    }, 100);



    // --- 5. LÓGICA DE AUTENTICAÇÃO E RENDERIZAÇÃO DA UI ---
    
    function renderizarAreaUsuario() {
        // Verifica se há um usuário logado no localStorage
        const dadosUsuario = pontoService.getUsuarioAutenticado();
        const token = localStorage.getItem('authToken');
        
        // Verifica se o usuário está realmente logado (tem dados E token válido)
        const usuarioLogado = dadosUsuario !== null && token !== null;

        if (usuarioLogado) {
            // --- UI para Usuário Logado (Admin) ---
            const nomeUsuario = dadosUsuario.user?.nome || dadosUsuario.nome || "Usuário"; 
            usuarioArea.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle me-2"></i> ${nomeUsuario}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="#" id="btnPerfil">
                            <i class="fas fa-user me-2"></i>Perfil
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" id="btnSair">
                            <i class="fas fa-sign-out-alt me-2"></i>Sair
                        </a></li>
                    </ul>
                </div>
            `;
            btnNovoPonto.style.display = 'inline-block';
            btnDashboard.style.display = 'inline-block';

            document.getElementById('btnSair').addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Deseja realmente sair?')) {
                    pontoService.logoutUsuario();
                }
            });

            document.getElementById('btnPerfil').addEventListener('click', (e) => {
                e.preventDefault();
                alert('Funcionalidade de perfil em desenvolvimento');
            });

        } else {
            // --- UI para Usuário Deslogado (Turista) ---
            usuarioArea.innerHTML = `
                <a href="auth.html" class="btn btn-primary">
                    <i class="fas fa-sign-in-alt me-2"></i>Entrar
                </a>
            `;
            // Esconde os botões de admin
            btnNovoPonto.style.display = 'none';
            btnDashboard.style.display = 'none';
        }
    }

    // --- 5. FUNÇÕES DE DADOS (SERVIÇOS E EVENTOS) ---

    async function carregarServicos() {
        loadingServicosSpinner.style.display = 'block';
        listaServicosContainer.innerHTML = '';
        nenhumServicoDiv.style.display = 'none';
        try {
            // Lembre-se de ajustar a URL se seu backend estiver em outra porta (ex: 'http://localhost:3000/api/servicos')
            const response = await fetch('/api/servicos'); 
            if (!response.ok) throw new Error('Falha ao buscar serviços.');
            todosOsServicos = await response.json();
            renderizarListaServicos(todosOsServicos);
            // Adicionar marcadores ao mapa aqui, se desejar
        } catch (error) {
            console.error(error);
            listaServicosContainer.innerHTML = `<div class="alert alert-danger m-2">Erro ao carregar serviços.</div>`;
        } finally {
            loadingServicosSpinner.style.display = 'none';
        }
    }

    function renderizarListaServicos(servicos) {
        listaServicosContainer.innerHTML = '';
        nenhumServicoDiv.style.display = servicos.length === 0 ? 'block' : 'none';
        servicos.forEach(servico => {
            const item = document.createElement('a');
            item.className = 'list-group-item list-group-item-action';
            item.href = `ponto.html?id=${servico._id}&tipo=servico`;
            item.innerHTML = `
                <h5 class="mb-1">${servico.nome || servico.titulo}</h5>
                <p class="mb-1 text-muted">${servico.tipo_servico}</p>
                <small>${servico.descricao ? servico.descricao.substring(0, 70) + '...' : ''}</small>
            `;
            listaServicosContainer.appendChild(item);
        });
    }

    async function carregarEventos() {
        if (eventosCarregados) return;
        loadingEventosSpinner.style.display = 'block';
        listaEventosContainer.innerHTML = '';
        nenhumEventoDiv.style.display = 'none';
        try {
            const response = await fetch('/api/eventos'); // Ajuste a porta se necessário
            if (!response.ok) throw new Error('Falha ao buscar eventos.');
            const eventos = await response.json();
            renderizarListaEventos(eventos);
            eventosCarregados = true;
        } catch (error) {
            console.error(error);
            listaEventosContainer.innerHTML = `<div class="alert alert-danger m-2">Erro ao carregar eventos.</div>`;
        } finally {
            loadingEventosSpinner.style.display = 'none';
        }
    }
    
    function renderizarListaEventos(eventos) {
         nenhumEventoDiv.style.display = eventos.length === 0 ? 'block' : 'none';
         listaEventosContainer.innerHTML = '';
         eventos.forEach(evento => {
            const dataEvento = new Date(evento.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            const item = document.createElement('div');
            item.className = 'list-group-item';
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${evento.nome}</h5>
                    <small class="text-muted">${dataEvento}</small>
                </div>
                <p class="mb-1">${evento.descricao || ''}</p>
                <small class="text-muted"><i class="fas fa-map-marker-alt me-1"></i> ${evento.local || 'Local a definir'}</small>
            `;
            listaEventosContainer.appendChild(item);
        });
    }

    // --- 6. FUNÇÃO DE GEOLOCALIZAÇÃO ---
    function centralizarNaMinhaLocalizacao() {
        // Verifica se o navegador suporta geolocalização
        if (!navigator.geolocation) {
            alert('Geolocalização não é suportada por este navegador.');
            return;
        }

        // Mostra loading no botão
        const btnIcon = btnCentralizarLocalizacao.querySelector('i');
        const btnText = btnCentralizarLocalizacao.querySelector('span');
        const originalIcon = btnIcon.className;
        
        btnIcon.className = 'fas fa-spinner fa-spin';
        if (btnText) btnText.textContent = 'Localizando...';
        btnCentralizarLocalizacao.disabled = true;

        // Opções de geolocalização
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000 // Cache por 1 minuto
        };

        // Obtém a localização atual
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;

                // Cria um marcador personalizado para a localização do usuário
                const userIcon = L.divIcon({
                    className: 'user-location-marker',
                    html: '<i class="fas fa-user-circle"></i>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });

                // Adiciona o marcador no mapa
                userLocationMarker = L.marker([lat, lng], { icon: userIcon })
                    .addTo(map)
                    .bindPopup(`
                        <div class="popup-content">
                            <h6><i class="fas fa-user-circle me-1"></i>Sua Localização</h6>
                            <p><small><i class="fas fa-crosshairs me-1"></i>Precisão: ${Math.round(accuracy)}m</small></p>
                        </div>
                    `);

                // Centraliza o mapa na localização do usuário
                map.setView([lat, lng], 16);

                // Restaura o botão
                btnIcon.className = originalIcon;
                if (btnText) btnText.textContent = 'Minha Localização';
                btnCentralizarLocalizacao.disabled = false;

                // Mostra mensagem de sucesso
                console.log(`Localização encontrada: ${lat}, ${lng} (±${Math.round(accuracy)}m)`);
            },
            function(error) {
                // Restaura o botão em caso de erro
                btnIcon.className = originalIcon;
                if (btnText) btnText.textContent = 'Minha Localização';
                btnCentralizarLocalizacao.disabled = false;

                // Trata diferentes tipos de erro
                let mensagemErro = 'Erro ao obter localização.';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        mensagemErro = 'Permissão de localização negada. Permita o acesso à localização nas configurações do navegador.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensagemErro = 'Informações de localização não disponíveis.';
                        break;
                    case error.TIMEOUT:
                        mensagemErro = 'Tempo limite excedido ao tentar obter localização.';
                        break;
                }
                
                alert(mensagemErro);
                console.error('Erro de geolocalização:', error);
            },
            options
        );
    }

    // --- 7. FUNÇÃO PARA ATUALIZAR UI APÓS LOGIN ---
    function atualizarUIAposLogin() {
        renderizarAreaUsuario();
        console.log('UI atualizada após login');
    }

    // Expor função globalmente para uso após login
    window.atualizarUIAposLogin = atualizarUIAposLogin;

    // --- 8. FUNÇÃO PARA LIMPAR DADOS INVÁLIDOS ---
    function verificarDadosAutenticacao() {
        const dadosUsuario = localStorage.getItem('usuarioAutenticado');
        const token = localStorage.getItem('authToken');
        
        // Se tem dados mas não tem token, limpa tudo
        if (dadosUsuario && !token) {
            console.log('Dados de autenticação inconsistentes, limpando...');
            localStorage.removeItem('usuarioAutenticado');
            localStorage.removeItem('authToken');
        }
        
        // Se tem token mas não tem dados do usuário, limpa tudo
        if (token && !dadosUsuario) {
            console.log('Token sem dados de usuário, limpando...');
            localStorage.removeItem('usuarioAutenticado');
            localStorage.removeItem('authToken');
        }
    }

    // --- 9. INICIALIZAÇÃO DA PÁGINA ---
    function init() {
        // Verifica consistência dos dados de autenticação
        verificarDadosAutenticacao();
        
        // Configura a UI de login/logout e os botões de admin
        renderizarAreaUsuario();

        // Configura os eventos dos botões
        btnAtualizarLista.addEventListener('click', carregarServicos);
        btnVerEventos.addEventListener('click', carregarEventos);
        btnCentralizarLocalizacao.addEventListener('click', centralizarNaMinhaLocalizacao);
        btnNovoPonto.addEventListener('click', () => { 
            // Redireciona para a página dedicada de gerenciamento de serviços
            window.location.href = 'servicos.html';
        });
        
        // Carrega os dados iniciais
        carregarServicos();
    }

    init(); // Roda a aplicação
});