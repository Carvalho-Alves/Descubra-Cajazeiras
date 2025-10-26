import pontoService from './service/pontoService.js';
import { renderizarLista, renderizarMarcadores, selecionarItemListaPorId } from './utils/mapListRenderer.js';


document.addEventListener('DOMContentLoaded', () => {
    const usuarioArea = document.getElementById('usuario-area');
    const btnNovoPonto = document.getElementById('btnNovoPonto');
    const btnDashboard = document.getElementById('btnDashboard');
    const btnVerServicosTop = document.getElementById('btnVerServicos');
    const btnVerEventosTop = document.getElementById('btnVerEventos');
    const btnAtualizarLista = document.getElementById('btnAtualizarLista');
    const btnCentralizarLocalizacao = document.getElementById('btnCentralizarLocalizacao');
    const inputBusca = document.getElementById('inputBusca');
    const btnBuscar = document.getElementById('btnBuscar');
    const btnLimparBusca = document.getElementById('btnLimparBusca');
    const btnListaServicos = document.getElementById('btnListaServicos');
    const btnListaEventos = document.getElementById('btnListaEventos');
    const filtrosTipo = document.querySelectorAll('input[name="filtroTipo"]');

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
    let filtroServicoAtual = '';

    // Estado da coluna lateral (lista e busca)
    let modoLista = 'servicos'; // 'servicos' | 'eventos'

    function renderizarAreaUsuario() {
        const dadosUsuario = pontoService.getUsuarioAutenticado();
        const token = localStorage.getItem('authToken');
        const usuarioLogado = dadosUsuario !== null && token !== null;
        if (usuarioLogado) {
            const nomeUsuario = dadosUsuario.user?.nome || dadosUsuario.nome || 'Usuário';
            // Resolve URL da foto
            const fotoRaw = dadosUsuario.user?.foto || dadosUsuario.foto || '';
            let avatarUrl = 'assets/images/default-avatar.svg';
            if (fotoRaw) {
                if (typeof fotoRaw === 'string' && (fotoRaw.startsWith('http') || fotoRaw.startsWith('/'))) {
                    avatarUrl = fotoRaw;
                } else {
                    const m = String(fotoRaw).match(/uploads[\\/].*$/i);
                    if (m) avatarUrl = '/' + m[0].replace(/\\/g, '/');
                }
            }
            // Cache-buster baseado em updatedAt ou flag local
            try {
                const storedVersion = localStorage.getItem('avatarVersion');
                const updatedAtRaw = (dadosUsuario.user?.updatedAt || dadosUsuario.updatedAt);
                const version = storedVersion || (updatedAtRaw ? String(new Date(updatedAtRaw).getTime()) : '');
                if (version && avatarUrl && !avatarUrl.startsWith('assets/')) {
                    const joinChar = avatarUrl.includes('?') ? '&' : '?';
                    avatarUrl = `${avatarUrl}${joinChar}v=${encodeURIComponent(version)}`;
                }
            } catch {}
            usuarioArea.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-primary dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown">
                        <img src="${avatarUrl}" alt="Avatar" class="avatar-img rounded-circle me-2" style="width:28px;height:28px;object-fit:cover;" onerror="this.onerror=null;this.src='assets/images/default-avatar.svg';this.classList.add('loaded');" onload="this.classList.add('loaded')"> ${nomeUsuario}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="#" id="btnPerfil"><i class="fas fa-user me-2"></i>Perfil</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" id="btnSair"><i class="fas fa-sign-out-alt me-2"></i>Sair</a></li>
                    </ul>
                </div>`;
            if (btnNovoPonto) btnNovoPonto.style.display = 'inline-block';
            if (btnDashboard) btnDashboard.style.display = 'inline-block';
            if (btnVerServicosTop) btnVerServicosTop.style.display = 'inline-block';
            if (btnVerEventosTop) btnVerEventosTop.style.display = 'inline-block';
            document.getElementById('btnSair')?.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Deseja realmente sair?')) pontoService.logoutUsuario();
            });
            document.getElementById('btnPerfil')?.addEventListener('click', (e) => {
                e.preventDefault();
                abrirModalPerfilUsuario();
            });
        } else {
            usuarioArea.innerHTML = `<a href="auth.html" class="btn btn-primary"><i class="fas fa-sign-in-alt me-2"></i>Entrar</a>`;
            if (btnNovoPonto) btnNovoPonto.style.display = 'none';
            if (btnDashboard) btnDashboard.style.display = 'none';
            if (btnVerServicosTop) btnVerServicosTop.style.display = 'none';
            if (btnVerEventosTop) btnVerEventosTop.style.display = 'none';
        }
    }

    // ===== Perfil do Usuário =====
    const modalEditarUsuario = document.getElementById('modalEditarUsuario');
    const formEditarUsuario = document.getElementById('form-editar-usuario');
    const editUserId = document.getElementById('edit-userId');
    const editNome = document.getElementById('edit-nome');
    const editEmail = document.getElementById('edit-email');
    const editRole = document.getElementById('edit-role');
    const editFotoInput = document.getElementById('edit-foto');
    const editFotoPreview = document.getElementById('edit-foto-preview');
    const editAlertContainer = document.getElementById('edit-user-alert-container');

    function showEditAlert(message, type='info'){
        if (!editAlertContainer) return;
        editAlertContainer.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
    }

    function preencherFormularioPerfil(dados){
        if (!dados) return;
        const u = dados.user || dados;
        if (editUserId) editUserId.value = u._id || '';
        if (editNome) editNome.value = u.nome || '';
        if (editEmail) editEmail.value = u.email || '';
        if (editRole) {
            const role = (u.role || 'Turista');
            editRole.value = /^admin$/i.test(role) ? 'admin' : 'turista';
            // Desabilita alteração de role para não-admins
            if (!/^Admin$/.test(role)) {
                editRole.setAttribute('disabled','disabled');
            } else {
                editRole.removeAttribute('disabled');
            }
        }
        if (editFotoPreview) {
            let src = 'assets/images/default-avatar.svg';
            if (u.foto) {
                if (u.foto.startsWith('http') || u.foto.startsWith('/')) {
                    src = u.foto;
                } else {
                    const m = String(u.foto).match(/uploads[\\/].*$/i);
                    src = m ? ('/' + m[0].replace(/\\/g,'/')) : 'assets/images/default-avatar.svg';
                }
            }
            editFotoPreview.src = src;
        }
        if (editFotoInput) editFotoInput.value = '';
        if (editAlertContainer) editAlertContainer.innerHTML = '';
    }

    function abrirModalPerfilUsuario(){
        const dadosUsuario = pontoService.getUsuarioAutenticado();
        if (!dadosUsuario) { window.location.href = 'auth.html'; return; }
        preencherFormularioPerfil(dadosUsuario);
        if (modalEditarUsuario) {
            const modal = new bootstrap.Modal(modalEditarUsuario);
            modal.show();
        }
    }

    if (editFotoInput) {
        editFotoInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const maxBytes = 5 * 1024 * 1024;
            if (file.size > maxBytes) { showEditAlert('A imagem excede 5MB. Escolha um arquivo menor.', 'warning'); editFotoInput.value=''; return; }
            const reader = new FileReader();
            reader.onload = () => { if (editFotoPreview) editFotoPreview.src = reader.result; };
            reader.readAsDataURL(file);
        });
    }

    if (formEditarUsuario) {
        formEditarUsuario.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usuarioAuth = pontoService.getUsuarioAutenticado();
            const token = localStorage.getItem('authToken');
            const u = usuarioAuth?.user || usuarioAuth;
            const userId = (editUserId?.value || u?._id || '').toString();
            if (!userId) { showEditAlert('ID do usuário não encontrado.', 'danger'); return; }
            const formData = new FormData();
            if (editNome && editNome.value.trim()) formData.append('nome', editNome.value.trim());
            if (editEmail && editEmail.value.trim()) formData.append('email', editEmail.value.trim());
            if (editRole && !editRole.disabled) {
                // Normaliza para valores aceitos pelo backend
                const roleValue = editRole.value === 'admin' ? 'Admin' : 'Turista';
                formData.append('role', roleValue);
            }
            if (editFotoInput && editFotoInput.files && editFotoInput.files[0]) {
                formData.append('foto', editFotoInput.files[0]);
            }

            try {
                showEditAlert('<i class="fas fa-spinner fa-spin me-2"></i>Salvando...', 'info');
                const resp = await fetch(`/api/auth/${encodeURIComponent(userId)}` , {
                    method: 'PUT',
                    headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
                    body: formData
                });
                if (!resp.ok) {
                    let msg = 'Falha ao atualizar usuário';
                    try { const err = await resp.json(); if (err?.message) msg = err.message; } catch {}
                    showEditAlert(msg, 'danger');
                    return;
                }
                const updatedUser = await resp.json();
                // Atualiza localStorage preservando token
                const stored = pontoService.getUsuarioAutenticado();
                const tokenAtual = localStorage.getItem('authToken');
                const novoObj = stored && stored.user ? { ...stored, user: { ...(stored.user), ...updatedUser } } : { ...updatedUser };
                localStorage.setItem('usuarioAutenticado', JSON.stringify(novoObj));
                if (tokenAtual) localStorage.setItem('authToken', tokenAtual);
                showEditAlert('Dados atualizados com sucesso!', 'success');
                // Atualiza UI do topo
                renderizarAreaUsuario();
                // Atualiza prévia com caminho retornado
                if (updatedUser.foto && editFotoPreview) {
                    const m = String(updatedUser.foto).match(/uploads[\\/].*$/i);
                    let src = m ? ('/' + m[0].replace(/\\/g,'/')) : editFotoPreview.src;
                    // bust cache da prévia para refletir a nova imagem
                    const joinChar = src.includes('?') ? '&' : '?';
                    src = `${src}${joinChar}v=${Date.now()}`;
                    editFotoPreview.src = src;
                }
                // Atualiza versão do avatar para bust de cache no botão do usuário
                try { localStorage.setItem('avatarVersion', String(Date.now())); } catch {}
            } catch (err) {
                console.error(err);
                showEditAlert('Erro inesperado ao salvar.', 'danger');
            }
        });
    }

    function getUserContext(){
        const u = pontoService.getUsuarioAutenticado();
        const base = u?.user || u || null;
        const userId = base?._id || null;
        const roleRaw = base?.role || 'Turista';
        const isAdmin = /^admin$/i.test(String(roleRaw));
        return { userId, isAdmin };
    }

    function normalizeImageUrl(raw){
        if (!raw) return '';
        if (Array.isArray(raw)) raw = raw[0];
        if (!raw) return '';
        if (typeof raw !== 'string') return '';
        if (raw.startsWith('http') || raw.startsWith('/')) return raw;
        const m = raw.match(/uploads[\\/].*$/i);
        if (m) return '/' + m[0].replace(/\\/g,'/');
        return '';
    }

    function normalizarTipoServico(s){
        return (s?.tipo || s?.tipo_servico || s?.categoria || '').toString();
    }

    function aplicarFiltroServicos(base){
        if (!filtroServicoAtual) return base;
        const alvo = filtroServicoAtual.toLowerCase();
        return base.filter(s => normalizarTipoServico(s).toLowerCase() === alvo);
    }

    function atualizarUIListaEMapa(servicos) {
        const filtrados = aplicarFiltroServicos(servicos);
        renderizarLista(filtrados, listaServicosContainer);
        const { userId, isAdmin } = getUserContext();
        markersById = renderizarMarcadores(map, camadaServicos, filtrados, {
            onMarkerClick: (s) => selecionarItemLista(s),
            buildPopup: (s) => {
                const tipo = (s.tipo || s.tipo_servico || s.categoria || '').toString();
                const desc = s.descricao ? String(s.descricao).substring(0, 100) + '...' : '';
                const ownerId = (s.usuario && typeof s.usuario === 'object') ? (s.usuario._id || s.usuario.id) : s.usuario;
                const canManage = Boolean(isAdmin || (userId && ownerId && String(ownerId) === String(userId)));
                const img = normalizeImageUrl(s.imagem || s.imagens);
                const imgHtml = img ? `<div class="mb-2 text-center"><img src="${img}" alt="Imagem do serviço" style="max-width:220px;max-height:130px;object-fit:cover;border-radius:6px;" onerror="this.style.display='none';"></div>` : '';
                const manageHtml = canManage ? `
                    <div class='btn-group btn-group-sm w-100'>
                        <a class='btn btn-primary' href='servicos.html'><i class="fas fa-external-link-alt me-1"></i>Gerenciar</a>
                    </div>` : '';
                const avalHtml = s._id ? `
                    <div class='btn-group btn-group-sm w-100 mt-1'>
                        <button class='btn btn-outline-secondary' onclick='avaliacoesUI.abrir("servico", "${s._id}", ${JSON.stringify(s.nome||'Serviço')})'><i class="fas fa-star me-1"></i>Avaliações</button>
                    </div>` : '';
                return `
                    <div class='popup-servico'>
                        <h6>${s.nome || 'Serviço'}</h6>
                        <small class="text-muted">${tipo || 'Serviço'}</small>
                        ${imgHtml}
                        <p>${desc}</p>
                        ${manageHtml}
                        ${avalHtml}
                    </div>`;
            }
        });
        nenhumServicoDiv.style.display = filtrados.length === 0 ? 'block' : 'none';
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
        // 1) localizacao { latitude, longitude }
        let lat = typeof loc.latitude === 'string'? parseFloat(loc.latitude): loc.latitude;
        let lng = typeof loc.longitude === 'string'? parseFloat(loc.longitude): loc.longitude;
        if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) return [lat,lng];

        // 2) topo do objeto (compat para registros antigos)
        lat = typeof ev.latitude === 'string' ? parseFloat(ev.latitude) : ev.latitude;
        lng = typeof ev.longitude === 'string' ? parseFloat(ev.longitude) : ev.longitude;
        if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) return [lat,lng];

        // 3) GeoJSON coordinates [lng, lat]
        if (Array.isArray(loc.coordinates) && loc.coordinates.length>=2){
            const lng2 = typeof loc.coordinates[0]==='string'? parseFloat(loc.coordinates[0]): loc.coordinates[0];
            const lat2 = typeof loc.coordinates[1]==='string'? parseFloat(loc.coordinates[1]): loc.coordinates[1];
            if (typeof lat2==='number' && typeof lng2==='number' && !Number.isNaN(lat2) && !Number.isNaN(lng2)) return [lat2,lng2];
        }
        return null;
    }

    let filtroEventoAtual = '';
    let termoBuscaEventos = '';

    function getStatusComputado(ev){
        const raw = (ev.status || 'ativo').toLowerCase();
        if (raw === 'cancelado') return 'cancelado';
        if (raw === 'encerrado') return 'encerrado';
        const dataEv = ev.data ? new Date(ev.data) : null;
        if (dataEv && !Number.isNaN(dataEv.getTime())){
            const agora = new Date();
            if (dataEv.getTime() < agora.getTime()) return 'encerrado';
        }
        return 'ativo';
    }

    function filtrarEBuscarEventos(base){
        let arr = [...base];
        if (filtroEventoAtual) arr = arr.filter(e => getStatusComputado(e) === filtroEventoAtual);
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
            const statusComp = getStatusComputado(ev);
            const badgeClass = statusComp === 'ativo' ? 'bg-success' : (statusComp === 'cancelado' ? 'bg-danger' : 'bg-secondary');
            const nomeEv = ev.nome || 'Evento';
            a.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1"><i class="fas fa-calendar me-2 text-primary"></i>${nomeEv}</h6>
                        <small class="text-muted">
                            <i class="fas fa-calendar-day me-1"></i>${ev.data? new Date(ev.data).toLocaleDateString('pt-BR'): ''}
                            <span class="badge ${badgeClass} text-uppercase ms-2">${statusComp}</span>
                        </small>
                            <p class="mb-0">${ev.descricao? String(ev.descricao).substring(0,80)+'...': ''}</p>
                    </div>
                    <div class="ms-2 d-flex align-items-start item-actions">
                        ${ev._id ? `
                            <button type="button" class="btn btn-outline-secondary btn-sm" onclick='event.stopPropagation();event.preventDefault();avaliacoesUI.abrir("evento", "${String(ev._id)}", ${JSON.stringify(nomeEv)})'>
                                <i class="fas fa-star me-1"></i>Avaliações
                            </button>
                        ` : ''}
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
            const statusPopup = getStatusComputado(ev);
            const badgeClass = statusPopup === 'ativo' ? 'bg-success' : (statusPopup === 'cancelado' ? 'bg-danger' : 'bg-secondary');
            const { userId, isAdmin } = getUserContext();
            const ownerId = (ev.usuario && typeof ev.usuario === 'object') ? (ev.usuario._id || ev.usuario.id) : ev.usuario;
            const canManage = Boolean(isAdmin || (userId && ownerId && String(ownerId) === String(userId)));
            const img = normalizeImageUrl(ev.imagem);
            const imgHtml = img ? `<div class="mb-2 text-center"><img src="${img}" alt="Imagem do evento" style="max-width:220px;max-height:130px;object-fit:cover;border-radius:6px;" onerror="this.style.display='none';"></div>` : '';
            const manageHtml = canManage ? `
                <div class='btn-group btn-group-sm w-100'>
                    <a class='btn btn-primary' href='eventos.html'><i class="fas fa-external-link-alt me-1"></i>Gerenciar</a>
                </div>` : '';
            const avalHtml = ev._id ? `
                <div class='btn-group btn-group-sm w-100 mt-1'>
                    <button class='btn btn-outline-secondary' onclick='avaliacoesUI.abrir("evento", "${ev._id}", ${JSON.stringify(ev.nome||'Evento')})'><i class="fas fa-star me-1"></i>Avaliações</button>
                </div>` : '';
            m.bindPopup(`
                <div class='popup-servico'>
                    <h6>${ev.nome||'Evento'}</h6>
                    <small>
                      <span class="badge ${badgeClass} text-uppercase me-2">${statusPopup}</span>
                      ${ev.data? new Date(ev.data).toLocaleDateString('pt-BR'):''}
                    </small>
                    ${imgHtml}
                    <p>${ev.descricao? String(ev.descricao).substring(0,100)+'...': ''}</p>
                    ${manageHtml}
                    ${avalHtml}
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

    // Filtros de tipo de serviço (Todos | Hospedagem | Alimentação/Lazer | Ponto Turístico)
    if (filtrosTipo && filtrosTipo.length) {
        filtrosTipo.forEach(r => r.addEventListener('change', (e) => {
            filtroServicoAtual = e.target.value || '';
            const termo = (inputBusca?.value || '').trim();
            if (modoLista === 'servicos') {
                if (termo) {
                    // Reaplica busca e filtra localmente
                    executarBusca();
                } else {
                    atualizarUIListaEMapa(todosOsServicos);
                }
            }
        }));
    }

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