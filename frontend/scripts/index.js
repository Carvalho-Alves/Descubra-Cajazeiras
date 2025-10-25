import pontoService from './service/pontoService.js';
import { renderizarLista, renderizarMarcadores, selecionarItemListaPorId } from './utils/mapListRenderer.js';


document.addEventListener('DOMContentLoaded', () => {
    const usuarioArea = document.getElementById('usuario-area');
    const btnNovoPonto = document.getElementById('btnNovoPonto');
    const btnDashboard = document.getElementById('btnDashboard');
    const btnAtualizarLista = document.getElementById('btnAtualizarLista');
    const btnCentralizarLocalizacao = document.getElementById('btnCentralizarLocalizacao');
    const inputBusca = document.getElementById('inputBusca');
    const btnBuscar = document.getElementById('btnBuscar');
    const btnLimparBusca = document.getElementById('btnLimparBusca');
    const btnListaServicos = document.getElementById('btnListaServicos');
    const btnListaEventos = document.getElementById('btnListaEventos');

    const listaServicosContainer = document.getElementById('listaPontos');
    const loadingServicosSpinner = document.getElementById('loadingPontos');
    const nenhumServicoDiv = document.getElementById('nenhumPonto');

    const listaEventosHome = document.getElementById('listaEventosHome');
    const loadingEventosHome = document.getElementById('loadingEventosHome');
    const nenhumEventoHome = document.getElementById('nenhumEventoHome');
    const btnAtualizarEventosHome = document.getElementById('btnAtualizarEventosHome');
    const filtrosEventosHome = document.querySelectorAll('input[name="filtroEventoHome"]');
    const inputBuscaEventosHome = document.getElementById('inputBuscaEventosHome');
    const btnBuscarEventosHome = document.getElementById('btnBuscarEventosHome');
    const btnLimparBuscaEventosHome = document.getElementById('btnLimparBuscaEventosHome');

    const map = L.map('mapa').setView([-6.8897, -38.5583], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    let userLocationMarker = null;
    const camadaServicos = L.layerGroup().addTo(map);
    const camadaEventos = L.layerGroup().addTo(map);
    let markersById = new Map();
    let eventMarkersById = new Map();

    // Estado global de dados carregados (corrige ReferenceError)
    let todosOsServicos = [];
    let todosOsEventos = [];

    // Estado da coluna lateral (lista e busca)
    let modoLista = 'servicos'; // 'servicos' | 'eventos'

    function renderizarAreaUsuario() {
        const dadosUsuario = pontoService.getUsuarioAutenticado();
        const token = localStorage.getItem('authToken');
        const usuarioLogado = dadosUsuario !== null && token !== null;
        if (usuarioLogado) {
            const nomeUsuario = dadosUsuario.user?.nome || dadosUsuario.nome || 'Usuário';
            usuarioArea.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle me-2"></i> ${nomeUsuario}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="#" id="btnPerfil"><i class="fas fa-user me-2"></i>Perfil</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" id="btnSair"><i class="fas fa-sign-out-alt me-2"></i>Sair</a></li>
                    </ul>
                </div>`;
            if (btnNovoPonto) btnNovoPonto.style.display = 'inline-block';
            btnDashboard.style.display = 'inline-block';
            document.getElementById('btnSair')?.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Deseja realmente sair?')) pontoService.logoutUsuario();
            });
            document.getElementById('btnPerfil')?.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Funcionalidade de perfil em desenvolvimento');
            });
        } else {
            usuarioArea.innerHTML = `<a href="auth.html" class="btn btn-primary"><i class="fas fa-sign-in-alt me-2"></i>Entrar</a>`;
            if (btnNovoPonto) btnNovoPonto.style.display = 'none';
            btnDashboard.style.display = 'none';
        }
    }

    function atualizarUIListaEMapa(servicos) {
        renderizarLista(servicos, listaServicosContainer);
        markersById = renderizarMarcadores(map, camadaServicos, servicos, {
            onMarkerClick: (s) => selecionarItemLista(s)
        });
        nenhumServicoDiv.style.display = servicos.length === 0 ? 'block' : 'none';
        listaServicosContainer.querySelectorAll('.list-group-item').forEach(el => {
            el.addEventListener('mouseenter', () => {
                const id = el.dataset.id;
                const m = markersById.get(String(id));
                if (m) m.openPopup();
            });
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const id = el.dataset.id;
                const m = markersById.get(String(id));
                if (m) {
                    const ll = m.getLatLng();
                    if (ll) map.setView(ll, 17, { animate: true });
                    m.openPopup();
                }
                selecionarItemListaPorId(listaServicosContainer, id);
            });
        });
    }

    function selecionarItemLista(servico) {
        if (!servico || !servico._id) return;
        selecionarItemListaPorId(listaServicosContainer, servico._id);
    }

    async function carregarServicos() {
        loadingServicosSpinner.style.display = 'block';
        listaServicosContainer.innerHTML = '';
        nenhumServicoDiv.style.display = 'none';
        try {
            const response = await fetch('/api/servicos');
            if (!response.ok) throw new Error('Falha ao buscar serviços.');
            const dados = await response.json();
            // Se houver filtros de tipo selecionados, aplicar aqui (mantido comportamento anterior)
            todosOsServicos = dados;
            atualizarUIListaEMapa(todosOsServicos);
        } catch (error) {
            console.error(error);
            listaServicosContainer.innerHTML = `<div class="alert alert-danger m-2">Erro ao carregar serviços.</div>`;
        } finally {
            loadingServicosSpinner.style.display = 'none';
        }
    }

    const eventoIcon = L.divIcon({
        className: 'leaflet-div-icon custom-marker',
        html: '<div class="marker-icon" style="background-color:#0d6efd"><i class="fas fa-calendar"></i></div>',
        iconSize: [32,32], iconAnchor:[16,32], popupAnchor:[0,-32]
    });

    function normalizarCoordsEvento(ev){
        const loc = ev.localizacao || {};
        const lat = typeof loc.latitude === 'string'? parseFloat(loc.latitude): loc.latitude;
        const lng = typeof loc.longitude === 'string'? parseFloat(loc.longitude): loc.longitude;
        if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) return [lat,lng];
        if (Array.isArray(loc.coordinates) && loc.coordinates.length>=2){
            const lng2 = typeof loc.coordinates[0]==='string'? parseFloat(loc.coordinates[0]): loc.coordinates[0];
            const lat2 = typeof loc.coordinates[1]==='string'? parseFloat(loc.coordinates[1]): loc.coordinates[1];
            if (typeof lat2==='number' && typeof lng2==='number' && !Number.isNaN(lat2) && !Number.isNaN(lng2)) return [lat2,lng2];
        }
        return null;
    }

    let filtroEventoAtual = '';
    let termoBuscaEventos = '';

    function filtrarEBuscarEventos(base){
        let arr = [...base];
        if (filtroEventoAtual) arr = arr.filter(e => (e.status||'ativo') === filtroEventoAtual);
        if (termoBuscaEventos){
            const q = termoBuscaEventos.toLowerCase();
            arr = arr.filter(e => (String(e.nome||'').toLowerCase().includes(q) || String(e.descricao||'').toLowerCase().includes(q)));
        }
        return arr;
    }

    function renderizarEventosHome(eventos, opts = {}){
        const useRaw = opts && opts.raw === true;
        const items = useRaw ? [...eventos] : filtrarEBuscarEventos(eventos);
        listaEventosHome.innerHTML = '';
        nenhumEventoHome.style.display = items.length? 'none':'block';
        items.forEach(ev=>{
            const a = document.createElement('a');
            a.className = 'list-group-item list-group-item-action';
            a.href = '#';
            a.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1"><i class="fas fa-calendar me-2 text-primary"></i>${ev.nome||'Evento'}</h6>
                        <small class="text-muted">${ev.data? new Date(ev.data).toLocaleDateString('pt-BR'): ''} • ${ev.status||'ativo'}</small>
                        <p class="mb-0">${ev.descricao? String(ev.descricao).substring(0,80)+'...': ''}</p>
                    </div>
                </div>`;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const ll = normalizarCoordsEvento(ev);
                if (!ll) return;
                map.setView(ll, 17, { animate: true });
                const m = eventMarkersById.get(String(ev._id));
                if (m) m.openPopup();
            });
            a.addEventListener('mouseenter', () => {
                const m = eventMarkersById.get(String(ev._id));
                if (m) m.openPopup();
            });
            listaEventosHome.appendChild(a);
        });

        camadaEventos.clearLayers();
        eventMarkersById = new Map();
        items.forEach(ev=>{
            const ll = normalizarCoordsEvento(ev);
            if (!ll) return;
            const m = L.marker(ll, { icon: eventoIcon });
            m.bindPopup(`
                <div class='popup-servico'>
                    <h6>${ev.nome||'Evento'}</h6>
                    <small>${ev.status||'ativo'} • ${ev.data? new Date(ev.data).toLocaleDateString('pt-BR'):''}</small>
                    <p>${ev.descricao? String(ev.descricao).substring(0,100)+'...': ''}</p>
                    <div class='btn-group btn-group-sm w-100'>
                        <a class='btn btn-primary' href='eventos.html'><i class="fas fa-external-link-alt me-1"></i>Gerenciar</a>
                    </div>
                </div>
            `);
            camadaEventos.addLayer(m);
            if (ev._id) eventMarkersById.set(String(ev._id), m);
        });
    }

    async function carregarEventosHome(){
        if (!listaEventosHome) return;
        loadingEventosHome.style.display = 'block';
        listaEventosHome.innerHTML = '';
        nenhumEventoHome.style.display = 'none';
        try{
            const r = await fetch('/api/eventos');
            if (!r.ok) throw new Error('Falha ao buscar eventos');
            const arr = await r.json();
            todosOsEventos = arr.sort((a,b)=> new Date(b.data||0).getTime() - new Date(a.data||0).getTime());
            renderizarEventosHome(todosOsEventos);
        } catch(e){
            console.error(e);
            listaEventosHome.innerHTML = `<div class="alert alert-danger m-2">Erro ao carregar eventos.</div>`;
        } finally {
            loadingEventosHome.style.display = 'none';
        }
    }

    // Filtros de status na seção de eventos
    if (filtrosEventosHome && filtrosEventosHome.length) {
        filtrosEventosHome.forEach(r => r.addEventListener('change', (e) => {
            filtroEventoAtual = e.target.value;
            renderizarEventosHome(todosOsEventos);
        }));
    }

    // Busca da seção de eventos (usa endpoint dedicado)
    async function executarBuscaEventosHome() {
        termoBuscaEventos = (inputBuscaEventosHome?.value || '').trim();
        btnLimparBuscaEventosHome.style.display = termoBuscaEventos ? 'inline-block' : 'none';
        if (!termoBuscaEventos) { renderizarEventosHome(todosOsEventos); return; }
        try {
            loadingEventosHome.style.display = 'block';
            listaEventosHome.innerHTML = '';
            nenhumEventoHome.style.display = 'none';
            const r = await fetch(`/api/eventos/search?q=${encodeURIComponent(termoBuscaEventos)}`);
            if (!r.ok) throw new Error('Falha ao buscar eventos');
            const resultados = await r.json();
            renderizarEventosHome(resultados, { raw: true });
        } catch (e) {
            console.error(e);
            listaEventosHome.innerHTML = `<div class="alert alert-warning m-2">Não foi possível buscar por "${termoBuscaEventos}".</div>`;
        } finally {
            loadingEventosHome.style.display = 'none';
        }
    }

    if (btnBuscarEventosHome) btnBuscarEventosHome.addEventListener('click', executarBuscaEventosHome);
    if (inputBuscaEventosHome) {
        inputBuscaEventosHome.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); executarBuscaEventosHome(); }
        });
        inputBuscaEventosHome.addEventListener('input', () => {
            btnLimparBuscaEventosHome.style.display = inputBuscaEventosHome.value.trim() ? 'inline-block' : 'none';
        });
    }
    if (btnLimparBuscaEventosHome) {
        btnLimparBuscaEventosHome.addEventListener('click', () => {
            termoBuscaEventos = '';
            if (inputBuscaEventosHome) inputBuscaEventosHome.value = '';
            btnLimparBuscaEventosHome.style.display = 'none';
            renderizarEventosHome(todosOsEventos);
        });
    }

    // Alternância da coluna: mostra/oculta blocos de acordo com o modo selecionado
    function aplicarModoLista() {
        const cardServicos = document.getElementById('cardServicos');
        const cardEventos = document.getElementById('cardEventosHome');
        if (!cardServicos || !cardEventos) return;
        if (modoLista === 'servicos') {
            cardServicos.style.display = 'block';
            cardEventos.style.display = 'none';
        } else {
            cardServicos.style.display = 'none';
            cardEventos.style.display = 'block';
        }
    }

    btnListaServicos?.addEventListener('click', () => {
        modoLista = 'servicos';
        btnListaServicos.classList.add('active');
        btnListaEventos.classList.remove('active');
        inputBusca.value = '';
        btnLimparBusca.style.display = 'none';
        aplicarModoLista();
        atualizarUIListaEMapa(todosOsServicos);
    });

    btnListaEventos?.addEventListener('click', () => {
        modoLista = 'eventos';
        btnListaEventos.classList.add('active');
        btnListaServicos.classList.remove('active');
        inputBusca.value = '';
        btnLimparBusca.style.display = 'none';
        aplicarModoLista();
        renderizarEventosHome(todosOsEventos);
    });

    // Busca principal agora depende do modoLista
    async function executarBusca() {
        const termo = (inputBusca.value || '').trim();
        if (!termo) {
            if (modoLista === 'servicos') {
                atualizarUIListaEMapa(todosOsServicos);
            } else {
                renderizarEventosHome(todosOsEventos);
            }
            btnLimparBusca.style.display = 'none';
            return;
        }
        btnLimparBusca.style.display = 'inline-block';
        if (modoLista === 'servicos') {
            loadingServicosSpinner.style.display = 'block';
            listaServicosContainer.innerHTML = '';
            nenhumServicoDiv.style.display = 'none';
        } else {
            loadingEventosHome.style.display = 'block';
            listaEventosHome.innerHTML = '';
            nenhumEventoHome.style.display = 'none';
        }
        try {
            if (modoLista === 'servicos') {
                const resultados = await pontoService.buscarPontos(termo);
                atualizarUIListaEMapa(resultados);
            } else {
                const r = await fetch(`/api/eventos/search?q=${encodeURIComponent(termo)}`);
                if (!r.ok) throw new Error('Falha ao buscar eventos');
                const resultados = await r.json();
                // Renderiza diretamente os resultados do servidor (ignora filtros locais)
                renderizarEventosHome(resultados, { raw: true });
            }
        } catch (err) {
            console.error('Busca falhou:', err);
            if (modoLista === 'servicos') {
                listaServicosContainer.innerHTML = `<div class="alert alert-warning m-2">Não foi possível buscar por "${termo}".</div>`;
            } else {
                listaEventosHome.innerHTML = `<div class="alert alert-warning m-2">Não foi possível buscar por "${termo}".</div>`;
            }
        } finally {
            loadingServicosSpinner.style.display = 'none';
            loadingEventosHome.style.display = 'none';
        }
    }

    function limparBusca() {
        inputBusca.value = '';
        btnLimparBusca.style.display = 'none';
        if (modoLista === 'servicos') {
            atualizarUIListaEMapa(todosOsServicos);
        } else {
            renderizarEventosHome(todosOsEventos);
        }
    }

    if (btnBuscar) btnBuscar.addEventListener('click', executarBusca);
    if (inputBusca) {
        inputBusca.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); executarBusca(); }
        });
        inputBusca.addEventListener('input', () => {
            btnLimparBusca.style.display = inputBusca.value.trim() ? 'inline-block' : 'none';
        });
    }
    if (btnLimparBusca) btnLimparBusca.addEventListener('click', limparBusca);

    function centralizarNaMinhaLocalizacao() {
        if (!navigator.geolocation) { alert('Geolocalização não é suportada por este navegador.'); return; }
        const btnIcon = btnCentralizarLocalizacao.querySelector('i');
        const btnText = btnCentralizarLocalizacao.querySelector('span');
        const originalIcon = btnIcon.className;
        btnIcon.className = 'fas fa-spinner fa-spin';
        if (btnText) btnText.textContent = 'Localizando...';
        btnCentralizarLocalizacao.disabled = true;
        const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 };
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                const userIcon = L.divIcon({ className: 'user-location-marker', html: '<i class="fas fa-user-circle"></i>', iconSize: [30, 30], iconAnchor: [15, 15] });
                userLocationMarker = L.marker([lat, lng], { icon: userIcon })
                    .addTo(map)
                    .bindPopup(`
                        <div class="popup-content">
                            <h6><i class="fas fa-user-circle me-1"></i>Sua Localização</h6>
                            <p><small><i class="fas fa-crosshairs me-1"></i>Precisão: ${Math.round(accuracy)}m</small></p>
                        </div>
                    `);
                map.setView([lat, lng], 16);
                btnIcon.className = originalIcon;
                if (btnText) btnText.textContent = 'Minha Localização';
                btnCentralizarLocalizacao.disabled = false;
            },
            function(error) {
                btnIcon.className = originalIcon;
                if (btnText) btnText.textContent = 'Minha Localização';
                btnCentralizarLocalizacao.disabled = false;
                let mensagemErro = 'Erro ao obter localização.';
                switch(error.code) {
                    case error.PERMISSION_DENIED: mensagemErro = 'Permissão de localização negada. Permita o acesso à localização nas configurações do navegador.'; break;
                    case error.POSITION_UNAVAILABLE: mensagemErro = 'Informações de localização não disponíveis.'; break;
                    case error.TIMEOUT: mensagemErro = 'Tempo limite excedido ao tentar obter localização.'; break;
                }
                alert(mensagemErro);
                console.error('Erro de geolocalização:', error);
            }, options);
    }

    function atualizarUIAposLogin() { renderizarAreaUsuario(); }
    window.atualizarUIAposLogin = atualizarUIAposLogin;

    function verificarDadosAutenticacao() {
        const dadosUsuario = localStorage.getItem('usuarioAutenticado');
        const token = localStorage.getItem('authToken');
        if (dadosUsuario && !token) { localStorage.removeItem('usuarioAutenticado'); localStorage.removeItem('authToken'); }
        if (token && !dadosUsuario) { localStorage.removeItem('usuarioAutenticado'); localStorage.removeItem('authToken'); }
    }

    function init() {
        verificarDadosAutenticacao();
        renderizarAreaUsuario();
        btnAtualizarLista.addEventListener('click', carregarServicos);
        if (btnAtualizarEventosHome) btnAtualizarEventosHome.addEventListener('click', carregarEventosHome);
        btnCentralizarLocalizacao.addEventListener('click', centralizarNaMinhaLocalizacao);
        carregarServicos();
        carregarEventosHome();
        aplicarModoLista(); // inicia em serviços
    }

    init();
});