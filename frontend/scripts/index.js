import PontoController from './controller/pontoModel.js';
import pontoService from './service/pontoService.js'; // Importa o serviço para verificar o login

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELEÇÃO DE ELEMENTOS DO HTML ---
    const usuarioArea = document.getElementById('usuario-area');
    const btnNovoPonto = document.getElementById('btnNovoPonto');
    const btnDashboard = document.getElementById('btnDashboard');
    const btnVerEventos = document.getElementById('btnVerEventos');
    const btnAtualizarLista = document.getElementById('btnAtualizarLista');
    
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

    // --- 4. LÓGICA DE AUTENTICAÇÃO E RENDERIZAÇÃO DA UI ---
    
    function renderizarAreaUsuario() {
        // Para testar a visão de admin, mude esta linha para 'true'
        const usuarioLogado = false; 

        if (usuarioLogado) {
            // --- UI para Usuário Logado (Admin) ---
            const nomeAdmin = "Admin"; 
            usuarioArea.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle me-2"></i> ${nomeAdmin}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item text-danger" href="#" id="btnSair">Sair</a></li>
                    </ul>
                </div>
            `;
            btnNovoPonto.style.display = 'inline-block';
            btnDashboard.style.display = 'inline-block';

            document.getElementById('btnSair').addEventListener('click', () => {
                alert('Fazendo logout...');
                window.location.reload();
            });

        } else {
            // --- UI para Usuário Deslogado (Turista) ---
            usuarioArea.innerHTML = `
                <a href="telaLogin.html" class="btn btn-primary me-2">Login</a>
                <a href="telaCadastro.html" class="btn btn-primary">Cadastro</a>
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

    // --- 6. INICIALIZAÇÃO DA PÁGINA ---
    function init() {
        // Configura a UI de login/logout e os botões de admin
        renderizarAreaUsuario();

        // Configura os eventos dos botões
        btnAtualizarLista.addEventListener('click', carregarServicos);
        btnVerEventos.addEventListener('click', carregarEventos);
        btnNovoPonto.addEventListener('click', () => { 
            window.location.href = 'ponto.html'; 
        });
        
        // Carrega os dados iniciais
        carregarServicos();
    }

    init(); // Roda a aplicação
});