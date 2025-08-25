// Espera a página HTML ser completamente carregada para executar o script
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELEÇÃO DE ELEMENTOS DO HTML ---
    // A gente pega uma referência a todos os elementos que vamos manipular
    const usuarioArea = document.getElementById('usuario-area');
    const btnNovo = document.getElementById('btnNovo');
    const listaServicosContainer = document.getElementById('listaServicos');
    const loadingServicosSpinner = document.getElementById('loadingServicos');
    const nenhumServicoDiv = document.getElementById('nenhumServico');
    const btnAtualizarLista = document.getElementById('btnAtualizarLista');
    const inputBusca = document.getElementById('inputBusca');
    const btnBuscar = document.getElementById('btnBuscar');
    const btnLimparBusca = document.getElementById('btnLimparBusca');
    const btnVerEventos = document.getElementById('btnVerEventos');
    const listaEventosContainer = document.getElementById('listaEventos');
    const loadingEventosSpinner = document.getElementById('loadingEventos');
    const nenhumEventoDiv = document.getElementById('nenhumEvento');

    // --- 2. ESTADO DA APLICAÇÃO ---
    let todosOsServicos = [];
    let eventosCarregados = false; // Flag para não buscar os eventos toda hora

    // --- 3. INICIALIZAÇÃO DO MAPA ---
    const map = L.map('mapa').setView([-6.8897, -38.5583], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // --- 4. LÓGICA DE AUTENTICAÇÃO E UI ---
    
    /**
     * Decide o que mostrar no canto superior direito e gerencia os botões de admin.
     */
    function renderizarAreaUsuario() {
        // Para testar, mude esta linha para 'true' para ver a interface de admin
        const usuarioLogado = false;

        if (usuarioLogado) {
            // Se ESTÁ logado (Admin)
            usuarioArea.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle me-2"></i> Admin
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item text-danger" href="#" id="btnSair">Sair</a></li>
                    </ul>
                </div>
            `;
            btnNovo.style.display = 'inline-block'; // Mostra o botão "+ Novo"
            document.getElementById('btnSair').addEventListener('click', () => {
                alert('Fazendo logout...');
                // localStorage.removeItem('authToken'); // Se usar token
                window.location.reload();
            });
        } else {
            // Se NÃO está logado (Turista)
            usuarioArea.innerHTML = `
                <button class="btn btn-outline-light me-2" id="btnLogin">Login</button>
                <button class="btn btn-primary" id="btnCadastro">Cadastro</button>
            `;
            btnNovo.style.display = 'none'; // Garante que o botão "+ Novo" está escondido

            document.getElementById('btnLogin').addEventListener('click', () => {
                window.location.href = 'telaLogin.html';
            });
            document.getElementById('btnCadastro').addEventListener('click', () => {
                window.location.href = 'telaCadastro.html';
            });
        }
    }

    // --- 5. FUNÇÕES DE SERVIÇOS (Página Principal) ---

    async function carregarServicos() {
        loadingServicosSpinner.style.display = 'block';
        listaServicosContainer.innerHTML = '';
        nenhumServicoDiv.style.display = 'none';
        try {
            const response = await fetch('/api/servicos'); // A API precisa ter essa rota
            if (!response.ok) throw new Error('Falha ao buscar dados.');
            todosOsServicos = await response.json();
            renderizarListaServicos(todosOsServicos);
            adicionarMarcadoresServicos(todosOsServicos);
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
                <small>${servico.descricao.substring(0, 70)}...</small>
            `;
            listaServicosContainer.appendChild(item);
        });
    }

    function adicionarMarcadoresServicos(servicos) {
        map.eachLayer(layer => { if (layer instanceof L.Marker) map.removeLayer(layer); });
        servicos.forEach(servico => {
            if (servico.localizacao?.latitude && servico.localizacao?.longitude) {
                const marker = L.marker([servico.localizacao.latitude, servico.localizacao.longitude]).addTo(map);
                marker.bindPopup(`<b>${servico.nome || servico.titulo}</b><br><a href="ponto.html?id=${servico._id}&tipo=servico">Ver detalhes</a>`);
            }
        });
    }

    // --- 6. FUNÇÕES DE EVENTOS (Modal) ---

    async function carregarEventos() {
        if (eventosCarregados) return;
        loadingEventosSpinner.style.display = 'block';
        listaEventosContainer.innerHTML = '';
        nenhumEventoDiv.style.display = 'none';
        try {
        const response = await fetch('http://localhost:3333/api/servicos');
        if (!response.ok) throw new Error('Falha na resposta da rede.');
        todosOsServicos = await response.json();
        renderizarListaServicos(todosOsServicos);
        adicionarMarcadoresServicos(todosOsServicos);
        } catch (error) {
            console.error(error);
            listaEventosContainer.innerHTML = `<div class="alert alert-danger m-2">Erro ao carregar eventos.</div>`;
        } finally {
            loadingEventosSpinner.style.display = 'none';
        }
    }

    function renderizarListaEventos(eventos) {
        nenhumEventoDiv.style.display = eventos.length === 0 ? 'block' : 'none';
        eventos.forEach(evento => {
            const dataEvento = new Date(evento.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            const item = document.createElement('div');
            item.className = 'list-group-item';
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${evento.nome}</h5>
                    <small class="text-muted">${dataEvento}</small>
                </div>
                <p class="mb-1">${evento.descricao}</p>
                <small class="text-muted"><i class="fas fa-map-marker-alt me-1"></i> ${evento.local || 'Local a definir'}</small>
            `;
            listaEventosContainer.appendChild(item);
        });
    }

    // --- 7. FUNÇÕES DE BUSCA ---

    function handleBusca() {
        const termo = inputBusca.value.toLowerCase().trim();
        btnLimparBusca.style.display = termo ? 'block' : 'none';
        const servicosFiltrados = todosOsServicos.filter(s => 
            (s.nome || s.titulo).toLowerCase().includes(termo) ||
            s.descricao.toLowerCase().includes(termo) ||
            s.tipo_servico.toLowerCase().includes(termo)
        );
        renderizarListaServicos(servicosFiltrados);
        adicionarMarcadoresServicos(servicosFiltrados);
    }

    function limparBusca() {
        inputBusca.value = '';
        btnLimparBusca.style.display = 'none';
        renderizarListaServicos(todosOsServicos);
        adicionarMarcadoresServicos(todosOsServicos);
    }

    // --- 8. INICIALIZAÇÃO DA PÁGINA ---
    function init() {
        // Configura a UI de login/logout
        renderizarAreaUsuario();

        // Configura os botões e inputs
        btnAtualizarLista.addEventListener('click', carregarServicos);
        btnVerEventos.addEventListener('click', carregarEventos);
        btnNovo.addEventListener('click', () => { window.location.href = 'ponto.html'; });
        btnBuscar.addEventListener('click', handleBusca);
        btnLimparBusca.addEventListener('click', limparBusca);
        inputBusca.addEventListener('keyup', handleBusca);

        // Carrega os dados iniciais da página
        carregarServicos();
    }

    init(); // Roda a aplicação
});