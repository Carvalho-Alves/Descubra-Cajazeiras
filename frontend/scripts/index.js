document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELEÇÃO DOS ELEMENTOS DO HTML ---
    const listaServicosContainer = document.getElementById('listaServicos'); // Lembre-se de ajustar para listaServicos
    const loadingSpinner = document.getElementById('loadingServicos'); // Lembre-se de ajustar para loadingServicos
    const nenhumPontoDiv = document.getElementById('nenhumServico'); // Lembre-se de ajustar para nenhumServico
    const btnNovoPonto = document.getElementById('btnNovoPonto');
    const btnAtualizarLista = document.getElementById('btnAtualizarLista');
    const inputBusca = document.getElementById('inputBusca');
    const btnBuscar = document.getElementById('btnBuscar');
    const btnLimparBusca = document.getElementById('btnLimparBusca');
    const usuarioArea = document.getElementById('usuario-area');

    // --- 2. ESTADO DA APLICAÇÃO ---
    let todosOsPontos = [];
    let marcadoresNoMapa = [];

    // --- 3. INICIALIZAÇÃO DO MAPA LEAFLET ---
    const map = L.map('mapa').setView([-6.8897, -38.5583], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // --- 4. FUNÇÕES DE RENDERIZAÇÃO E UI ---

    /**
     * Renderiza os botões de Login/Cadastro ou o menu de Admin.
     * ESTA É A FUNÇÃO CORRIGIDA.
     */
    function renderizarAreaUsuario() {
        // Para testar, mude esta linha para 'true'
        const usuarioLogado = false; 

        if (usuarioLogado) {
            // Se ESTÁ logado (Admin)
            usuarioArea.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle me-2"></i> Administrador
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="#" id="btnSair">Sair</a></li>
                    </ul>
                </div>
            `;
            // Mostra o botão que estava escondido por padrão
            btnNovoPonto.style.display = 'inline-block';

            document.getElementById('btnSair').addEventListener('click', () => {
                alert('Saindo...');
                // Aqui entraria a lógica de logout (limpar token, etc)
                window.location.reload();
            });

        } else {
            // Se NÃO está logado (Turista)
            usuarioArea.innerHTML = `
                <button class="btn btn-light me-2" id="btnLogin">Login</button>
                <button class="btn btn-primary" id="btnCadastro">Cadastro</button>
            `;
            // Garante que o botão "+ Novo" continue escondido
            btnNovo.style.display = 'none';

            // Adiciona os eventos DEPOIS de criar os botões, garantindo que funcionem
            document.getElementById('btnLogin').addEventListener('click', () => {
                window.location.href = '/login.html';
            });
            document.getElementById('btnCadastro').addEventListener('click', () => {
                window.location.href = '/cadastro.html';
            });
        }
    }
    
    // --- O RESTO DO SEU CÓDIGO ---
    // Coloque aqui as suas outras funções que estavam vazias
    // (carregarPontos, renderizarLista, handleBusca, etc.)
    // Exemplo:
    async function carregarPontos() {
        console.log("Buscando pontos...");
        // Sua lógica de fetch aqui
    }
    function handleBusca() {
        console.log("Buscando...");
    }


    // --- 5. INICIALIZAÇÃO DOS EVENT LISTENERS ---
    function inicializarEventos() {
        btnNovoPonto.addEventListener('click', () => {
            window.location.href = 'ponto.html';
        });
        btnAtualizarLista.addEventListener('click', carregarPontos);
        btnBuscar.addEventListener('click', handleBusca);
    }

    // --- 6. EXECUÇÃO INICIAL ---
    function init() {
        renderizarAreaUsuario(); // <-- Esta função agora cuida de TUDO
        inicializarEventos();
        carregarPontos();
    }

    init(); // Inicia a aplicação
});